import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import { definirModelo as coreModelo } from './modulos/core/modelo.js';
import { definirModelo as inventarioModelo } from './modulos/inventario/modelo.js';
import { definirModelo as ventasModelo } from './modulos/ventas/modelo.js';
import { definirModelo as comprasModelo } from './modulos/compras/modelo.js';
import { definirModelo as finanzasModelo } from './modulos/finanzas/modelo.js';
import { definirModelo as rrhhModelo } from './modulos/rrhh/modelo.js';
import { definirModelo as crmModelo } from './modulos/crm/modelo.js';
import { definirModelo as almacenModelo } from './modulos/almacen/modelo.js';
import { definirModelo as reportesModelo } from './modulos/reportes/modelo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'gens.db');

let db;

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode=WAL');
    db.exec('PRAGMA foreign_keys=ON');
  }
  return db;
}

export function runMigrations() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'usuario',
      schema_acceso TEXT NOT NULL DEFAULT 'todos',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      schema_name TEXT UNIQUE NOT NULL,
      productos TEXT NOT NULL DEFAULT '[]',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sesiones (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES usuarios(id),
      token TEXT UNIQUE NOT NULL,
      expira_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cont_cierres_z (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'X',
      total_ventas REAL NOT NULL DEFAULT 0,
      total_itbms REAL NOT NULL DEFAULT 0,
      efectivo REAL NOT NULL DEFAULT 0,
      tarjeta REAL NOT NULL DEFAULT 0,
      otros REAL NOT NULL DEFAULT 0,
      image_path TEXT,
      procesado INTEGER NOT NULL DEFAULT 0,
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cont_gastos (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
      image_path TEXT,
      proveedor TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cont_arqueos (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      monto_sistema REAL NOT NULL DEFAULT 0,
      monto_contado REAL NOT NULL DEFAULT 0,
      diferencia REAL NOT NULL DEFAULT 0,
      observaciones TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cont_compras (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      proveedor TEXT NOT NULL,
      documento TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cont_conciliacion (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'banco',
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cont_asientos (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      referencia TEXT,
      descripcion TEXT NOT NULL,
      debe REAL NOT NULL DEFAULT 0,
      haber REAL NOT NULL DEFAULT 0,
      cuenta TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_mesas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      capacidad INTEGER NOT NULL DEFAULT 4,
      estado TEXT NOT NULL DEFAULT 'libre',
      pos_x REAL NOT NULL DEFAULT 0,
      pos_y REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_categorias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      color TEXT DEFAULT '#003153',
      orden INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_productos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria_id TEXT REFERENCES pos_categorias(id),
      precio REAL NOT NULL DEFAULT 0,
      costo REAL NOT NULL DEFAULT 0,
      disponible INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_pedidos (
      id TEXT PRIMARY KEY,
      mesa_id TEXT REFERENCES pos_mesas(id),
      cliente TEXT,
      estado TEXT NOT NULL DEFAULT 'abierto',
      items TEXT NOT NULL DEFAULT '[]',
      total REAL NOT NULL DEFAULT 0,
      metodo_pago TEXT,
      facturado INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_facturas (
      id TEXT PRIMARY KEY,
      pedido_id TEXT REFERENCES pos_pedidos(id),
      numero TEXT UNIQUE NOT NULL,
      ruc TEXT,
      cliente TEXT,
      total REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      cufe TEXT,
      estado TEXT NOT NULL DEFAULT 'emitida',
      pdf_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_cierres (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'X',
      total_ventas REAL NOT NULL DEFAULT 0,
      total_itbms REAL NOT NULL DEFAULT 0,
      formas_pago TEXT NOT NULL DEFAULT '{}',
      conteo_billetes TEXT DEFAULT '{}',
      diferencia REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_productos (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria TEXT,
      precio_venta REAL NOT NULL DEFAULT 0,
      costo REAL NOT NULL DEFAULT 0,
      stock REAL NOT NULL DEFAULT 0,
      stock_minimo REAL NOT NULL DEFAULT 0,
      unidad TEXT NOT NULL DEFAULT 'unidad',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_bodegas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_inventario (
      id TEXT PRIMARY KEY,
      producto_id TEXT NOT NULL REFERENCES erp_productos(id),
      bodega_id TEXT NOT NULL REFERENCES erp_bodegas(id),
      cantidad REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_clientes (
      id TEXT PRIMARY KEY,
      ruc TEXT UNIQUE,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      credito REAL NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_proveedores (
      id TEXT PRIMARY KEY,
      ruc TEXT UNIQUE,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_facturas (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      cliente_id TEXT REFERENCES erp_clientes(id),
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'factura',
      subtotal REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      descuento REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      items TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS erp_planilla (
      id TEXT PRIMARY KEY,
      empleado TEXT NOT NULL,
      cedula TEXT,
      cargo TEXT,
      salario_base REAL NOT NULL DEFAULT 0,
      deducciones REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      periodo TEXT NOT NULL,
      pagado INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engage_qrs (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      url_destino TEXT NOT NULL,
      estilo TEXT NOT NULL DEFAULT '{}',
      escaneos INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engage_escaneos (
      id TEXT PRIMARY KEY,
      qr_id TEXT NOT NULL REFERENCES engage_qrs(id),
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engage_menu_items (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL DEFAULT 0,
      categoria TEXT NOT NULL DEFAULT 'general',
      disponible INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  coreModelo(db);
  inventarioModelo(db);
  ventasModelo(db);
  comprasModelo(db);
  finanzasModelo(db);
  rrhhModelo(db);
  crmModelo(db);
  almacenModelo(db);
  reportesModelo(db);
}

export function seedData() {
  const db = getDb();
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM core_usuarios').get();
  if (existingUsers.count > 0) return;

  db.prepare("INSERT INTO core_roles (id, nombre, descripcion) VALUES (?, ?, ?)").run('rol-admin', 'super_admin', 'Acceso total al sistema');
  db.prepare("INSERT INTO core_roles (id, nombre, descripcion) VALUES (?, ?, ?)").run('rol-user', 'usuario', 'Acceso básico');
  db.prepare("INSERT INTO core_roles (id, nombre, descripcion) VALUES (?, ?, ?)").run('rol-ventas', 'vendedor', 'Acceso a ventas y clientes');
  db.prepare("INSERT INTO core_roles (id, nombre, descripcion) VALUES (?, ?, ?)").run('rol-inv', 'bodeguero', 'Acceso a inventario y almacén');

  const adminId = crypto.randomUUID();
  const hash = bcrypt.hashSync('admin123', 10);
  const stmt = db.prepare('INSERT INTO core_usuarios (id, email, nombre, password, rol_id) VALUES (?, ?, ?, ?, ?)');
  stmt.run(adminId, 'admin@gens.local', 'Admin GENS', hash, 'rol-admin');
  stmt.run(crypto.randomUUID(), 'usuario@gens.local', 'Usuario Demo', hash, 'rol-user');

  const bodega1Id = crypto.randomUUID();
  const bodega2Id = crypto.randomUUID();
  db.prepare('INSERT INTO inv_bodegas (id, nombre, ubicacion) VALUES (?, ?, ?)').run(bodega1Id, 'Bodega Principal', 'Planta Baja');
  db.prepare('INSERT INTO inv_bodegas (id, nombre, ubicacion) VALUES (?, ?, ?)').run(bodega2Id, 'Bodega Secundaria', 'Almacén Externo');

  const prod1Id = crypto.randomUUID();
  const prod2Id = crypto.randomUUID();
  const prod3Id = crypto.randomUUID();
  const prod4Id = crypto.randomUUID();
  const prod5Id = crypto.randomUUID();
  db.prepare('INSERT INTO inv_productos (id, codigo, nombre, categoria, precio_venta, costo, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?)').run(prod1Id, 'P-001', 'Laptop Pro', 'Electrónicos', 1200, 900, 3, 'unidad');
  db.prepare('INSERT INTO inv_productos (id, codigo, nombre, categoria, precio_venta, costo, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?)').run(prod2Id, 'P-002', 'Monitor 27"', 'Electrónicos', 350, 250, 5, 'unidad');
  db.prepare('INSERT INTO inv_productos (id, codigo, nombre, categoria, precio_venta, costo, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?)').run(prod3Id, 'P-003', 'Teclado Mecánico', 'Accesorios', 85, 45, 10, 'unidad');
  db.prepare('INSERT INTO inv_productos (id, codigo, nombre, categoria, precio_venta, costo, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?)').run(prod4Id, 'P-004', 'Mouse Inalámbrico', 'Accesorios', 45, 25, 10, 'unidad');
  db.prepare('INSERT INTO inv_productos (id, codigo, nombre, categoria, precio_venta, costo, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?)').run(prod5Id, 'P-005', 'Escritorio Ejecutivo', 'Muebles', 450, 280, 2, 'unidad');

  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(), prod1Id, bodega1Id, 10);
  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(), prod2Id, bodega1Id, 15);
  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(), prod3Id, bodega1Id, 30);
  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(), prod4Id, bodega1Id, 25);
  db.prepare('INSERT INTO inv_existencias (id, producto_id, bodega_id, cantidad) VALUES (?,?,?,?)').run(crypto.randomUUID(), prod5Id, bodega1Id, 5);

  const cli1Id = crypto.randomUUID();
  const cli2Id = crypto.randomUUID();
  db.prepare('INSERT INTO vta_clientes (id, ruc, nombre, credito_limite, credito_disponible) VALUES (?,?,?,?,?)').run(cli1Id, '123456-1-123456', 'Empresa ABC, S.A.', 5000, 5000);
  db.prepare('INSERT INTO vta_clientes (id, ruc, nombre, credito_limite, credito_disponible) VALUES (?,?,?,?,?)').run(cli2Id, '789012-1-789012', 'Corporación XYZ, S.A.', 10000, 10000);

  const prov1Id = crypto.randomUUID();
  const prov2Id = crypto.randomUUID();
  db.prepare('INSERT INTO com_proveedores (id, ruc, nombre, plazo_pago_dias) VALUES (?,?,?,?)').run(prov1Id, '111111-1-111111', 'Distribuidora Mayorista, S.A.', 30);
  db.prepare('INSERT INTO com_proveedores (id, ruc, nombre, plazo_pago_dias) VALUES (?,?,?,?)').run(prov2Id, '222222-1-222222', 'Importadora Global, S.A.', 45);
}
