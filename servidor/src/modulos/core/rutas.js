import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from '../../database.js';
import { authMiddleware, createToken } from '../../auth.js';

const router = Router();

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

router.use('/empresas', authMiddleware, crudRoutes('core_empresas'));
router.use('/sucursales', authMiddleware, crudRoutes('core_sucursales'));
router.use('/roles', authMiddleware, crudRoutes('core_roles'));
router.use('/permisos', authMiddleware, crudRoutes('core_permisos'));
router.use('/roles-permisos', authMiddleware, crudRoutes('core_roles_permisos'));
router.use('/usuarios', authMiddleware, crudRoutes('core_usuarios', 'id, email, nombre, rol_id, empresa_id, sucursal_id, telefono, activo, created_at'));
router.use('/bitacora', authMiddleware, crudRoutes('core_bitacora', '*', 'created_at DESC'));
router.use('/notificaciones', authMiddleware, crudRoutes('core_notificaciones', '*', 'created_at DESC'));
router.use('/configuracion', authMiddleware, crudRoutes('core_configuracion'));

router.post('/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM core_usuarios WHERE email = ? AND activo = 1').get(email);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const valido = bcrypt.compareSync(password, user.password);
  if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = createToken(user);
  db.prepare('INSERT INTO core_sesiones (id, usuario_id, token, expira_at) VALUES (?, ?, ?, ?)')
    .run(uuidv4(), user.id, token, new Date(Date.now() + 86400000).toISOString());
  res.json({ token, usuario: { id: user.id, email: user.email, nombre: user.nombre, rol_id: user.rol_id } });
});

router.post('/registro', authMiddleware, (req, res) => {
  const db = getDb();
  const { email, nombre, password, rol_id, empresa_id } = req.body;
  const existe = db.prepare('SELECT id FROM core_usuarios WHERE email = ?').get(email);
  if (existe) return res.status(400).json({ error: 'Email ya registrado' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO core_usuarios (id, email, nombre, password, rol_id, empresa_id) VALUES (?,?,?,?,?,?)')
    .run(id, email, nombre, hash, rol_id || null, empresa_id || null);
  res.status(201).json({ id });
});

export default router;
