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

router.use('/ubicaciones', crudRoutes('alm_ubicaciones', '*', 'codigo'));

router.get('/recepciones', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, oc.numero as oc_numero, p.nombre as proveedor_nombre
    FROM alm_recepciones r
    LEFT JOIN com_ordenes_compra oc ON r.oc_id = oc.id
    LEFT JOIN com_proveedores p ON oc.proveedor_id = p.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/recepciones', (req, res) => {
  const db = getDb();
  const { oc_id, fecha, items_recibidos, usuario_id } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO alm_recepciones (id, oc_id, fecha, items_recibidos, usuario_id)
    VALUES (?,?,?,?,?)`).run(id, oc_id, fecha || new Date().toISOString().slice(0, 10), JSON.stringify(items_recibidos || []), usuario_id || null);
  res.status(201).json({ id });
});

router.get('/despachos', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.*, ov.numero as ov_numero, c.nombre as cliente_nombre
    FROM alm_despachos d
    LEFT JOIN vta_ordenes_venta ov ON d.ov_id = ov.id
    LEFT JOIN vta_clientes c ON ov.cliente_id = c.id
    ORDER BY d.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/despachos', (req, res) => {
  const db = getDb();
  const { ov_id, fecha, items_despachados, usuario_id } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO alm_despachos (id, ov_id, fecha, items_despachados, usuario_id)
    VALUES (?,?,?,?,?)`).run(id, ov_id, fecha || new Date().toISOString().slice(0, 10), JSON.stringify(items_despachados || []), usuario_id || null);
  res.status(201).json({ id });
});

router.get('/conteos-fisicos', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*, b.nombre as bodega_nombre
    FROM alm_conteos_fisicos c
    JOIN inv_bodegas b ON c.bodega_id = b.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/conteos-fisicos', (req, res) => {
  const db = getDb();
  const { bodega_id, fecha, items_conteo, usuario_id } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO alm_conteos_fisicos (id, bodega_id, fecha, items_conteo, usuario_id)
    VALUES (?,?,?,?,?)`).run(id, bodega_id, fecha || new Date().toISOString().slice(0, 10), JSON.stringify(items_conteo || []), usuario_id || null);
  res.status(201).json({ id });
});

router.post('/conteos-fisicos/:id/ajustar', (req, res) => {
  const db = getDb();
  const conteo = db.prepare('SELECT * FROM alm_conteos_fisicos WHERE id = ?').get(req.params.id);
  if (!conteo) return res.status(404).json({ error: 'Conteo no encontrado' });
  const items = JSON.parse(conteo.items_conteo || '[]');
  const stmt = db.prepare(`UPDATE inv_existencias SET cantidad = ?, updated_at = datetime('now') WHERE producto_id = ? AND bodega_id = ?`);
  for (const item of items) {
    const existing = db.prepare('SELECT id FROM inv_existencias WHERE producto_id = ? AND bodega_id = ?').get(item.producto_id, conteo.bodega_id);
    if (existing) {
      stmt.run(item.cantidad_real, item.producto_id, conteo.bodega_id);
    } else {
      db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(uuidv4(), item.producto_id, conteo.bodega_id, item.cantidad_real);
    }
  }
  db.prepare('UPDATE alm_conteos_fisicos SET ajustado = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
