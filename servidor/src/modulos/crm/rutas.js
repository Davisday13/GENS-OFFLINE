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

router.use('/prospectos', crudRoutes('crm_prospectos', '*', 'created_at DESC'));
router.use('/oportunidades', crudRoutes('crm_oportunidades', '*', 'created_at DESC'));
router.use('/interacciones', crudRoutes('crm_interacciones', '*', 'fecha DESC'));

router.get('/pipeline', (req, res) => {
  const db = getDb();
  const etapas = db.prepare(`
    SELECT etapa, COUNT(*) as total, COALESCE(SUM(monto_estimado),0) as monto_total
    FROM crm_oportunidades
    WHERE etapa NOT IN ('ganado', 'perdido')
    GROUP BY etapa ORDER BY
      CASE etapa
        WHEN 'nuevo' THEN 1 WHEN 'calificado' THEN 2
        WHEN 'propuesta' THEN 3 WHEN 'negociacion' THEN 4
        ELSE 5
      END
  `).all();
  res.json(etapas);
});

router.post('/oportunidades/:id/convertir', (req, res) => {
  const db = getDb();
  const { cliente_id } = req.body;
  const op = db.prepare('SELECT * FROM crm_oportunidades WHERE id = ?').get(req.params.id);
  if (!op) return res.status(404).json({ error: 'Oportunidad no encontrada' });
  db.prepare("UPDATE crm_oportunidades SET etapa = 'ganado', cliente_id = ? WHERE id = ?").run(cliente_id || null, req.params.id);
  if (op.prospecto_id) {
    db.prepare("UPDATE crm_prospectos SET estado = 'convertido' WHERE id = ?").run(op.prospecto_id);
  }
  res.json({ ok: true });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const prospectosNuevos = db.prepare("SELECT COUNT(*) as count FROM crm_prospectos WHERE estado = 'nuevo'").get();
  const oportunidadesAbiertas = db.prepare("SELECT COUNT(*) as count FROM crm_oportunidades WHERE etapa NOT IN ('ganado', 'perdido')").get();
  const pipelineTotal = db.prepare("SELECT COALESCE(SUM(monto_estimado),0) as total FROM crm_oportunidades WHERE etapa NOT IN ('ganado', 'perdido')").get();
  const ganadasEsteMes = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(monto_estimado),0) as total FROM crm_oportunidades WHERE etapa = 'ganado' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get();
  res.json({
    prospectosNuevos: prospectosNuevos.count,
    oportunidadesAbiertas: oportunidadesAbiertas.count,
    pipelineTotal: pipelineTotal.total,
    ganadasEsteMes: ganadasEsteMes.count,
    montoGanadoMes: ganadasEsteMes.total,
  });
});

export default router;
