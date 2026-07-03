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

router.use('/productos', crudRoutes('inv_productos', '*', 'nombre'));
router.use('/bodegas', crudRoutes('inv_bodegas', '*', 'nombre'));
router.use('/lotes', crudRoutes('inv_lotes', '*', 'codigo_lote'));

router.get('/existencias', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.*, p.nombre as producto_nombre, p.codigo as producto_codigo, b.nombre as bodega_nombre
    FROM inv_existencias e
    JOIN inv_productos p ON e.producto_id = p.id
    JOIN inv_bodegas b ON e.bodega_id = b.id
    ORDER BY p.nombre
  `).all();
  res.json(rows);
});

router.post('/existencias', (req, res) => {
  const db = getDb();
  const { producto_id, bodega_id, cantidad } = req.body;
  const existing = db.prepare('SELECT id FROM inv_existencias WHERE producto_id = ? AND bodega_id = ?').get(producto_id, bodega_id);
  if (existing) {
    db.prepare("UPDATE inv_existencias SET cantidad = cantidad + ?, updated_at = datetime('now') WHERE id = ?").run(cantidad || 0, existing.id);
    return res.json({ ok: true, updated: true });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(id, producto_id, bodega_id, cantidad || 0);
  res.status(201).json({ id });
});

router.get('/movimientos', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, p.nombre as producto_nombre, b.nombre as bodega_nombre, b2.nombre as bodega_destino_nombre
    FROM inv_movimientos m
    JOIN inv_productos p ON m.producto_id = p.id
    LEFT JOIN inv_bodegas b ON m.bodega_id = b.id
    LEFT JOIN inv_bodegas b2 ON m.bodega_destino_id = b2.id
    ORDER BY m.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/movimientos', (req, res) => {
  const db = getDb();
  const { tipo, producto_id, bodega_id, bodega_destino_id, cantidad, costo_unitario, referencia, notas, usuario_id } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO inv_movimientos (id, tipo, producto_id, bodega_id, bodega_destino_id, cantidad, costo_unitario, referencia, usuario_id, notas)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, tipo, producto_id, bodega_id || null, bodega_destino_id || null, cantidad || 0,
    costo_unitario || null, referencia || null, usuario_id || null, notas || null);
  if (tipo === 'entrada' || tipo === 'salida') {
    const signo = tipo === 'entrada' ? 1 : -1;
    const existing = db.prepare('SELECT id FROM inv_existencias WHERE producto_id = ? AND bodega_id = ?').get(producto_id, bodega_id);
    if (existing) {
      db.prepare("UPDATE inv_existencias SET cantidad = cantidad + (? * ?), updated_at = datetime('now') WHERE id = ?").run(signo, Math.abs(cantidad), existing.id);
    } else if (tipo === 'entrada') {
      db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(uuidv4(), producto_id, bodega_id, cantidad);
    }
  }
  if (tipo === 'transferencia' && bodega_destino_id) {
    const saldo = db.prepare('SELECT id FROM inv_existencias WHERE producto_id = ? AND bodega_id = ?').get(producto_id, bodega_destino_id);
    if (saldo) {
      db.prepare("UPDATE inv_existencias SET cantidad = cantidad + ?, updated_at = datetime('now') WHERE id = ?").run(cantidad, saldo.id);
    } else {
      db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(uuidv4(), producto_id, bodega_destino_id, cantidad);
    }
  }
  res.status(201).json({ id });
});

router.get('/alertas-stock', (req, res) => {
  const db = getDb();
  const bajo = db.prepare(`
    SELECT p.id, p.nombre, p.codigo, p.stock_minimo, e.cantidad as stock_actual, b.nombre as bodega
    FROM inv_productos p
    JOIN inv_existencias e ON e.producto_id = p.id
    JOIN inv_bodegas b ON e.bodega_id = b.id
    WHERE p.stock_minimo > 0 AND e.cantidad <= p.stock_minimo
    ORDER BY (e.cantidad - p.stock_minimo) ASC
  `).all();
  res.json(bajo);
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalProductos = db.prepare('SELECT COUNT(*) as count FROM inv_productos WHERE activo = 1').get();
  const totalBodegas = db.prepare('SELECT COUNT(*) as count FROM inv_bodegas WHERE activo = 1').get();
  const stockBajo = db.prepare(`SELECT COUNT(*) as count FROM inv_productos p
    JOIN inv_existencias e ON e.producto_id = p.id
    WHERE p.stock_minimo > 0 AND e.cantidad <= p.stock_minimo`).get();
  const ultimosMovimientos = db.prepare(`
    SELECT m.*, p.nombre as producto_nombre FROM inv_movimientos m
    JOIN inv_productos p ON m.producto_id = p.id
    ORDER BY m.created_at DESC LIMIT 10
  `).all();
  res.json({ totalProductos: totalProductos.count, totalBodegas: totalBodegas.count, stockBajo: stockBajo.count, ultimosMovimientos });
});

export default router;
