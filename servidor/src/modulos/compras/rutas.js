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

router.use('/proveedores', crudRoutes('com_proveedores', '*', 'nombre'));
router.use('/solicitudes', crudRoutes('com_solicitudes_compra', '*', 'created_at DESC'));

router.get('/ordenes-compra', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT o.*, p.nombre as proveedor_nombre
    FROM com_ordenes_compra o
    LEFT JOIN com_proveedores p ON o.proveedor_id = p.id
    ORDER BY o.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/ordenes-compra', (req, res) => {
  const db = getDb();
  const { proveedor_id, solicitud_id, fecha, fecha_estimada, items, subtotal, itbms, total } = req.body;
  const id = uuidv4();
  const numero = `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  db.prepare(`INSERT INTO com_ordenes_compra (id, numero, proveedor_id, solicitud_id, fecha, fecha_estimada, items, subtotal, itbms, total)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, numero, proveedor_id, solicitud_id || null, fecha || new Date().toISOString().slice(0, 10),
    fecha_estimada || null, JSON.stringify(items || []), subtotal || 0, itbms || 0, total || 0);
  if (solicitud_id) {
    db.prepare("UPDATE com_solicitudes_compra SET estado = 'ordenada' WHERE id = ?").run(solicitud_id);
  }
  res.status(201).json({ id, numero });
});

router.put('/ordenes-compra/:id/estado', (req, res) => {
  const db = getDb();
  const { estado } = req.body;
  db.prepare('UPDATE com_ordenes_compra SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});

router.get('/recepciones', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, oc.numero as oc_numero, p.nombre as proveedor_nombre, b.nombre as bodega_nombre
    FROM com_recepciones r
    LEFT JOIN com_ordenes_compra oc ON r.orden_compra_id = oc.id
    LEFT JOIN com_proveedores p ON oc.proveedor_id = p.id
    LEFT JOIN inv_bodegas b ON r.bodega_id = b.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/recepciones', (req, res) => {
  const db = getDb();
  const { orden_compra_id, fecha, items, bodega_id, usuario_id, notas } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO com_recepciones (id, orden_compra_id, fecha, items, bodega_id, usuario_id, notas)
    VALUES (?,?,?,?,?,?,?)`).run(id, orden_compra_id, fecha || new Date().toISOString().slice(0, 10),
    JSON.stringify(items || []), bodega_id, usuario_id || null, notas || null);
  const oc = db.prepare('SELECT estado FROM com_ordenes_compra WHERE id = ?').get(orden_compra_id);
  if (oc && oc.estado !== 'recibida') {
    db.prepare("UPDATE com_ordenes_compra SET estado = 'recibida_parcial' WHERE id = ?").run(orden_compra_id);
  }
  res.status(201).json({ id });
});

router.put('/solicitudes/:id/aprobar', (req, res) => {
  const db = getDb();
  const { aprobador_id } = req.body;
  db.prepare("UPDATE com_solicitudes_compra SET estado = 'aprobada', aprobador_id = ?, fecha_aprobacion = datetime('now') WHERE id = ?").run(aprobador_id || null, req.params.id);
  res.json({ ok: true });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalProveedores = db.prepare('SELECT COUNT(*) as count FROM com_proveedores WHERE activo = 1').get();
  const ocPendientes = db.prepare("SELECT COUNT(*) as count FROM com_ordenes_compra WHERE estado = 'pendiente'").get();
  const solicitudesPendientes = db.prepare("SELECT COUNT(*) as count FROM com_solicitudes_compra WHERE estado = 'pendiente'").get();
  const totalComprasMes = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM com_ordenes_compra WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')").get();
  res.json({ totalProveedores: totalProveedores.count, ocPendientes: ocPendientes.count, solicitudesPendientes: solicitudesPendientes.count, totalComprasMes: totalComprasMes.total });
});

export default router;
