import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(hpp());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

let db;
try {
  const Database = _require('better-sqlite3');
  const dir_ = process.env.VERCEL === '1' ? '/tmp/gens-db' : path.join(__dirname, '..', 'servidor', 'data');
  if (!fs.existsSync(dir_)) fs.mkdirSync(dir_, { recursive: true });
  db = new Database(path.join(dir_, 'gens.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  ['pos_mesas|'+`CREATE TABLE IF NOT EXISTS pos_mesas (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, capacidad INTEGER DEFAULT 4, estado TEXT DEFAULT 'libre')`+'|'+`INSERT OR IGNORE INTO pos_mesas (id,nombre,capacidad) VALUES (1,'Mesa 1',4),(2,'Mesa 2',4),(3,'Mesa 3',6),(4,'Mesa 4',4),(5,'Mesa 5',4),(6,'Mesa 6',6),(7,'Barra',2)`,
   'pos_categorias|'+`CREATE TABLE IF NOT EXISTS pos_categorias (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, icono TEXT)`+'|'+`INSERT OR IGNORE INTO pos_categorias (id,nombre,icono) VALUES (1,'Combos','star'),(2,'Hamburguesas','burger'),(3,'Pollo','chicken'),(4,'Extras','plus'),(5,'Bebidas','drink'),(6,'Postres','cake')`,
   'pos_productos|'+`CREATE TABLE IF NOT EXISTS pos_productos (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, precio REAL NOT NULL, categoria_id INTEGER, activo INTEGER DEFAULT 1)`+'|'+`INSERT OR IGNORE INTO pos_productos (id,nombre,precio,categoria_id) VALUES (1,'Combo Cuarto de Libra',9.99,1),(2,'Combo Doble',11.99,1),(3,'Combo Pollo',10.49,1),(4,'Combo Infantil',6.99,1),(5,'Hamburguesa Sencilla',4.99,2),(6,'Hamburguesa con Queso',5.99,2),(7,'Hamburguesa Doble',7.99,2),(8,'Hamburguesa BBQ',6.99,2),(9,'Hamburguesa de Pollo',5.49,2),(10,'Pollo Frito (2 pzas)',4.49,3),(11,'Pollo Frito (4 pzas)',7.99,3),(12,'Alitas BBQ (6)',5.99,3),(13,'Alitas BBQ (12)',9.99,3),(14,'Papas Fritas Pequeñas',2.49,4),(15,'Papas Fritas Grandes',3.99,4),(16,'Aros de Cebolla',3.49,4),(17,'Refresco Pequeño',1.99,5),(18,'Refresco Grande',2.99,5),(19,'Agua Embotellada',1.49,5),(20,'Helado Suave',2.49,6),(21,'Batido',3.99,6)`,
   'pos_pedidos|'+`CREATE TABLE IF NOT EXISTS pos_pedidos (id INTEGER PRIMARY KEY AUTOINCREMENT, mesa_id INTEGER, estado TEXT DEFAULT 'abierto', total REAL DEFAULT 0, creado_en TEXT DEFAULT (datetime('now','localtime')))`,
   'pos_pedidos_detalle|'+`CREATE TABLE IF NOT EXISTS pos_pedidos_detalle (id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER, producto_id INTEGER, cantidad INTEGER DEFAULT 1, precio REAL)`,
   'facturas|'+`CREATE TABLE IF NOT EXISTS facturas (id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER, total REAL, creado_en TEXT DEFAULT (datetime('now','localtime')))`,
   'categorias_menu|'+`CREATE TABLE IF NOT EXISTS categorias_menu (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL)`+'|'+`INSERT OR IGNORE INTO categorias_menu (id,nombre) VALUES (1,'Entradas'),(2,'Platos Fuertes'),(3,'Bebidas'),(4,'Postres')`,
   'gastos|'+`CREATE TABLE IF NOT EXISTS gastos (id INTEGER PRIMARY KEY AUTOINCREMENT, descripcion TEXT, monto REAL, categoria TEXT, fecha TEXT DEFAULT (date('now','localtime')))`,
   'bodegas|'+`CREATE TABLE IF NOT EXISTS bodegas (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, ubicacion TEXT)`+'|'+`INSERT OR IGNORE INTO bodegas (id,nombre,ubicacion) VALUES (1,'Bodega Principal','Central'),(2,'Bodega Secundaria','Este')`,
   'inventario|'+`CREATE TABLE IF NOT EXISTS inventario (id INTEGER PRIMARY KEY AUTOINCREMENT, producto TEXT NOT NULL, cantidad REAL DEFAULT 0, unidad TEXT DEFAULT 'unidad', bodega_id INTEGER DEFAULT 1)`+'|'+`INSERT OR IGNORE INTO inventario (id,producto,cantidad,unidad) VALUES (1,'Carne de Res',50,'kg'),(2,'Pan Hamburguesa',200,'unidades'),(3,'Pechuga de Pollo',30,'kg'),(4,'Papas Congeladas',80,'kg'),(5,'Aceite',20,'litros'),(6,'Queso Amarillo',15,'kg'),(7,'Lechuga',25,'unidades'),(8,'Tomate',40,'unidades')`,
   'proveedores|'+`CREATE TABLE IF NOT EXISTS proveedores (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, telefono TEXT)`+'|'+`INSERT OR IGNORE INTO proveedores (id,nombre,telefono) VALUES (1,'Carnes Premium','200-1234'),(2,'Distribuidora Alimentos','200-5678'),(3,'Panaderia El Trigal','200-9012')`,
   'clientes|'+`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, telefono TEXT, email TEXT)`+'|'+`INSERT OR IGNORE INTO clientes (id,nombre,telefono) VALUES (1,'Cliente General','000-0000'),(2,'Cliente Corporativo','000-0001')`,
   'roles|'+`CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, nombre TEXT NOT NULL)`+'|'+`INSERT OR IGNORE INTO roles (id,nombre) VALUES ('rol-admin','Administrador'),('rol-cajero','Cajero'),('rol-cocina','Cocina'),('rol-mesero','Mesero')`,
   'usuarios|'+`CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, email TEXT UNIQUE, password TEXT, rol_id TEXT)`+'|'+`INSERT OR IGNORE INTO usuarios (id,nombre,email,password,rol_id) VALUES ('usr-admin','Admin','admin@gens.com','admin123','rol-admin'),('usr-cajero','Cajero Demo','cajero@gens.com','cajero123','rol-cajero')`,
   'cuentas_contables|'+`CREATE TABLE IF NOT EXISTS cuentas_contables (id INTEGER PRIMARY KEY, codigo TEXT UNIQUE, nombre TEXT NOT NULL, tipo TEXT DEFAULT 'activo')`+'|'+`INSERT OR IGNORE INTO cuentas_contables (id,codigo,nombre,tipo) VALUES (1,'1101','Caja','activo'),(2,'1102','Bancos','activo'),(3,'1201','Inventario','activo'),(4,'1202','Cuentas por Cobrar','activo'),(5,'2101','Cuentas por Pagar','pasivo'),(6,'3101','Capital','patrimonio'),(7,'4101','Ventas','ingreso'),(8,'5101','Costo de Ventas','gasto'),(9,'5102','Gastos Operativos','gasto')`
  ].forEach(spec => {
    const parts = spec.split('|');
    try { db.exec(parts[1]); if (parts[2]) db.exec(parts[2]); } catch (e) { console.error('Seed fail for', parts[0], e.message); }
  });
  console.log('DB OK');
} catch(e) {
  console.error('DB fail:', e.message);
}

const authMw = (req, res, next) => { req.usuario = { id: 'demo', nombre: 'Demo', rol_id: 'rol-admin' }; next(); };

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: !!db }));
app.get('/api/debug', (req, res) => {
  if (!db) return res.json({ db: false });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  const counts = {};
  tables.forEach(t => { try { counts[t.name] = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get().c; } catch {} });
  res.json({ tables: tables.map(t=>t.name), counts });
});
app.post('/api/reseed', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  res.json({ ok: true, message: 'Seed ya se ejecutó al iniciar' });
});

