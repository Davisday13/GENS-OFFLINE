import { runMigrations, getDb, seedData } from './database.js';
import { hashPassword } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

runMigrations();
const db = getDb();

const existingUsers = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
if (existingUsers.count > 0) {
  console.log('BD ya contiene datos. Omitiendo seed.');
  process.exit(0);
}

const passHash = hashPassword('admin123');

const adminId = uuidv4();
db.prepare(`INSERT INTO usuarios (id, email, nombre, password, rol, schema_acceso)
  VALUES (?,?,?,?,?,?)`).run(adminId, 'admin@gens.local', 'Admin GENS', passHash, 'super_admin', 'todos');

const userId = uuidv4();
db.prepare(`INSERT INTO usuarios (id, email, nombre, password, rol, schema_acceso)
  VALUES (?,?,?,?,?,?)`).run(userId, 'usuario@gens.local', 'Usuario Demo', passHash, 'usuario', 'todos');

db.prepare(`INSERT INTO clientes (id, nombre, schema_name, productos) VALUES (?,?,?,?)`)
  .run(uuidv4(), 'Cliente Demo', 'demo', '["pos","cont","erp"]');

seedData();

const categorias = [
  { id: uuidv4(), nombre: 'Entradas', color: '#FF6B35', orden: 1 },
  { id: uuidv4(), nombre: 'Platos Fuertes', color: '#003153', orden: 2 },
  { id: uuidv4(), nombre: 'Bebidas', color: '#1ED179', orden: 3 },
  { id: uuidv4(), nombre: 'Postres', color: '#7C3AED', orden: 4 },
];
for (const c of categorias) {
  db.prepare('INSERT INTO pos_categorias (id, nombre, color, orden) VALUES (?,?,?,?)').run(c.id, c.nombre, c.color, c.orden);
}

const productos = [
  { nombre: 'Ceviche Mixto', categoria: categorias[0].id, precio: 8.50, costo: 3.20 },
  { nombre: 'Patacones con Guacamole', categoria: categorias[0].id, precio: 5.00, costo: 1.80 },
  { nombre: 'Arroz con Pollo', categoria: categorias[1].id, precio: 12.00, costo: 4.50 },
  { nombre: 'Bistec Encebollado', categoria: categorias[1].id, precio: 14.00, costo: 5.20 },
  { nombre: 'Coca Cola 355ml', categoria: categorias[2].id, precio: 1.50, costo: 0.60 },
  { nombre: 'Jugo Natural', categoria: categorias[2].id, precio: 2.50, costo: 0.80 },
  { nombre: 'Tres Leches', categoria: categorias[3].id, precio: 4.50, costo: 1.50 },
  { nombre: 'Flan de Caramelo', categoria: categorias[3].id, precio: 3.50, costo: 1.20 },
];
for (const p of productos) {
  db.prepare('INSERT INTO pos_productos (id, nombre, categoria_id, precio, costo) VALUES (?,?,?,?,?)')
    .run(uuidv4(), p.nombre, p.categoria, p.precio, p.costo);
}

const mesas = [
  { nombre: 'Mesa 1', capacidad: 2, pos_x: 50, pos_y: 50 },
  { nombre: 'Mesa 2', capacidad: 4, pos_x: 200, pos_y: 50 },
  { nombre: 'Mesa 3', capacidad: 4, pos_x: 350, pos_y: 50 },
  { nombre: 'Mesa 4', capacidad: 6, pos_x: 50, pos_y: 200 },
  { nombre: 'Mesa 5', capacidad: 6, pos_x: 200, pos_y: 200 },
  { nombre: 'Mesa 6', capacidad: 8, pos_x: 350, pos_y: 200 },
  { nombre: 'Barra 1', capacidad: 1, pos_x: 500, pos_y: 50 },
  { nombre: 'Barra 2', capacidad: 1, pos_x: 500, pos_y: 150 },
];
for (const m of mesas) {
  db.prepare('INSERT INTO pos_mesas (id, nombre, capacidad, pos_x, pos_y) VALUES (?,?,?,?,?)')
    .run(uuidv4(), m.nombre, m.capacidad, m.pos_x, m.pos_y);
}

