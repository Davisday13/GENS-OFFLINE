import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../auth.js';

const router = Router();

const colaOffline = [];

router.get('/estado', (req, res) => {
  res.json({
    status: 'online',
    version: '1.1.0',
    modo: 'offline-simulado',
    cola_pendiente: colaOffline.length,
  });
});

router.post('/firmar', authMiddleware, (req, res) => {
  const { documento } = req.body;
  if (!documento) return res.status(400).json({ error: 'Documento requerido' });

  const cufe = `CUFE-OFFLINE-${uuidv4().slice(0, 12).toUpperCase()}`;
  const qr = `https://verify.dgi.gob.pa?cufe=${cufe}`;

  res.json({
    cufe,
    qr,
    estado: 'firmado',
    xml_firmado: `<Firmado><CUFE>${cufe}</CUFE></Firmado>`,
  });
});

router.post('/emitir', authMiddleware, (req, res) => {
  const { documento } = req.body;
  if (!documento) return res.status(400).json({ error: 'Documento requerido' });

  const cufe = `CUFE-OFFLINE-${uuidv4().slice(0, 12).toUpperCase()}`;
  const numero = `FE${String(Date.now()).slice(-8)}`;

  res.json({
    cufe,
    numero,
    qr: `https://verify.dgi.gob.pa?cufe=${cufe}`,
    estado: 'emitida',
    fecha: new Date().toISOString(),
  });
});

router.post('/anular', authMiddleware, (req, res) => {
  const { cufe } = req.body;
  if (!cufe) return res.status(400).json({ error: 'CUFE requerido' });

  res.json({
    cufe,
    estado: 'anulada',
    fecha_anulacion: new Date().toISOString(),
  });
});

router.post('/cola', authMiddleware, (req, res) => {
  const { documento } = req.body;
  const id = uuidv4();
  colaOffline.push({ id, documento, estado: 'pendiente', created_at: new Date().toISOString() });
  res.status(201).json({ id, cola: colaOffline.length });
});

router.get('/cola', authMiddleware, (req, res) => {
  res.json(colaOffline);
});

router.post('/cola/procesar', authMiddleware, (req, res) => {
  const procesados = [];
  while (colaOffline.length > 0) {
    const item = colaOffline.shift();
    item.estado = 'procesado';
    item.cufe = `CUFE-OFFLINE-${uuidv4().slice(0, 12).toUpperCase()}`;
    procesados.push(item);
  }
  res.json({ procesados, cantidad: procesados.length });
});

router.get('/reporteX', authMiddleware, (req, res) => {
  res.json({
    tipo: 'reporteX',
    fecha: new Date().toISOString(),
    total_ventas: 0,
    total_itbms: 0,
    documentos_emitidos: 0,
    documentos_anulados: 0,
  });
});

router.get('/reporteZ', authMiddleware, (req, res) => {
  res.json({
    tipo: 'reporteZ',
    fecha: new Date().toISOString(),
    total_ventas: 0,
    total_itbms: 0,
    documentos_emitidos: 0,
    documentos_anulados: 0,
    cierre: uuidv4().slice(0, 8).toUpperCase(),
  });
});

export default router;
