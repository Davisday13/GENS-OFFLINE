import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, param, validationResult } from 'express-validator';
import { getDb } from '../../database.js';
import { authMiddleware } from '../../auth.js';

const router = Router();
router.use(authMiddleware);

function handleErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos inválidos', detalles: errors.array() });
  next();
}

router.get('/categorias', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM rec_categorias WHERE activo = 1 ORDER BY nombre').all());
});

router.post('/categorias', [
  body('nombre').trim().isLength({ min: 1 }),
], handleErrors, (req, res) => {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO rec_categorias (id, nombre, descripcion) VALUES (?, ?, ?)').run(id, req.body.nombre, req.body.descripcion || null);
  res.status(201).json({ id });
});

router.get('/', (req, res) => {
  const db = getDb();
  const recetas = db.prepare(`
    SELECT r.*, rc.nombre AS categoria_nombre,
      (SELECT COUNT(*) FROM rec_ingredientes WHERE receta_id = r.id) AS total_ingredientes
    FROM rec_recetas r
    LEFT JOIN rec_categorias rc ON r.categoria_id = rc.id
    WHERE r.activo = 1
    ORDER BY r.nombre
  `).all();
  res.json(recetas);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const receta = db.prepare(`
    SELECT r.*, rc.nombre AS categoria_nombre
    FROM rec_recetas r
    LEFT JOIN rec_categorias rc ON r.categoria_id = rc.id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
  receta.ingredientes = db.prepare(`
    SELECT ri.*, ip.nombre AS producto_nombre, ip.codigo AS producto_codigo, ip.unidad AS producto_unidad
    FROM rec_ingredientes ri
    LEFT JOIN inv_productos ip ON ri.producto_id = ip.id
    WHERE ri.receta_id = ?
  `).all(req.params.id);
  res.json(receta);
});

router.post('/', [
  body('nombre').trim().isLength({ min: 1 }).withMessage('Nombre requerido'),
  body('rendimiento').optional().isFloat({ min: 0.01 }),
], handleErrors, (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { codigo, nombre, descripcion, categoria_id, rendimiento, unidad_rendimiento, instrucciones, costo_mano_obra, precio_sugerido } = req.body;
  db.prepare(`
    INSERT INTO rec_recetas (id, codigo, nombre, descripcion, categoria_id, rendimiento, unidad_rendimiento, instrucciones, costo_mano_obra, precio_sugerido)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, codigo || `REC-${id.slice(0, 8)}`, nombre, descripcion || null, categoria_id || null, rendimiento || 1, unidad_rendimiento || 'porción', instrucciones || null, costo_mano_obra || 0, precio_sugerido || 0);
  res.status(201).json({ id });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { nombre, descripcion, categoria_id, rendimiento, unidad_rendimiento, instrucciones, costo_mano_obra, precio_sugerido, activo } = req.body;
  db.prepare(`
    UPDATE rec_recetas SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion),
      categoria_id = COALESCE(?, categoria_id), rendimiento = COALESCE(?, rendimiento),
      unidad_rendimiento = COALESCE(?, unidad_rendimiento), instrucciones = COALESCE(?, instrucciones),
      costo_mano_obra = COALESCE(?, costo_mano_obra), precio_sugerido = COALESCE(?, precio_sugerido),
      activo = COALESCE(?, activo)
    WHERE id = ?
  `).run(nombre, descripcion, categoria_id, rendimiento, unidad_rendimiento, instrucciones, costo_mano_obra, precio_sugerido, activo, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE rec_recetas SET activo = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/costo', (req, res) => {
  const db = getDb();
  const receta = db.prepare('SELECT * FROM rec_recetas WHERE id = ?').get(req.params.id);
  if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
  const ingredientes = db.prepare(`
    SELECT ri.*, ip.costo, (ri.cantidad * ip.costo) AS subtotal
    FROM rec_ingredientes ri
    LEFT JOIN inv_productos ip ON ri.producto_id = ip.id
    WHERE ri.receta_id = ?
  `).all(req.params.id);
  const costoInsumos = ingredientes.reduce((s, i) => s + (i.subtotal || 0), 0);
  const costoSugeridoTotal = receta.costo_mano_obra + costoInsumos;
  const costoSugeridoUnitario = receta.rendimiento > 0 ? costoSugeridoTotal / receta.rendimiento : 0;
  res.json({
    receta_id: req.params.id,
    ingredientes,
    costo_insumos: Math.round(costoInsumos * 100) / 100,
    costo_mano_obra: receta.costo_mano_obra,
    costo_total: Math.round(costoSugeridoTotal * 100) / 100,
    costo_unitario: Math.round(costoSugeridoUnitario * 100) / 100,
    rendimiento: receta.rendimiento,
    precio_sugerido: receta.precio_sugerido,
    margen_bruto: receta.precio_sugerido > 0 ? Math.round(((receta.precio_sugerido - costoSugeridoUnitario) / receta.precio_sugerido) * 10000) / 100 : 0,
  });
});

router.post('/:id/ingredientes', [
  body('producto_id').isString().withMessage('Producto requerido'),
  body('cantidad').isFloat({ min: 0.01 }).withMessage('Cantidad debe ser > 0'),
], handleErrors, (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const { producto_id, cantidad, unidad, merma_porcentaje } = req.body;
  db.prepare('INSERT INTO rec_ingredientes (id, receta_id, producto_id, cantidad, unidad, merma_porcentaje) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.params.id, producto_id, cantidad, unidad || null, merma_porcentaje || 0);
  const costo = db.prepare(`
    SELECT SUM(ri.cantidad * ip.costo) AS total FROM rec_ingredientes ri
    LEFT JOIN inv_productos ip ON ri.producto_id = ip.id
    WHERE ri.receta_id = ?
  `).get(req.params.id);
  db.prepare('UPDATE rec_recetas SET costo_insumos = ?, costo_total = costo_mano_obra + ? WHERE id = ?').run(costo.total || 0, costo.total || 0, req.params.id);
  res.status(201).json({ id });
});

router.delete('/:recetaId/ingredientes/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM rec_ingredientes WHERE id = ? AND receta_id = ?').run(req.params.id, req.params.recetaId);
  const costo = db.prepare(`
    SELECT COALESCE(SUM(ri.cantidad * ip.costo), 0) AS total FROM rec_ingredientes ri
    LEFT JOIN inv_productos ip ON ri.producto_id = ip.id
    WHERE ri.receta_id = ?
  `).get(req.params.recetaId);
  db.prepare('UPDATE rec_recetas SET costo_insumos = ?, costo_total = costo_mano_obra + ? WHERE id = ?').run(costo.total, costo.total, req.params.recetaId);
  res.json({ ok: true });
});

