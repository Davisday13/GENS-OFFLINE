import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { getDb } from '../../database.js';
import { authMiddleware, createToken, createSession } from '../../auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intente de nuevo en 15 minutos.' },
});

const VALID_TABLES = new Set([
  'core_empresas', 'core_sucursales', 'core_roles', 'core_permisos',
  'core_roles_permisos', 'core_usuarios', 'core_bitacora', 'core_notificaciones',
  'core_configuracion', 'core_sesiones',
]);

function sanitizeTable(table) {
  if (!VALID_TABLES.has(table)) {
    throw new Error(`Tabla no permitida: ${table}`);
  }
  return table;
}

function sanitizeFields(fields) {
  if (fields === '*') return '*';
  return fields.split(',').map(f => f.trim()).filter(f => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f)).join(',') || '*';
}

function sanitizeOrderBy(orderBy) {
  const parts = orderBy.trim().split(/\s+/);
  if (parts.length > 2) return 'created_at DESC';
  const col = parts[0];
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) return 'created_at DESC';
  if (parts.length === 2 && !/^(ASC|DESC)$/i.test(parts[1])) return 'created_at DESC';
  return orderBy;
}

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errors.array() });
  }
  next();
}

function crudRoutes(table, fields = '*', orderBy = 'created_at DESC') {
  const safeTable = sanitizeTable(table);
  const safeFields = sanitizeFields(fields);
  const safeOrderBy = sanitizeOrderBy(orderBy);
  const r = Router({ mergeParams: true });
  r.get('/', (req, res) => {
    const db = getDb();
    res.json(db.prepare(`SELECT ${safeFields} FROM ${safeTable} ORDER BY ${safeOrderBy}`).all());
  });
  r.get('/:id', (req, res) => {
    const db = getDb();
    const row = db.prepare(`SELECT ${safeFields} FROM ${safeTable} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  });
  r.post('/', (req, res) => {
    const db = getDb();
    const data = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
    const keys = Object.keys(data).filter(k => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));
    const values = keys.map(k => data[k]);
    const ph = keys.map(() => '?').join(',');
    db.prepare(`INSERT INTO ${safeTable} (${keys.join(',')}) VALUES (${ph})`).run(...values);
    res.status(201).json(data);
  });
  r.put('/:id', (req, res) => {
    const db = getDb();
    const { id, created_at, updated_at, ...updates } = req.body;
    const keys = Object.keys(updates).filter(k => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));
    if (keys.length === 0) return res.status(400).json({ error: 'Sin datos válidos' });
    const set = keys.map(k => `${k} = ?`).join(',');
    db.prepare(`UPDATE ${safeTable} SET ${set}, updated_at = ? WHERE id = ?`).run(...keys.map(k => updates[k]), new Date().toISOString(), req.params.id);
    res.json({ ok: true });
  });
  r.delete('/:id', (req, res) => {
    const db = getDb();
    db.prepare(`DELETE FROM ${safeTable} WHERE id = ?`).run(req.params.id);
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

router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 1 }).withMessage('Contraseña requerida'),
], handleValidation, (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM core_usuarios WHERE email = ? AND activo = 1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = createToken(user);
  createSession(user.id, token);
  db.prepare('INSERT INTO core_bitacora (id, usuario_id, accion, entidad, detalle, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), user.id, 'login', 'core_usuarios', `Inicio de sesión: ${user.email}`, new Date().toISOString()
  );
  res.json({ token, usuario: { id: user.id, email: user.email, nombre: user.nombre, rol_id: user.rol_id } });
});

router.post('/registro', authMiddleware, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('nombre').isLength({ min: 2 }).trim().withMessage('Nombre requerido (min 2 caracteres)'),
  body('password').isLength({ min: 8 }).withMessage('Contraseña debe tener al menos 8 caracteres'),
  body('rol_id').optional().isString(),
], handleValidation, (req, res) => {
  const db = getDb();
  const { email, nombre, password, rol_id, empresa_id } = req.body;
  const existe = db.prepare('SELECT id FROM core_usuarios WHERE email = ?').get(email);
  if (existe) return res.status(400).json({ error: 'Email ya registrado' });
  const hash = bcrypt.hashSync(password, 12);
  const id = uuidv4();
  db.prepare('INSERT INTO core_usuarios (id, email, nombre, password, rol_id, empresa_id) VALUES (?,?,?,?,?,?)')
    .run(id, email, nombre, hash, rol_id || null, empresa_id || null);
  db.prepare('INSERT INTO core_bitacora (id, usuario_id, accion, entidad, detalle, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), req.usuario.id, 'registro', 'core_usuarios', `Registro de usuario: ${email}`, new Date().toISOString()
  );
  res.status(201).json({ id });
});

router.post('/logout', authMiddleware, (req, res) => {
  const db = getDb();
  const header = req.headers.authorization;
  const token = header.split(' ')[1];
  db.prepare('DELETE FROM core_sesiones WHERE token = ? AND usuario_id = ?').run(token, req.usuario.id);
  db.prepare('INSERT INTO core_bitacora (id, usuario_id, accion, entidad, detalle, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), req.usuario.id, 'logout', 'core_sesiones', `Cierre de sesión: ${req.usuario.email}`, new Date().toISOString()
  );
  res.json({ ok: true });
});

router.post('/revocar-sesiones', authMiddleware, (req, res) => {
  const db = getDb();
  const header = req.headers.authorization;
  const token = header.split(' ')[1];
  db.prepare('DELETE FROM core_sesiones WHERE usuario_id = ? AND token != ?').run(req.usuario.id, token);
  db.prepare('INSERT INTO core_bitacora (id, usuario_id, accion, entidad, detalle, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), req.usuario.id, 'revocar', 'core_sesiones', `Sesiones revocadas por ${req.usuario.email}`, new Date().toISOString()
  );
  res.json({ ok: true, mensaje: 'Otras sesiones cerradas' });
});

router.get('/mi-perfil', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, nombre, rol_id, empresa_id, sucursal_id, telefono, activo, created_at FROM core_usuarios WHERE id = ?').get(req.usuario.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

export default router;
