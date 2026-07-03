import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

let db;

import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

function loadBetterSqlite() {
  try {
    return _require('better-sqlite3');
  } catch (e) {
    console.error('better-sqlite3 not available:', e.message);
    return null;
  }
}

function getWritablePath() {
  const isVercel = process.env.VERCEL === '1' || (!fs.existsSync(DATA_DIR) && process.env.TMPDIR);
  if (isVercel) {
    const tmpDir = path.join('/tmp', 'gens-data');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  return DATA_DIR;
}

export function initDb() {
  if (db) return db;
  const Database = loadBetterSqlite();
  if (!Database) throw new Error('No SQLite library available');
  const dir = getWritablePath();
  const dbPath = path.join(dir, 'gens.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function getDb() {
  return db;
}

export function runMigrations() {
  if (!db) return;
  const sqls = [
    `CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, nombre TEXT NOT NULL, password TEXT NOT NULL, rol TEXT NOT NULL DEFAULT 'usuario', schema_acceso TEXT NOT NULL DEFAULT 'todos', activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, schema_name TEXT UNIQUE NOT NULL, productos TEXT NOT NULL DEFAULT '[]', activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS sesiones (id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id), token TEXT UNIQUE NOT NULL, expira_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_cierres_z (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'X', total_ventas REAL NOT NULL DEFAULT 0, total_itbms REAL NOT NULL DEFAULT 0, efectivo REAL NOT NULL DEFAULT 0, tarjeta REAL NOT NULL DEFAULT 0, otros REAL NOT NULL DEFAULT 0, image_path TEXT, procesado INTEGER NOT NULL DEFAULT 0, notas TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_gastos (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, categoria TEXT NOT NULL, descripcion TEXT NOT NULL, monto REAL NOT NULL, metodo_pago TEXT NOT NULL DEFAULT 'efectivo', image_path TEXT, proveedor TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_arqueos (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, monto_sistema REAL NOT NULL DEFAULT 0, monto_contado REAL NOT NULL DEFAULT 0, diferencia REAL NOT NULL DEFAULT 0, observaciones TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_compras (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, proveedor TEXT NOT NULL, documento TEXT, subtotal REAL NOT NULL DEFAULT 0, itbms REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, estado TEXT NOT NULL DEFAULT 'pendiente', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_conciliacion (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'banco', descripcion TEXT NOT NULL, monto REAL NOT NULL, estado TEXT NOT NULL DEFAULT 'pendiente', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cont_asientos (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, tipo TEXT NOT NULL, referencia TEXT, descripcion TEXT NOT NULL, debe REAL NOT NULL DEFAULT 0, haber REAL NOT NULL DEFAULT 0, cuenta TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_mesas (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, capacidad INTEGER NOT NULL DEFAULT 4, estado TEXT NOT NULL DEFAULT 'libre', pos_x REAL NOT NULL DEFAULT 0, pos_y REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_categorias (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, color TEXT DEFAULT '#003153', orden INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_productos (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, categoria_id TEXT REFERENCES pos_categorias(id), precio REAL NOT NULL DEFAULT 0, costo REAL NOT NULL DEFAULT 0, disponible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_pedidos (id TEXT PRIMARY KEY, mesa_id TEXT REFERENCES pos_mesas(id), cliente TEXT, estado TEXT NOT NULL DEFAULT 'abierto', items TEXT NOT NULL DEFAULT '[]', total REAL NOT NULL DEFAULT 0, metodo_pago TEXT, facturado INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_facturas (id TEXT PRIMARY KEY, pedido_id TEXT REFERENCES pos_pedidos(id), numero TEXT UNIQUE NOT NULL, ruc TEXT, cliente TEXT, total REAL NOT NULL DEFAULT 0, itbms REAL NOT NULL DEFAULT 0, cufe TEXT, estado TEXT NOT NULL DEFAULT 'emitida', pdf_path TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pos_cierres (id TEXT PRIMARY KEY, fecha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'X', total_ventas REAL NOT NULL DEFAULT 0, total_itbms REAL NOT NULL DEFAULT 0, formas_pago TEXT NOT NULL DEFAULT '{}', conteo_billetes TEXT DEFAULT '{}', diferencia REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_productos (id TEXT PRIMARY KEY, codigo TEXT UNIQUE, nombre TEXT NOT NULL, descripcion TEXT, categoria TEXT, precio_venta REAL NOT NULL DEFAULT 0, costo REAL NOT NULL DEFAULT 0, stock REAL NOT NULL DEFAULT 0, stock_minimo REAL NOT NULL DEFAULT 0, unidad TEXT NOT NULL DEFAULT 'unidad', activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_bodegas (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, ubicacion TEXT, activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_inventario (id TEXT PRIMARY KEY, producto_id TEXT NOT NULL REFERENCES erp_productos(id), bodega_id TEXT NOT NULL REFERENCES erp_bodegas(id), cantidad REAL NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_clientes (id TEXT PRIMARY KEY, ruc TEXT UNIQUE, nombre TEXT NOT NULL, email TEXT, telefono TEXT, direccion TEXT, credito REAL NOT NULL DEFAULT 0, activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_proveedores (id TEXT PRIMARY KEY, ruc TEXT UNIQUE, nombre TEXT NOT NULL, email TEXT, telefono TEXT, direccion TEXT, activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_facturas (id TEXT PRIMARY KEY, numero TEXT UNIQUE NOT NULL, cliente_id TEXT REFERENCES erp_clientes(id), fecha TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'factura', subtotal REAL NOT NULL DEFAULT 0, itbms REAL NOT NULL DEFAULT 0, descuento REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, estado TEXT NOT NULL DEFAULT 'pendiente', items TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS erp_planilla (id TEXT PRIMARY KEY, empleado TEXT NOT NULL, cedula TEXT, cargo TEXT, salario_base REAL NOT NULL DEFAULT 0, deducciones REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, periodo TEXT NOT NULL, pagado INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS engage_qrs (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, url_destino TEXT NOT NULL, estilo TEXT NOT NULL DEFAULT '{}', escaneos INTEGER NOT NULL DEFAULT 0, activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS engage_escaneos (id TEXT PRIMARY KEY, qr_id TEXT NOT NULL REFERENCES engage_qrs(id), ip TEXT, user_agent TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS engage_menu_items (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT, precio REAL NOT NULL DEFAULT 0, categoria TEXT NOT NULL DEFAULT 'general', disponible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ];
  for (const sql of sqls) db.exec(sql);
}

export function seedData() {
  if (!db) return;
  const existing = db.prepare('SELECT COUNT(*) as count FROM core_usuarios').get();
  if (existing && existing.count > 0) return;
  try {
    for (const r of [{id:'rol-admin',n:'super_admin',d:'Acceso total'},{id:'rol-user',n:'usuario',d:'Acceso básico'},{id:'rol-ventas',n:'vendedor',d:'Ventas y clientes'},{id:'rol-inv',n:'bodeguero',d:'Inventario y almacén'}])
      db.prepare('INSERT INTO core_roles (id, nombre, descripcion) VALUES (?,?,?)').run(r.id, r.n, r.d);
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO core_usuarios (id, email, nombre, password, rol_id) VALUES (?,?,?,?,?)').run(crypto.randomUUID(), 'admin@gens.local', 'Admin GENS', hash, 'rol-admin');
    db.prepare('INSERT INTO core_usuarios (id, email, nombre, password, rol_id) VALUES (?,?,?,?,?)').run(crypto.randomUUID(), 'usuario@gens.local', 'Usuario Demo', hash, 'rol-user');
    const b1 = crypto.randomUUID();
    db.prepare('INSERT INTO inv_bodegas (id, nombre, ubicacion) VALUES (?,?,?)').run(b1, 'Cocina Principal', 'Planta Baja');
    for (const [nom, cat, costo, min, uni, stock] of [
      ['Carne Molida Res','Carnes',8.50,10,'kg',25],['Pan de Hamburguesa','Panadería',0.75,50,'u',120],
      ['Pollo Entero','Carnes',3.20,10,'kg',15],['Papas','Verduras',1.50,20,'kg',40],
      ['Aceite Vegetal','Abarrotes',2.80,10,'litros',18],['Queso Amarillo','Lácteos',4.50,5,'kg',8],
      ['Lechuga','Verduras',0.90,10,'u',20],['Tomate','Verduras',1.20,10,'kg',12],
    ]) {
      const id = crypto.randomUUID(); db.prepare('INSERT INTO inv_productos (id,codigo,nombre,categoria,precio_venta,costo,stock_minimo,unidad) VALUES (?,?,?,?,?,?,?,?)').run(id,`ING-${id.slice(0,4).toUpperCase()}`,nom,cat,0,costo,min,uni);
      db.prepare('INSERT INTO inv_existencias (id,producto_id,bodega_id,cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(),id,b1,stock);
    }
    db.prepare('INSERT INTO vta_clientes (id,ruc,nombre,credito_limite,credito_disponible) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),'123456-1-123456','Comercial del Sur, S.A.',5000,5000);
    db.prepare('INSERT INTO vta_clientes (id,ruc,nombre,credito_limite,credito_disponible) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),'789012-1-789012','Restaurante El Fogón, S.A.',10000,10000);
    for (const [ruc,nom,plazo] of [['111111-1-111111','Carnes Premium, S.A.',30],['222222-1-222222','Distribuidora de Alimentos, S.A.',45],['333333-1-333333','Panadería El Trigal',15]])
      db.prepare('INSERT INTO com_proveedores (id,ruc,nombre,plazo_pago_dias) VALUES (?,?,?,?)').run(crypto.randomUUID(),ruc,nom,plazo);
    for (const [nom,cap,x,y] of [['Mesa 1',2,10,10],['Mesa 2',4,30,10],['Mesa 3',4,50,10],['Mesa 4',6,10,40],['Mesa 5',2,30,40],['Mesa 6',8,50,40],['Barra',2,5,60]])
      db.prepare('INSERT INTO pos_mesas (id,nombre,capacidad,pos_x,pos_y) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),nom,cap,x,y);
    const catIds = {};
    for (const [nom,color,orden] of [['Combos','#E74C3C',1],['Hamburguesas','#F39C12',2],['Pollo','#2ECC71',3],['Extras','#3498DB',4],['Bebidas','#9B59B6',5],['Postres','#E91E63',6]]) {
      const id = crypto.randomUUID(); catIds[nom]=id; db.prepare('INSERT INTO pos_categorias (id,nombre,color,orden) VALUES (?,?,?,?)').run(id,nom,color,orden);
    }
    for (const [nom,cat,precio,costo] of [
      ['Combo Hamburguesa','Combos',9.50,4.20],['Combo Pollo Frito','Combos',10.50,4.80],['Combo Familiar','Combos',22.00,9.50],
      ['Hamburguesa Clásica','Hamburguesas',6.50,2.80],['Hamburguesa Queso','Hamburguesas',7.50,3.20],['Hamburguesa Doble','Hamburguesas',9.00,4.00],['Hamburguesa BBQ','Hamburguesas',8.50,3.50],
      ['Pollo Frito (1/4)','Pollo',5.50,2.20],['Pollo Frito (1/2)','Pollo',9.00,3.80],['Pollo Frito Entero','Pollo',16.00,6.50],['Alitas BBQ (6)','Pollo',7.00,3.00],
      ['Papas Fritas Peq.','Extras',2.50,0.80],['Papas Fritas Grand.','Extras',4.00,1.20],['Aros de Cebolla','Extras',3.50,1.00],['Ensalada','Extras',3.00,1.30],
      ['Refresco','Bebidas',1.50,0.40],['Agua','Bebidas',1.00,0.30],['Jugo Natural','Bebidas',2.50,0.70],['Cerveza','Bebidas',2.00,0.90],
      ['Flan','Postres',3.00,1.20],['Pastel de Chocolate','Postres',3.50,1.40],
    ]) db.prepare('INSERT INTO pos_productos (id,nombre,categoria_id,precio,costo) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),nom,catIds[cat],precio,costo);
    for (const [codigo,nombre,tipo] of [['110101','Caja General','activo'],['110102','Bancos','activo'],['110201','Cuentas por Cobrar','activo'],['110301','Inventarios','activo'],['210501','ITBMS por Pagar','pasivo'],['310101','Capital Social','patrimonio'],['410101','Ventas','ingreso'],['510101','Costo de Ventas','gasto'],['510201','Gastos Operativos','gasto']])
      db.prepare('INSERT OR IGNORE INTO fin_plan_cuentas (id,codigo,nombre,tipo,nivel) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),codigo,nombre,tipo,2);
  } catch (e) { console.error('Seed error:', e.message); }
}