// POS
app.get('/api/pos/mesas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM pos_mesas ORDER BY id').all());
});
app.put('/api/pos/mesas/:id', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const { estado } = req.body;
  db.prepare('UPDATE pos_mesas SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});
app.get('/api/pos/categorias', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM pos_categorias ORDER BY id').all());
});
app.get('/api/pos/productos', authMw, (req, res) => {
  if (!db) return res.json([]);
  if (req.query.categoria_id) return res.json(db.prepare('SELECT * FROM pos_productos WHERE categoria_id = ? AND activo = 1 ORDER BY id').all(req.query.categoria_id));
  res.json(db.prepare('SELECT * FROM pos_productos WHERE activo = 1 ORDER BY id').all());
});
app.post('/api/pos/pedidos', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const { mesa_id, items } = req.body;
  let total = 0;
  items.forEach(item => {
    const prod = db.prepare('SELECT precio FROM pos_productos WHERE id = ?').get(item.producto_id);
    total += (prod?.precio || 0) * item.cantidad;
  });
  const r = db.prepare("INSERT INTO pos_pedidos (mesa_id, total) VALUES (?, ?)").run(mesa_id, total);
  const stmt = db.prepare('INSERT INTO pos_pedidos_detalle (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)');
  items.forEach(item => {
    const prod = db.prepare('SELECT precio FROM pos_productos WHERE id = ?').get(item.producto_id);
    stmt.run(r.lastInsertRowid, item.producto_id, item.cantidad, prod?.precio || 0);
  });
  db.prepare("UPDATE pos_mesas SET estado = 'ocupada' WHERE id = ?").run(mesa_id);
  res.json({ id: r.lastInsertRowid, total });
});
app.get('/api/pos/pedidos', authMw, (req, res) => {
  if (!db) return res.json([]);
  const pedidos = db.prepare('SELECT p.*, m.nombre as mesa_nombre FROM pos_pedidos p JOIN pos_mesas m ON p.mesa_id = m.id ORDER BY p.creado_en DESC').all();
  pedidos.forEach(p => {
    p.items = db.prepare('SELECT ppd.*, pp.nombre FROM pos_pedidos_detalle ppd JOIN pos_productos pp ON ppd.producto_id = pp.id WHERE ppd.pedido_id = ?').all(p.id);
  });
  res.json(pedidos);
});
app.put('/api/pos/pedidos/:id', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const { estado } = req.body;
  db.prepare('UPDATE pos_pedidos SET estado = ? WHERE id = ?').run(estado, req.params.id);
  if (estado === 'cerrado' || estado === 'pagado') {
    const pedido = db.prepare('SELECT mesa_id FROM pos_pedidos WHERE id = ?').get(req.params.id);
    if (pedido) db.prepare("UPDATE pos_mesas SET estado = 'libre' WHERE id = ?").run(pedido.mesa_id);
  }
  res.json({ ok: true });
});
app.post('/api/pos/pedidos/:id/pagar', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const pedido = db.prepare('SELECT * FROM pos_pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  db.prepare("UPDATE pos_pedidos SET estado = 'pagado' WHERE id = ?").run(req.params.id);
  db.prepare('INSERT INTO facturas (pedido_id, total) VALUES (?, ?)').run(req.params.id, pedido.total);
  db.prepare("UPDATE pos_mesas SET estado = 'libre' WHERE id = ?").run(pedido.mesa_id);
  res.json({ ok: true });
});
app.get('/api/pos/kpi', authMw, (req, res) => {
  if (!db) return res.json({ ventas_hoy: 0, mesas_ocupadas: 0, pedidos_activos: 0, stock_bajo: 0, menu_count: 0 });
  res.json({
    ventas_hoy: db.prepare("SELECT COALESCE(SUM(total),0) as t FROM pos_pedidos WHERE date(creado_en) = date('now','localtime')").get().t,
    mesas_ocupadas: db.prepare("SELECT COUNT(*) as c FROM pos_mesas WHERE estado = 'ocupada'").get().c,
    pedidos_activos: db.prepare("SELECT COUNT(*) as c FROM pos_pedidos WHERE estado = 'abierto'").get().c,
    stock_bajo: db.prepare("SELECT COUNT(*) as c FROM inventario WHERE cantidad < 10").get().c,
    menu_count: db.prepare("SELECT COUNT(*) as c FROM pos_productos WHERE activo = 1").get().c
  });
});
app.get('/api/pos/pedidos/ventas-semana', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare("SELECT date(creado_en) as fecha, SUM(total) as total FROM pos_pedidos WHERE creado_en >= datetime('now', '-7 days', 'localtime') GROUP BY date(creado_en) ORDER BY fecha").all());
});
app.get('/api/pos/facturas/recientes', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT f.*, m.nombre as mesa FROM facturas f JOIN pos_pedidos p ON f.pedido_id = p.id JOIN pos_mesas m ON p.mesa_id = m.id ORDER BY f.creado_en DESC LIMIT 10').all());
});

