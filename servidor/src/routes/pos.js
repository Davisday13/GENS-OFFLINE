import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';
import { authMiddleware } from '../auth.js';

const router = Router();
router.use(authMiddleware);

function crearAsientoContable(db, fecha, tipo, referencia, descripcion, partidas, usuarioId) {
  const asientoId = uuidv4();
  const numero = `AS-${String(Date.now()).slice(-6)}`;
  db.prepare('INSERT INTO fin_asientos (id, numero, fecha, tipo, referencia, descripcion, usuario_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(asientoId, numero, fecha, tipo, referencia, descripcion, usuarioId || null, new Date().toISOString());
  for (const p of partidas) {
    db.prepare('INSERT INTO fin_asientos_detalle (id, asiento_id, cuenta_id, debe, haber, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), asientoId, p.cuentaId, p.debe || 0, p.haber || 0, new Date().toISOString());
  }
}

function obtenerCuenta(db, codigo) {
  return db.prepare("SELECT id FROM fin_plan_cuentas WHERE codigo = ? LIMIT 1").get(codigo);
}

function integrarPedidoAErp(db, pedido, items, total, metodoPago, usuarioId) {
  try {
    const clientesDefault = db.prepare('SELECT id, nombre FROM vta_clientes WHERE activo = 1 LIMIT 1').get();
    const clienteId = clientesDefault?.id || null;
    const hoy = new Date().toISOString().slice(0, 10);
    const ordenId = uuidv4();
    const ordenNumero = `POS-${String(Date.now()).slice(-6)}`;
    const itemsFactura = (items || []).map(item => ({
      producto: item.nombre || item.producto || 'Producto POS',
      cantidad: item.cantidad || 1,
      precio: item.precio || 0,
      subtotal: (item.cantidad || 1) * (item.precio || 0),
    }));
    const subtotal = itemsFactura.reduce((s, i) => s + i.subtotal, 0);
    const itbms = Math.round(subtotal * 0.07 * 100) / 100;
    const totalConItbms = subtotal + itbms;
    db.prepare(`
      INSERT INTO vta_ordenes_venta (id, numero, cliente_id, fecha, items, subtotal, itbms, total, estado, metodo_pago, vendedor_id, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ordenId, ordenNumero, clienteId, hoy, JSON.stringify(itemsFactura), subtotal, itbms, totalConItbms, 'completada', metodoPago || 'efectivo', usuarioId || null, `POS: ${pedido.mesa_id || 'mostrador'}`);
    const facturaId = uuidv4();
    const facturaNumero = `FAC-POS-${String(Date.now()).slice(-6)}`;
    db.prepare(`
      INSERT INTO vta_facturas (id, numero, orden_venta_id, cliente_id, fecha, subtotal, itbms, total, estado, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(facturaId, facturaNumero, ordenId, clienteId, hoy, subtotal, itbms, totalConItbms, 'pagada', JSON.stringify(itemsFactura));
    const ctaCaja = obtenerCuenta(db, '110101');
    const ctaVenta = obtenerCuenta(db, '410101');
    const ctaItbms = obtenerCuenta(db, '210501');
    if (ctaCaja && ctaVenta) {
      const partidas = [
        { cuentaId: ctaCaja.id, debe: totalConItbms, haber: 0 },
        { cuentaId: ctaVenta.id, debe: 0, haber: subtotal },
      ];
      if (ctaItbms && itbms > 0) partidas.push({ cuentaId: ctaItbms.id, debe: 0, haber: itbms });
      crearAsientoContable(db, hoy, 'venta', facturaNumero, `Venta POS: ${facturaNumero}`, partidas, usuarioId);
    }
    const bodegaDefault = db.prepare('SELECT id FROM inv_bodegas ORDER BY created_at LIMIT 1').get();
    if (bodegaDefault) {
      for (const item of itemsFactura) {
        const prod = db.prepare('SELECT id FROM inv_productos WHERE nombre = ? LIMIT 1').get(item.producto);
        if (prod) {
          db.prepare("UPDATE inv_existencias SET cantidad = cantidad - ?, updated_at = datetime('now') WHERE producto_id = ? AND bodega_id = ?").run(item.cantidad, prod.id, bodegaDefault.id);
          db.prepare('INSERT INTO inv_movimientos (id, tipo, producto_id, bodega_id, cantidad, referencia, usuario_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), 'salida_venta', prod.id, bodegaDefault.id, -item.cantidad, facturaNumero, usuarioId || null, `Venta POS: ${item.producto}`);
        }
      }
    }
    db.prepare('UPDATE pos_pedidos SET facturado = 1 WHERE id = ?').run(pedido.id);
  } catch (err) {
    console.error('Error integrando pedido a ERP:', err.message);
  }
}

function integrarCierreAContabilidad(db, cierreId, fecha, totalVentas, totalItbms) {
  try {
    db.prepare(`
      INSERT INTO cont_cierres_z (id, fecha, tipo, total_ventas, total_itbms, notas)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), fecha || new Date().toISOString().slice(0, 10), 'Z', totalVentas || 0, totalItbms || 0, `Cierre POS: ${cierreId}`);
    const ctaCaja = obtenerCuenta(db, '110101');
    const ctaVenta = obtenerCuenta(db, '410101');
    if (ctaCaja && ctaVenta) {
      crearAsientoContable(db, fecha, 'cierre_z', `CIERRE-${cierreId.slice(0, 8)}`, 'Cierre Z POS', [
        { cuentaId: ctaCaja.id, debe: totalVentas || 0, haber: 0 },
        { cuentaId: ctaVenta.id, debe: 0, haber: totalVentas || 0 },
      ]);
    }
  } catch (err) {
    console.error('Error integrando cierre a contabilidad:', err.message);
  }
}

router.get('/mesas', (req, res) => {
  const db = getDb();
  const mesas = db.prepare('SELECT * FROM pos_mesas ORDER BY nombre').all();
  res.json(mesas);
});

router.post('/mesas', (req, res) => {
  const db = getDb();
  const { nombre, capacidad, pos_x, pos_y } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO pos_mesas (id, nombre, capacidad, pos_x, pos_y) VALUES (?,?,?,?,?)')
    .run(id, nombre, capacidad || 4, pos_x || 0, pos_y || 0);
  res.status(201).json({ id, nombre, capacidad: capacidad || 4, estado: 'libre', pos_x: pos_x || 0, pos_y: pos_y || 0 });
});

router.put('/mesas/:id/estado', (req, res) => {
  const db = getDb();
  const { estado } = req.body;
  db.prepare('UPDATE pos_mesas SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ ok: true });
});

router.get('/categorias', (req, res) => {
  const db = getDb();
  const categorias = db.prepare('SELECT * FROM pos_categorias ORDER BY orden, nombre').all();
  res.json(categorias);
});

router.post('/categorias', (req, res) => {
  const db = getDb();
  const { nombre, color, orden } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO pos_categorias (id, nombre, color, orden) VALUES (?,?,?,?)')
    .run(id, nombre, color || '#003153', orden || 0);
  res.status(201).json({ id, nombre, color: color || '#003153', orden: orden || 0 });
});

router.get('/productos', (req, res) => {
  const db = getDb();
  const { categoria_id } = req.query;
  let productos;
  if (categoria_id) {
    productos = db.prepare('SELECT p.*, c.nombre as categoria_nombre FROM pos_productos p LEFT JOIN pos_categorias c ON p.categoria_id = c.id WHERE p.categoria_id = ? ORDER BY p.nombre').all(categoria_id);
  } else {
    productos = db.prepare('SELECT p.*, c.nombre as categoria_nombre FROM pos_productos p LEFT JOIN pos_categorias c ON p.categoria_id = c.id ORDER BY p.nombre').all();
  }
  res.json(productos);
});

router.post('/productos', (req, res) => {
  const db = getDb();
  const { nombre, categoria_id, precio, costo } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO pos_productos (id, nombre, categoria_id, precio, costo) VALUES (?,?,?,?,?)')
    .run(id, nombre, categoria_id || null, precio || 0, costo || 0);
  res.status(201).json({ id, nombre, categoria_id: categoria_id || null, precio: precio || 0, costo: costo || 0, disponible: 1 });
});

router.put('/productos/:id', (req, res) => {
  const db = getDb();
  const { nombre, categoria_id, precio, costo, disponible } = req.body;
  const updates = [];
  const values = [];
  if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre); }
  if (categoria_id !== undefined) { updates.push('categoria_id = ?'); values.push(categoria_id); }
  if (precio !== undefined) { updates.push('precio = ?'); values.push(precio); }
  if (costo !== undefined) { updates.push('costo = ?'); values.push(costo); }
  if (disponible !== undefined) { updates.push('disponible = ?'); values.push(disponible); }
  if (updates.length === 0) return res.status(400).json({ error: 'Sin datos' });
  values.push(req.params.id);
  db.prepare(`UPDATE pos_productos SET ${updates.join(',')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

router.get('/pedidos', (req, res) => {
  const db = getDb();
  const { estado } = req.query;
  let pedidos;
  if (estado) {
    pedidos = db.prepare('SELECT * FROM pos_pedidos WHERE estado = ? ORDER BY created_at DESC').all(estado);
  } else {
    pedidos = db.prepare('SELECT * FROM pos_pedidos ORDER BY created_at DESC').all();
  }
  res.json(pedidos);
});

router.post('/pedidos', (req, res) => {
  const db = getDb();
  const { mesa_id, items, total } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO pos_pedidos (id, mesa_id, items, total) VALUES (?,?,?,?)')
    .run(id, mesa_id || null, JSON.stringify(items || []), total || 0);
  if (mesa_id) {
    db.prepare('UPDATE pos_mesas SET estado = ? WHERE id = ?').run('ocupada', mesa_id);
  }
  res.status(201).json({ id, mesa_id: mesa_id || null, items: items || [], total: total || 0, estado: 'abierto' });
});

router.put('/pedidos/:id', (req, res) => {
  const db = getDb();
  const { items, total, estado, metodo_pago } = req.body;
  const pedido = db.prepare('SELECT * FROM pos_pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  if (items !== undefined) db.prepare('UPDATE pos_pedidos SET items = ? WHERE id = ?').run(JSON.stringify(items), req.params.id);
  if (total !== undefined) db.prepare('UPDATE pos_pedidos SET total = ? WHERE id = ?').run(total, req.params.id);
  if (metodo_pago !== undefined) db.prepare('UPDATE pos_pedidos SET metodo_pago = ? WHERE id = ?').run(metodo_pago, req.params.id);
  if (estado !== undefined) {
    const estadoAnterior = pedido.estado;
    db.prepare('UPDATE pos_pedidos SET estado = ? WHERE id = ?').run(estado, req.params.id);
    if (estado === 'cerrado' && pedido.mesa_id) {
      db.prepare('UPDATE pos_mesas SET estado = ? WHERE id = ?').run('libre', pedido.mesa_id);
    }
    if (estado === 'cerrado' && (estadoAnterior !== 'cerrado' || !pedido.facturado)) {
      const itemsActuales = items || JSON.parse(pedido.items || '[]');
      const totalActual = total !== undefined ? total : pedido.total;
      integrarPedidoAErp(db, { ...pedido, mesa_id: pedido.mesa_id }, itemsActuales, totalActual, metodo_pago || pedido.metodo_pago, req.usuario?.id);
    }
  }
  res.json({ ok: true });
});

router.get('/facturas', (req, res) => {
  const db = getDb();
  const facturas = db.prepare('SELECT * FROM pos_facturas ORDER BY created_at DESC').all();
  res.json(facturas);
});

router.post('/facturas', (req, res) => {
  const db = getDb();
  const { pedido_id, ruc, cliente, total, itbms } = req.body;
  const id = uuidv4();
  const numero = `FE-${String(Date.now()).slice(-8)}`;
  db.prepare('INSERT INTO pos_facturas (id, pedido_id, numero, ruc, cliente, total, itbms, cufe, estado) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, pedido_id || null, numero, ruc || '', cliente || '', total || 0, itbms || 0, `CUFE-${uuidv4().slice(0, 8).toUpperCase()}`, 'emitida');
  if (pedido_id) db.prepare('UPDATE pos_pedidos SET facturado = 1 WHERE id = ?').run(pedido_id);
  res.status(201).json({ id, numero, cufe: `CUFE-${uuidv4().slice(0, 8).toUpperCase()}` });
});

router.get('/cierres', (req, res) => {
  const db = getDb();
  const cierres = db.prepare('SELECT * FROM pos_cierres ORDER BY created_at DESC').all();
  res.json(cierres);
});

router.post('/cierres', (req, res) => {
  const db = getDb();
  const { fecha, tipo, total_ventas, total_itbms, formas_pago, conteo_billetes, diferencia } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO pos_cierres (id, fecha, tipo, total_ventas, total_itbms, formas_pago, conteo_billetes, diferencia) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, fecha || new Date().toISOString().slice(0, 10), tipo || 'X', total_ventas || 0, total_itbms || 0,
      JSON.stringify(formas_pago || {}), JSON.stringify(conteo_billetes || {}), diferencia || 0);
  integrarCierreAContabilidad(db, id, fecha, total_ventas, total_itbms, formas_pago);
  res.status(201).json({ id });
});

export default router;
