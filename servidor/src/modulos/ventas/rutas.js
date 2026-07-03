import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../database.js';
import { authMiddleware } from '../../auth.js';

const router = Router();
router.use(authMiddleware);

function crudRoutes(table, fields = '*', orderBy = 'created_at DESC') {
  const r = Router({ mergeParams: true });
  r.get('/', (req, res) => {
    const db = getDb();
    res.json(db.prepare(`SELECT ${fields} FROM ${table} ORDER BY ${orderBy}`).all());
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
    const ph = keys.map(() => '?').join(',');
    db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${ph})`).run(...values);
    res.status(201).json(data);
  });
  r.put('/:id', (req, res) => {
    const db = getDb();
    const { id, created_at, ...updates } = req.body;
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'Sin datos' });
    const set = keys.map(k => `${k} = ?`).join(',');
    db.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).run(...Object.values(updates), req.params.id);
    res.json({ ok: true });
  });
  r.delete('/:id', (req, res) => {
    const db = getDb();
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });
  return r;
}

router.use('/clientes', crudRoutes('vta_clientes', '*', 'nombre'));
router.use('/cotizaciones', crudRoutes('vta_cotizaciones', '*', 'created_at DESC'));
router.use('/comisiones', crudRoutes('vta_comisiones', '*', 'created_at DESC'));

router.get('/ordenes-venta', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT o.*, c.nombre as cliente_nombre, u.nombre as vendedor_nombre
    FROM vta_ordenes_venta o
    LEFT JOIN vta_clientes c ON o.cliente_id = c.id
    LEFT JOIN core_usuarios u ON o.vendedor_id = u.id
    ORDER BY o.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/ordenes-venta', (req, res) => {
  const db = getDb();
  const { cliente_id, cotizacion_id, fecha, items, subtotal, descuento, itbms, total, metodo_pago, vendedor_id, notas } = req.body;
  const id = uuidv4();
  const numero = `OV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  db.prepare(`INSERT INTO vta_ordenes_venta (id, numero, cliente_id, cotizacion_id, fecha, items, subtotal, descuento, itbms, total, metodo_pago, vendedor_id, notas)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, numero, cliente_id || null, cotizacion_id || null, fecha || new Date().toISOString().slice(0, 10),
    JSON.stringify(items || []), subtotal || 0, descuento || 0, itbms || 0, total || 0, metodo_pago || null, vendedor_id || null, notas || null);
  if (cotizacion_id) {
    db.prepare("UPDATE vta_cotizaciones SET estado = 'convertida' WHERE id = ?").run(cotizacion_id);
  }
  res.status(201).json({ id, numero });
});

router.put('/ordenes-venta/:id/estado', (req, res) => {
  const db = getDb();
  const { estado } = req.body;
  db.prepare('UPDATE vta_ordenes_venta SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});

router.get('/facturas', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT f.*, c.nombre as cliente_nombre
    FROM vta_facturas f
    LEFT JOIN vta_clientes c ON f.cliente_id = c.id
    ORDER BY f.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/facturas', (req, res) => {
  const db = getDb();
  const { orden_venta_id, cliente_id, fecha, tipo, subtotal, itbms, descuento, total, items, cufe } = req.body;
  const id = uuidv4();
  const numero = `F-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  db.prepare(`INSERT INTO vta_facturas (id, numero, orden_venta_id, cliente_id, fecha, tipo, subtotal, itbms, descuento, total, items, cufe)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, numero, orden_venta_id || null, cliente_id || null, fecha || new Date().toISOString().slice(0, 10),
    tipo || 'factura', subtotal || 0, itbms || 0, descuento || 0, total || 0, JSON.stringify(items || []), cufe || null);
  if (orden_venta_id) {
    db.prepare("UPDATE vta_ordenes_venta SET estado = 'facturada' WHERE id = ?").run(orden_venta_id);
  }
  res.status(201).json({ id, numero });
});

router.put('/facturas/:id/estado', (req, res) => {
  const db = getDb();
  const { estado } = req.body;
  db.prepare('UPDATE vta_facturas SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalClientes = db.prepare('SELECT COUNT(*) as count FROM vta_clientes WHERE activo = 1').get();
  const ventasHoy = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM vta_facturas WHERE date(fecha) = date('now')").get();
  const ventasMes = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM vta_facturas WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')").get();
  const pendientes = db.prepare("SELECT COUNT(*) as count FROM vta_ordenes_venta WHERE estado = 'pendiente'").get();
  const cotizacionesActivas = db.prepare("SELECT COUNT(*) as count FROM vta_cotizaciones WHERE estado = 'activa'").get();
  res.json({ totalClientes: totalClientes.count, ventasHoy: ventasHoy.total, ventasMes: ventasMes.total, pendientes: pendientes.count, cotizacionesActivas: cotizacionesActivas.count });
});

export default router;
