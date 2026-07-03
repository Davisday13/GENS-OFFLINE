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

router.use('/reportes', crudRoutes('rep_reportes', '*', 'nombre'));
router.use('/dashboards', crudRoutes('rep_dashboards'));

router.get('/ventas-diarias', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT date(fecha) as dia, COUNT(*) as facturas, SUM(total) as total
    FROM vta_facturas
    WHERE fecha >= date('now', '-30 days')
    GROUP BY date(fecha)
    ORDER BY dia
  `).all();
  res.json(data);
});

router.get('/compras-mensuales', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT strftime('%Y-%m', fecha) as mes, COUNT(*) as ordenes, SUM(total) as total
    FROM com_ordenes_compra
    GROUP BY strftime('%Y-%m', fecha)
    ORDER BY mes DESC LIMIT 12
  `).all();
  res.json(data);
});

router.get('/top-productos', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT p.nombre, p.codigo, COALESCE(SUM(e.cantidad),0) as stock_total
    FROM inv_productos p
    LEFT JOIN inv_existencias e ON e.producto_id = p.id
    WHERE p.activo = 1
    GROUP BY p.id
    ORDER BY stock_total ASC
    LIMIT 20
  `).all();
  res.json(data);
});

router.get('/kpis-globales', (req, res) => {
  const db = getDb();
  const kpis = {
    ventasHoy: db.prepare("SELECT COALESCE(SUM(total),0) as v FROM vta_facturas WHERE date(fecha) = date('now')").get().v,
    ventasMes: db.prepare("SELECT COALESCE(SUM(total),0) as v FROM vta_facturas WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')").get().v,
    comprasMes: db.prepare("SELECT COALESCE(SUM(total),0) as v FROM com_ordenes_compra WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')").get().v,
    clientesActivos: db.prepare("SELECT COUNT(*) as c FROM vta_clientes WHERE activo = 1").get().c,
    productosActivos: db.prepare("SELECT COUNT(*) as c FROM inv_productos WHERE activo = 1").get().c,
    ordenesPendientes: db.prepare("SELECT COUNT(*) as c FROM vta_ordenes_venta WHERE estado = 'pendiente'").get().c,
    empleadosActivos: db.prepare("SELECT COUNT(*) as c FROM rrhh_empleados WHERE activo = 1").get().c,
  };
  res.json(kpis);
});

export default router;