// Auth
app.post('/api/auth/login', (req, res) => {
  if (!db) return res.json({ token: 'demo-token', usuario: { id: 'demo', nombre: 'Demo', email: 'demo@gens.com', rol_id: 'rol-admin' } });
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  try {
    const bcrypt = _require('bcryptjs');
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch { if (password !== 'admin123' && password !== 'cajero123') return res.status(401).json({ error: 'Credenciales inválidas' }); }
  const jwt = _require('jsonwebtoken');
  const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.GENS_JWT_SECRET || 'demo-secret', { expiresIn: '8h' });
  res.json({ token, usuario: { id: user.id, nombre: user.nombre, email: user.email, rol_id: user.rol_id } });
});

// Inventario
app.get('/api/inventario', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM inventario ORDER BY producto').all());
});
app.put('/api/inventario/:id', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const { cantidad } = req.body;
  db.prepare('UPDATE inventario SET cantidad = ? WHERE id = ?').run(cantidad, req.params.id);
  res.json({ ok: true });
});

// Proveedores
app.get('/api/proveedores', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM proveedores ORDER BY nombre').all());
});

// Clientes
app.get('/api/clientes', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM clientes ORDER BY nombre').all());
});

// Contabilidad
app.get('/api/contabilidad/cuentas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM cuentas_contables ORDER BY codigo').all());
});
app.get('/api/contabilidad/asientos', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json([]); // placeholder
});
app.get('/api/contabilidad/balance', authMw, (req, res) => {
  if (!db) return res.json({ total_activos: 0, total_pasivos: 0, total_patrimonio: 0 });
  const activos = db.prepare("SELECT COALESCE(SUM(monto),0) as t FROM cuentas_contables WHERE tipo='activo'").get().t;
  const pasivos = db.prepare("SELECT COALESCE(SUM(monto),0) as t FROM cuentas_contables WHERE tipo='pasivo'").get().t;
  const patrimonio = db.prepare("SELECT COALESCE(SUM(monto),0) as t FROM cuentas_contables WHERE tipo='patrimonio'").get().t;
  res.json({ total_activos: activos, total_pasivos: pasivos, total_patrimonio: patrimonio });
});

