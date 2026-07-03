import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();
router.use(authMiddleware);

function crudRoutes(table, fields = '*') {
  const r = Router();

  r.get('/', (req, res) => {
    const db = getDb();
    const rows = db.prepare(`SELECT ${fields} FROM ${table} ORDER BY created_at DESC`).all();
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

router.use('/cierres-z', crudRoutes('cont_cierres_z'));
router.use('/gastos', crudRoutes('cont_gastos'));
router.use('/arqueos', crudRoutes('cont_arqueos'));
router.use('/compras', crudRoutes('cont_compras'));
router.use('/conciliacion', crudRoutes('cont_conciliacion'));
router.use('/asientos', crudRoutes('cont_asientos'));

export default router;
