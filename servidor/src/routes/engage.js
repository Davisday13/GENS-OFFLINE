import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();

router.get('/qrs', authMiddleware, (req, res) => {
  const db = getDb();
  const qrs = db.prepare('SELECT * FROM engage_qrs ORDER BY created_at DESC').all();
  res.json(qrs);
});

router.post('/qrs', authMiddleware, (req, res) => {
  const db = getDb();
  const { nombre, url_destino, estilo } = req.body;
  const id = uuidv4();
  const shortId = id.slice(0, 8);
  db.prepare('INSERT INTO engage_qrs (id, nombre, url_destino, estilo) VALUES (?,?,?,?)')
    .run(id, nombre, url_destino, JSON.stringify(estilo || {}));
  res.status(201).json({
    id,
    nombre,
    url_destino,
    estilo: estilo || {},
    escaneos: 0,
    shortId,
    qr_url: `/api/engage/r/${shortId}`,
  });
});

router.put('/qrs/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { nombre, url_destino, estilo, activo } = req.body;
  const updates = [];
  const values = [];
  if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre); }
  if (url_destino !== undefined) { updates.push('url_destino = ?'); values.push(url_destino); }
  if (estilo !== undefined) { updates.push('estilo = ?'); values.push(JSON.stringify(estilo)); }
  if (activo !== undefined) { updates.push('activo = ?'); values.push(activo); }
  if (updates.length === 0) return res.status(400).json({ error: 'Sin datos' });
  values.push(req.params.id);
  db.prepare(`UPDATE engage_qrs SET ${updates.join(',')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/qrs/:id', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM engage_escaneos WHERE qr_id = ?').run(req.params.id);
  db.prepare('DELETE FROM engage_qrs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/r/:shortId', (req, res) => {
  const db = getDb();
  const qr = db.prepare("SELECT * FROM engage_qrs WHERE id LIKE ? || '%' AND activo = 1").get(req.params.shortId);
  if (!qr) return res.status(404).json({ error: 'QR no encontrado' });

  const escaneoId = uuidv4();
  db.prepare('INSERT INTO engage_escaneos (id, qr_id, ip, user_agent) VALUES (?,?,?,?)')
    .run(escaneoId, qr.id, req.ip, req.headers['user-agent'] || '');
  db.prepare('UPDATE engage_qrs SET escaneos = escaneos + 1 WHERE id = ?').run(qr.id);

  res.redirect(qr.url_destino);
});

router.get('/escaneos/:qrId', authMiddleware, (req, res) => {
  const db = getDb();
  const escaneos = db.prepare('SELECT * FROM engage_escaneos WHERE qr_id = ? ORDER BY created_at DESC').all(req.params.qrId);
  res.json(escaneos);
});

router.get('/analytics', authMiddleware, (req, res) => {
  const db = getDb();
  const totalQrs = db.prepare('SELECT COUNT(*) as count FROM engage_qrs').get();
  const totalEscaneos = db.prepare('SELECT COALESCE(SUM(escaneos),0) as total FROM engage_qrs').get();
  const itemsMenu = db.prepare('SELECT COUNT(*) as count FROM engage_menu_items').get();
  res.json({
    totalQrs: totalQrs.count,
    totalEscaneos: totalEscaneos.total,
    itemsMenu: itemsMenu.count,
  });
});

router.get('/menu', (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM engage_menu_items WHERE disponible = 1 ORDER BY categoria, nombre').all();
  res.json(items);
});

router.post('/menu', authMiddleware, (req, res) => {
  const db = getDb();
  const { nombre, descripcion, precio, categoria } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO engage_menu_items (id, nombre, descripcion, precio, categoria) VALUES (?,?,?,?,?)')
    .run(id, nombre, descripcion || '', precio || 0, categoria || 'general');
  res.status(201).json({ id, nombre, descripcion: descripcion || '', precio: precio || 0, categoria: categoria || 'general' });
});

router.put('/menu/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { nombre, descripcion, precio, categoria, disponible } = req.body;
  const updates = [];
  const values = [];
  if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre); }
  if (descripcion !== undefined) { updates.push('descripcion = ?'); values.push(descripcion); }
  if (precio !== undefined) { updates.push('precio = ?'); values.push(precio); }
  if (categoria !== undefined) { updates.push('categoria = ?'); values.push(categoria); }
  if (disponible !== undefined) { updates.push('disponible = ?'); values.push(disponible); }
  if (updates.length === 0) return res.status(400).json({ error: 'Sin datos' });
  values.push(req.params.id);
  db.prepare(`UPDATE engage_menu_items SET ${updates.join(',')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/menu/:id', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM engage_menu_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