// Gastos
app.get('/api/gastos', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM gastos ORDER BY fecha DESC').all());
});
app.post('/api/gastos', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const { descripcion, monto, categoria } = req.body;
  const r = db.prepare('INSERT INTO gastos (descripcion, monto, categoria) VALUES (?, ?, ?)').run(descripcion, monto, categoria);
  res.json({ id: r.lastInsertRowid });
});

// Cierre Z
app.get('/api/pos/cierre-z', authMw, (req, res) => {
  if (!db) return res.json({ total_ventas: 0, total_pedidos: 0, total_impuestos: 0 });
  const total_ventas = db.prepare("SELECT COALESCE(SUM(total),0) as t FROM pos_pedidos WHERE date(creado_en) = date('now','localtime')").get().t;
  const total_pedidos = db.prepare("SELECT COUNT(*) as c FROM pos_pedidos WHERE date(creado_en) = date('now','localtime')").get().c;
  res.json({ total_ventas, total_pedidos, total_impuestos: total_ventas * 0.07 });
});
app.post('/api/pos/cierre-z', authMw, (req, res) => {
  if (!db) return res.status(500).json({ error: 'DB off' });
  const total = db.prepare("SELECT COALESCE(SUM(total),0) as t FROM pos_pedidos WHERE date(creado_en) = date('now','localtime')").get().t;
  res.json({ ok: true, total_ventas: total, mensaje: 'Cierre Z generado' });
});

