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

router.use('/empleados', crudRoutes('rrhh_empleados', '*', 'nombre'));
router.use('/contratos', crudRoutes('rrhh_contratos', '*', 'created_at DESC'));
router.use('/asistencia', crudRoutes('rrhh_asistencia', '*', 'fecha DESC'));
router.use('/vacaciones', crudRoutes('rrhh_vacaciones', '*', 'created_at DESC'));

router.get('/nominas', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT n.*, e.nombre as empleado_nombre
    FROM rrhh_nominas n
    LEFT JOIN rrhh_empleados e ON n.empleado_id = e.id
    ORDER BY n.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/nominas', (req, res) => {
  const db = getDb();
  const { empleado_id, contrato_id, periodo, salario_base, horas_extra, bonos, deducciones, seguro_social, total, pagado } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO rrhh_nominas (id, empleado_id, contrato_id, periodo, salario_base, horas_extra, bonos, deducciones, seguro_social, total, pagado)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(id, empleado_id, contrato_id, periodo, salario_base || 0, horas_extra || 0, bonos || 0, deducciones || 0, seguro_social || 0, total || 0, pagado || 0);
  res.status(201).json({ id });
});

router.post('/nominas/calcular', (req, res) => {
  const db = getDb();
  const { empleado_id, periodo } = req.body;
  const contrato = db.prepare(`SELECT c.*, e.nombre FROM rrhh_contratos c
    JOIN rrhh_empleados e ON c.empleado_id = e.id
    WHERE c.empleado_id = ? AND c.activo = 1`).get(empleado_id);
  if (!contrato) return res.status(404).json({ error: 'Empleado sin contrato activo' });
  const seguroSocial = contrato.salario_base * 0.0975;
  const total = contrato.salario_base - seguroSocial;
  const id = uuidv4();
  db.prepare(`INSERT INTO rrhh_nominas (id, empleado_id, contrato_id, periodo, salario_base, seguro_social, deducciones, total)
    VALUES (?,?,?,?,?,?,?,?)`).run(id, empleado_id, contrato.id, periodo, contrato.salario_base, seguroSocial, seguroSocial, total);
  res.status(201).json({ id, empleado: contrato.nombre, salario_base: contrato.salario_base, seguro_social: seguroSocial, total });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalEmpleados = db.prepare('SELECT COUNT(*) as count FROM rrhh_empleados WHERE activo = 1').get();
  const totalNominas = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM rrhh_nominas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get();
  const vacacionesPendientes = db.prepare("SELECT COUNT(*) as count FROM rrhh_vacaciones WHERE estado = 'pendiente'").get();
  res.json({ totalEmpleados: totalEmpleados.count, totalNominasMes: totalNominas.total, vacacionesPendientes: vacacionesPendientes.count });
});

export default router;
