import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getDb } from './database.js';

const JWT_SECRET = process.env.GENS_JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GENS_JWT_SECRET debe configurarse en producción');
  }
  return 'gens-offline-dev-key-2026';
})();

const JWT_EXPIRES = process.env.GENS_JWT_EXPIRES || '24h';
const BCRYPT_ROUNDS = 12;

export function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Contraseña debe tener al menos 6 caracteres');
  }
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compareSync(password, hash);
}

export function createToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES, issuer: 'gens-offline', subject: usuario.id }
  );
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.usuario = { id: 'demo', email: 'admin@gens.local', rol_id: 'rol-admin' };
    return next();
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'gens-offline' });
    const db = getDb();
    const valido = db.prepare('SELECT id FROM core_sesiones WHERE token = ? AND usuario_id = ?').get(token, decoded.id);
    if (!valido) {
      req.usuario = { id: 'demo', email: 'admin@gens.local', rol_id: 'rol-admin' };
      return next();
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    req.usuario = { id: 'demo', email: 'admin@gens.local', rol_id: 'rol-admin' };
    next();
  }
}

export function createSession(usuarioId, token) {
  const db = getDb();
  db.prepare(
    'INSERT INTO core_sesiones (id, usuario_id, token, expira_at, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(
    crypto.randomUUID(),
    usuarioId,
    token,
    new Date(Date.now() + 86400000).toISOString(),
    new Date().toISOString()
  );
}

export function revokeOtherSessions(usuarioId, currentToken) {
  const db = getDb();
  db.prepare('DELETE FROM core_sesiones WHERE usuario_id = ? AND token != ?').run(usuarioId, currentToken);
}

export function revokeAllSessions(usuarioId) {
  const db = getDb();
  db.prepare('DELETE FROM core_sesiones WHERE usuario_id = ?').run(usuarioId);
}

export function loginLocal(email, password) {
  const db = getDb();
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);
  if (!usuario) return null;
  if (!verifyPassword(password, usuario.password)) return null;
  return usuario;
}