// Bodegas
app.get('/api/bodegas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM bodegas ORDER BY nombre').all());
});

// ERP
app.get('/api/erp/dashboard', authMw, (req, res) => {
  if (!db) return res.json({ ventas_hoy: 0, mesas_ocupadas: 0, pedidos_activos: 0, stock_bajo: 0, menu_count: 0 });
  res.json({
    ventas_hoy: db.prepare("SELECT COALESCE(SUM(total),0) as t FROM pos_pedidos WHERE date(creado_en) = date('now','localtime')").get().t,
    mesas_ocupadas: db.prepare("SELECT COUNT(*) as c FROM pos_mesas WHERE estado = 'ocupada'").get().c,
    pedidos_activos: db.prepare("SELECT COUNT(*) as c FROM pos_pedidos WHERE estado = 'abierto'").get().c,
    stock_bajo: db.prepare("SELECT COUNT(*) as c FROM inventario WHERE cantidad < 10").get().c,
    menu_count: db.prepare("SELECT COUNT(*) as c FROM pos_productos WHERE activo = 1").get().c
  });
});

// Ventas
app.get('/api/ventas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM facturas ORDER BY creado_en DESC').all());
});

// Compras
app.get('/api/compras', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json([]); // placeholder
});

// Finanzas
app.get('/api/finanzas', authMw, (req, res) => {
  if (!db) return res.json({});
  res.json({ balance: 0, ingresos: 0, gastos: 0 });
});

// RRHH
app.get('/api/rrhh/empleados', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare("SELECT id, nombre, email, rol_id FROM usuarios").all());
});

// CRM
app.get('/api/crm/clientes', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM clientes ORDER BY nombre').all());
});

// Almacen
app.get('/api/almacen', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT i.*, b.nombre as bodega_nombre FROM inventario i JOIN bodegas b ON i.bodega_id = b.id ORDER BY i.producto').all());
});

// Reportes
app.get('/api/reportes/ventas', authMw, (req, res) => {
  if (!db) return res.json([]);
  const period = req.query.periodo || 'hoy';
  let where = "date(creado_en) = date('now','localtime')";
  if (period === 'semana') where = "creado_en >= datetime('now', '-7 days', 'localtime')";
  if (period === 'mes') where = "creado_en >= datetime('now', '-30 days', 'localtime')";
  res.json(db.prepare(`SELECT * FROM pos_pedidos WHERE ${where} ORDER BY creado_en DESC`).all());
});

// Recetas
app.get('/api/recetas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json([]); // placeholder
});

// Engage
app.get('/api/engage/campanas', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json([]); // placeholder
});

// Motor Fiscal
app.get('/api/motor-fiscal', authMw, (req, res) => {
  if (!db) return res.json({ estado: 'simulado' });
  res.json({ estado: 'simulado', mensaje: 'Motor fiscal en modo simulación' });
});

// Core
app.get('/api/core/usuarios', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT id, nombre, email, rol_id FROM usuarios').all());
});
app.get('/api/core/roles', authMw, (req, res) => {
  if (!db) return res.json([]);
  res.json(db.prepare('SELECT * FROM roles').all());
});

// Servir frontend — en Vercel los estáticos están en public/, local en productos/erp/dist/
const frontendDist = IS_PRODUCTION
  ? path.join(__dirname, '..', 'public')
  : path.join(__dirname, '..', 'productos', 'erp', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use((err, req, res, next) => {
  const id = crypto.randomUUID?.() || Date.now().toString(36);
  console.error(`[${id}]`, err.message);
  res.status(err.status||500).json({ error: IS_PRODUCTION?'Error interno':err.message, id });
});

export default app;