router.post('/:id/producir', [
  body('cantidad').isFloat({ min: 0.01 }),
  body('notas').optional().isString(),
], handleErrors, (req, res) => {
  const db = getDb();
  const receta = db.prepare('SELECT * FROM rec_recetas WHERE id = ?').get(req.params.id);
  if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
  const ingredientes = db.prepare('SELECT ri.*, ip.costo FROM rec_ingredientes ri LEFT JOIN inv_productos ip ON ri.producto_id = ip.id WHERE ri.receta_id = ?').all(req.params.id);
  if (ingredientes.length === 0) return res.status(400).json({ error: 'La receta no tiene ingredientes' });
  const cantidadProducir = req.body.cantidad;
  const factor = cantidadProducir / receta.rendimiento;
  const bodegaDefault = db.prepare('SELECT id FROM inv_bodegas ORDER BY created_at LIMIT 1').get();
  if (!bodegaDefault) return res.status(400).json({ error: 'No hay bodegas configuradas' });
  const errors = [];
  const tx = db.transaction(() => {
    for (const ing of ingredientes) {
      const cantNecesaria = ing.cantidad * factor;
      const existencia = db.prepare('SELECT cantidad FROM inv_existencias WHERE producto_id = ? AND bodega_id = ?').get(ing.producto_id, bodegaDefault.id);
      if (!existencia || existencia.cantidad < cantNecesaria) {
        const prod = db.prepare('SELECT nombre FROM inv_productos WHERE id = ?').get(ing.producto_id);
        errors.push(`Stock insuficiente de "${prod?.nombre || ing.producto_id}": necesita ${cantNecesaria}, disponible ${existencia?.cantidad || 0}`);
        continue;
      }
      db.prepare('UPDATE inv_existencias SET cantidad = cantidad - ?, updated_at = datetime(\'now\') WHERE producto_id = ? AND bodega_id = ?').run(cantNecesaria, ing.producto_id, bodegaDefault.id);
      db.prepare('INSERT INTO inv_movimientos (id, tipo, producto_id, bodega_id, cantidad, costo_unitario, referencia, usuario_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), 'salida_produccion', ing.producto_id, bodegaDefault.id, -cantNecesaria, ing.costo || 0, `Producción: ${receta.nombre}`, req.usuario?.id || null, req.body.notas || null);
    }
    if (errors.length > 0) return;
    const prodId = uuidv4();
    const recetaProducto = db.prepare('SELECT id FROM inv_productos WHERE nombre = ?').get(receta.nombre);
    if (recetaProducto) {
      db.prepare('UPDATE inv_existencias SET cantidad = cantidad + ?, updated_at = datetime(\'now\') WHERE producto_id = ? AND bodega_id = ?').run(cantidadProducir, recetaProducto.id, bodegaDefault.id);
      db.prepare('INSERT INTO inv_movimientos (id, tipo, producto_id, bodega_id, cantidad, costo_unitario, referencia, usuario_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), 'entrada_produccion', recetaProducto.id, bodegaDefault.id, cantidadProducir, receta.costo_total, `Producción: ${receta.nombre}`, req.usuario?.id || null, req.body.notas || null);
    }
    db.prepare('INSERT INTO rec_produccion (id, receta_id, cantidad, fecha, notas, usuario_id) VALUES (?, ?, ?, date(\'now\'), ?, ?)').run(uuidv4(), req.params.id, cantidadProducir, req.body.notas || null, req.usuario?.id || null);
  });
  tx();
  if (errors.length > 0) return res.status(400).json({ error: 'Error al producir', detalles: errors });
  res.json({ ok: true, mensaje: `Producidas ${cantidadProducir} unidades de ${receta.nombre}` });
});

router.get('/historial/:recetaId', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM rec_costos_historicos WHERE receta_id = ? ORDER BY created_at DESC').all(req.params.recetaId));
});

router.get('/:recetaId/vincular-pos', (req, res) => {
  const db = getDb();
  const vinculados = db.prepare(`
    SELECT ppr.*, pp.nombre AS producto_pos_nombre, pp.precio
    FROM pos_producto_receta ppr
    LEFT JOIN pos_productos pp ON ppr.pos_producto_id = pp.id
    WHERE ppr.receta_id = ?
  `).all(req.params.recetaId);
  res.json(vinculados);
});

router.post('/vincular-pos', [
  body('pos_producto_id').isString(),
  body('receta_id').isString(),
], handleErrors, (req, res) => {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT OR IGNORE INTO pos_producto_receta (id, pos_producto_id, receta_id) VALUES (?, ?, ?)').run(id, req.body.pos_producto_id, req.body.receta_id);
  res.status(201).json({ id });
});

router.delete('/vincular-pos/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM pos_producto_receta WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/dashboard/menu-engineering', (req, res) => {
  const db = getDb();
  const recetas = db.prepare(`
    SELECT r.id, r.nombre, r.costo_total, r.precio_sugerido, r.rendimiento,
      rc.nombre AS categoria_nombre,
      (r.precio_sugerido - (r.costo_total / NULLIF(r.rendimiento, 0))) AS margen_unitario,
      CASE WHEN r.precio_sugerido > 0
        THEN ((r.precio_sugerido - (r.costo_total / NULLIF(r.rendimiento, 0))) / r.precio_sugerido) * 100
        ELSE 0 END AS margen_porcentaje
    FROM rec_recetas r
    LEFT JOIN rec_categorias rc ON r.categoria_id = rc.id
    WHERE r.activo = 1
    ORDER BY margen_porcentaje DESC
  `).all();
  res.json(recetas);
});

export default router;
