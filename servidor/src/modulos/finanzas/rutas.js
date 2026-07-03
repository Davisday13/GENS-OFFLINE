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

router.use('/plan-cuentas', crudRoutes('fin_plan_cuentas', '*', 'codigo'));
router.use('/cxc', crudRoutes('fin_cxc', '*', 'fecha_vencimiento ASC'));
router.use('/cxp', crudRoutes('fin_cxp', '*', 'fecha_vencimiento ASC'));
router.use('/movimientos-bancarios', crudRoutes('fin_movimientos_bancarios', '*', 'fecha DESC'));

router.get('/asientos', (req, res) => {
  const db = getDb();
  const asientos = db.prepare(`
    SELECT a.*, u.nombre as usuario_nombre
    FROM fin_asientos a
    LEFT JOIN core_usuarios u ON a.usuario_id = u.id
    ORDER BY a.created_at DESC
  `).all();
  for (const asiento of asientos) {
    asiento.detalle = db.prepare(`
      SELECT d.*, c.codigo as cuenta_codigo, c.nombre as cuenta_nombre
      FROM fin_asientos_detalle d
      JOIN fin_plan_cuentas c ON d.cuenta_id = c.id
      WHERE d.asiento_id = ?
    `).all(asiento.id);
  }
  res.json(asientos);
});

router.post('/asientos', (req, res) => {
  const db = getDb();
  const { fecha, tipo, referencia, descripcion, usuario_id, lineas } = req.body;
  const id = uuidv4();
  const numero = `AS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  db.prepare(`INSERT INTO fin_asientos (id, numero, fecha, tipo, referencia, descripcion, usuario_id)
    VALUES (?,?,?,?,?,?,?)`).run(id, numero, fecha || new Date().toISOString().slice(0, 10), tipo || 'manual', referencia || null, descripcion, usuario_id || null);
  if (lineas && Array.isArray(lineas)) {
    const stmtDet = db.prepare('INSERT INTO fin_asientos_detalle (id, asiento_id, cuenta_id, debe, haber) VALUES (?,?,?,?,?)');
    for (const linea of lineas) {
      stmtDet.run(uuidv4(), id, linea.cuenta_id, linea.debe || 0, linea.haber || 0);
    }
  }
  res.status(201).json({ id, numero });
});

router.get('/estados-financieros', (req, res) => {
  const db = getDb();
  const balanceGeneral = db.prepare(`
    SELECT c.tipo, c.codigo, c.nombre, COALESCE(SUM(d.debe - d.haber), 0) as saldo
    FROM fin_plan_cuentas c
    LEFT JOIN fin_asientos_detalle d ON d.cuenta_id = c.id
    WHERE c.tipo IN ('activo', 'pasivo', 'patrimonio')
    GROUP BY c.id, c.tipo, c.codigo, c.nombre
    ORDER BY c.codigo
  `).all();
  const estadoResultados = db.prepare(`
    SELECT c.tipo, c.codigo, c.nombre, COALESCE(SUM(d.haber - d.debe), 0) as saldo
    FROM fin_plan_cuentas c
    LEFT JOIN fin_asientos_detalle d ON d.cuenta_id = c.id
    WHERE c.tipo IN ('ingreso', 'gasto')
    GROUP BY c.id, c.tipo, c.codigo, c.nombre
    ORDER BY c.codigo
  `).all();
  res.json({ balanceGeneral, estadoResultados });
});

router.get('/dashboard', (req, res) => {
  const db = getDb();
  const totalCxc = db.prepare("SELECT COALESCE(SUM(saldo),0) as total FROM fin_cxc WHERE estado != 'pagada'").get();
  const totalCxp = db.prepare("SELECT COALESCE(SUM(saldo),0) as total FROM fin_cxp WHERE estado != 'pagada'").get();
  const cxcVencidas = db.prepare("SELECT COUNT(*) as count FROM fin_cxc WHERE fecha_vencimiento < date('now') AND estado != 'pagada'").get();
  const ultimosAsientos = db.prepare('SELECT * FROM fin_asientos ORDER BY created_at DESC LIMIT 5').all();
  res.json({ totalCxc: totalCxc.total, totalCxp: totalCxp.total, cxcVencidas: cxcVencidas.count, ultimosAsientos });
});

export default router;
