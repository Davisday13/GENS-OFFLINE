import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from '../database.js';
import { hashPassword, createToken, authMiddleware } from '../auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });

  const db = getDb();
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

  if (!bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = createToken(usuario);
  const sesionId = uuidv4();

  db.prepare(`INSERT INTO sesiones (id, usuario_id, token, expira_at)
    VALUES (?, ?, ?, datetime('now', '+1 day'))`).run(sesionId, usuario.id, token);

  res.json({
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  });
});

router.post('/register', (req, res) => {
  const { email, nombre, password } = req.body;
  if (!email || !nombre || !password) return res.status(400).json({ error: 'Todos los campos requeridos' });

  const db = getDb();
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email ya registrado' });

  const id = uuidv4();
  const hash = hashPassword(password);
  db.prepare('INSERT INTO usuarios (id, email, nombre, password) VALUES (?, ?, ?, ?)').run(id, email, nombre, hash);

  const usuario = db.prepare('SELECT id, email, nombre, rol FROM usuarios WHERE id = ?').get(id);
  const token = createToken(usuario);

  res.status(201).json({ token, usuario });
});

router.get('/perfil', authMiddleware, (req, res) => {
  const db = getDb();
  const usuario = db.prepare('SELECT id, email, nombre, rol, created_at FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
});

router.put('/perfil', authMiddleware, (req, res) => {
  const db = getDb();
  const { nombre, password } = req.body;
  if (nombre) db.prepare('UPDATE usuarios SET nombre = ? WHERE id = ?').run(nombre, req.usuario.id);
  if (password) {
    const hash = hashPassword(password);
    db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(hash, req.usuario.id);
  }
  res.json({ ok: true });
});

export default router;
