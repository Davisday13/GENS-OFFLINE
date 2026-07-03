import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();
router.use(authMiddleware);

function crudRoutes(table, fields = '*', orderBy = 'created_at DESC') {
  const r = Router();
  r.get('/', (req, res) => {
    const db = getDb();
    const rows = db.prepare(`SELECT ${fields} FROM ${table} ORDER BY ${orderBy}`).all();
    res.json(rows);
  });
  r.get('/:id', (req, res) => {
    const db = getDb();
    const row = db.prepare(`SELECT ${fields} FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  });
  r.post('/', (req, res) => {
    const db = getDb();
    const data = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');
    db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`).run(...values);
    res.status(201).json(data);
  });
  r.put('/:id', (req, res) => {
    const db = getDb();
    const { id, created_at, ...updates } = req.body;
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'Sin datos' });
    const setClause = keys.map(k => `${k} = ?`).join(',');
    const values = Object.values(updates);
    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
    res.json({ ok: true });
  });
  r.delete('/:id', (req, res) => {
    const db = getDb();
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });
  return r;
}

router.use('/productos', crudRoutes('erp_productos', '*', 'nombre'));
router.use('/bodegas', crudRoutes('erp_bodegas', '*', 'nombre'));
router.use('/clientes', crudRoutes('erp_clientes', '*', 'nombre'));
router.use('/proveedores', crudRoutes('erp_proveedores', '*', 'nombre'));
router.use('/planilla', crudRoutes('erp_planilla', '*', 'created_at DESC'));

router.get('/inventario', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT i.*, p.nombre as producto_nombre, p.codigo as producto_codigo, b.nombre as bodega_nombre
    FROM erp_inventario i
    JOIN erp_productos p ON i.producto_id = p.id
    JOIN erp_bodegas b ON i.bodega_id = b.id
    ORDER BY p.nombre
  `).all();
  res.json(rows);
});

router.post('/inventario', (req, res) => {
  const db = getDb();
  const { producto_id, bodega_id, cantidad } = req.body;
  const existing = db.prepare('SELECT id FROM erp_inventario WHERE producto_id = ? AND bodega_id = ?').get(producto_id, bodega_id);
  if (existing) {
    db.prepare("UPDATE erp_inventario SET cantidad = cantidad + ?, updated_at = datetime('now') WHERE id = ?").run(cantidad || 0, existing.id);
    return res.json({ ok: true, updated: true });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO erp_inventario (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(id, producto_id, bodega_id, cantidad || 0);
  res.status(201).json({ id });
});

router.get('/facturas', (req, res) => {
  const db = getDb();
  const facturas = db.prepare(`
    SELECT f.*, c.nombre as cliente_nombre
    FROM erp_facturas f
    LEFT JOIN erp_clientes c ON f.cliente_id = c.id
    ORDER BY f.created_at DESC
  `).all();
  res.json(facturas);
});

router.post('/facturas', (req, res) => {
  const db = getDb();
  const { cliente_id, fecha, tipo, subtotal, itbms, descuento, total, items } = req.body;
  const id = uuidv4();
  const numero = `F-${String(Date.now()).slice(-6)}`;
  db.prepare(`INSERT INTO erp_facturas (id, numero, cliente_id, fecha, tipo, subtotal, itbms, descuento, total, items, estado)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(id, numero, cliente_id || null, fecha || new Date().toISOString().slice(0, 10),
    tipo || 'factura', subtotal || 0, itbms || 0, descuento || 0, total || 0, JSON.stringify(items || []), 'pendiente');
  res.status(201).json({ id, numero });
});

router.put('/facturas/:id/estado', (req, res) => {
  const db = getDb();
  const { estado } = req.body;
  db.prepare('UPDATE erp_facturas SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalProductos = db.prepare('SELECT COUNT(*) as count FROM erp_productos WHERE activo = 1').get();
  const totalClientes = db.prepare('SELECT COUNT(*) as count FROM erp_clientes WHERE activo = 1').get();
  const totalProveedores = db.prepare('SELECT COUNT(*) as count FROM erp_proveedores WHERE activo = 1').get();
  const ventasHoy = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM erp_facturas WHERE date(fecha) = date('now')").get();
  const ventasMes = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM erp_facturas WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')").get();
  const facturasPendientes = db.prepare("SELECT COUNT(*) as count FROM erp_facturas WHERE estado = 'pendiente'").get();
  const stockBajo = db.prepare('SELECT COUNT(*) as count FROM erp_productos WHERE stock > 0 AND stock <= stock_minimo').get();
  res.json({
    totalProductos: totalProductos.count,
    totalClientes: totalClientes.count,
    totalProveedores: totalProveedores.count,
    ventasHoy: ventasHoy.total,
    ventasMes: ventasMes.total,
    facturasPendientes: facturasPendientes.count,
    stockBajo: stockBajo.count,
  });
});

export default router;