const erpProductos = [
  { codigo: 'P-001', nombre: 'Laptop Pro', categoria: 'Electrónicos', precio_venta: 1200, costo: 900, stock: 10, stock_minimo: 3 },
  { codigo: 'P-002', nombre: 'Monitor 27"', categoria: 'Electrónicos', precio_venta: 350, costo: 250, stock: 15, stock_minimo: 5 },
  { codigo: 'P-003', nombre: 'Teclado Mecánico', categoria: 'Accesorios', precio_venta: 85, costo: 45, stock: 30, stock_minimo: 10 },
  { codigo: 'P-004', nombre: 'Mouse Inalámbrico', categoria: 'Accesorios', precio_venta: 45, costo: 25, stock: 25, stock_minimo: 10 },
  { codigo: 'P-005', nombre: 'Escritorio Ejecutivo', categoria: 'Muebles', precio_venta: 450, costo: 280, stock: 5, stock_minimo: 2 },
];
for (const p of erpProductos) {
  db.prepare('INSERT INTO erp_productos (id, codigo, nombre, categoria, precio_venta, costo, stock, stock_minimo, unidad) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(uuidv4(), p.codigo, p.nombre, p.categoria, p.precio_venta, p.costo, p.stock, p.stock_minimo, 'unidad');
}

const bodegaId = uuidv4();
db.prepare('INSERT INTO erp_bodegas (id, nombre, ubicacion) VALUES (?,?,?)').run(bodegaId, 'Bodega Principal', 'Planta Baja');
db.prepare('INSERT INTO erp_bodegas (id, nombre, ubicacion) VALUES (?,?,?)').run(uuidv4(), 'Bodega Secundaria', 'Almacén Externo');

const erpClientes = [
  { ruc: '123456-1-123456', nombre: 'Empresa ABC, S.A.' },
  { ruc: '789012-1-789012', nombre: 'Corporación XYZ, S.A.' },
];
for (const c of erpClientes) {
  db.prepare('INSERT INTO erp_clientes (id, ruc, nombre) VALUES (?,?,?)').run(uuidv4(), c.ruc, c.nombre);
}

const erpProveedores = [
  { ruc: '111111-1-111111', nombre: 'Distribuidora Mayorista, S.A.' },
  { ruc: '222222-1-222222', nombre: 'Importadora Global, S.A.' },
];
for (const p of erpProveedores) {
  db.prepare('INSERT INTO erp_proveedores (id, ruc, nombre) VALUES (?,?,?)').run(uuidv4(), p.ruc, p.nombre);
}

db.prepare(`INSERT INTO engage_qrs (id, nombre, url_destino, estilo, escaneos) VALUES (?,?,?,?,?)`)
  .run(uuidv4(), 'Menú Digital', 'http://localhost:5180/menu', '{"color":"#003153"}', 0);
db.prepare(`INSERT INTO engage_qrs (id, nombre, url_destino, estilo, escaneos) VALUES (?,?,?,?,?)`)
  .run(uuidv4(), 'Promo Verano', 'http://localhost:5180/promo', '{"color":"#FF6B35"}', 0);

const menuItems = [
  { nombre: 'Hamburguesa Clásica', descripcion: 'Carne 200g, queso, lechuga, tomate', precio: 8.99, categoria: 'Platos' },
  { nombre: 'Pizza Margarita', descripcion: 'Mozzarella, albahaca, tomate', precio: 10.99, categoria: 'Platos' },
  { nombre: 'Ensalada César', descripcion: 'Lechuga romana, parmesano, crutones', precio: 7.50, categoria: 'Entradas' },
  { nombre: 'Limonada Natural', descripcion: 'Limón fresco, hierbabuena', precio: 2.50, categoria: 'Bebidas' },
];
for (const item of menuItems) {
  db.prepare('INSERT INTO engage_menu_items (id, nombre, descripcion, precio, categoria) VALUES (?,?,?,?,?)')
    .run(uuidv4(), item.nombre, item.descripcion, item.precio, item.categoria);
}

console.log('Seed completado exitosamente.');
console.log('Usuarios creados:');
console.log('  admin@gens.local / admin123 (Super Admin)');
console.log('  usuario@gens.local / admin123 (Usuario)');
