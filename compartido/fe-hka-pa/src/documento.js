import { r2, codigoTasaItbms } from './helpers.js';

export function construirDocumento({
  tipo = '01',
  ruc,
  dv,
  nombre,
  direccion,
  correo,
  telefono,
  items = [],
  formasPago = [{ codigo: '01', monto: 0 }],
  comentario = '',
}) {
  const subtotal = items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  const descuento = items.reduce((sum, item) => sum + (item.descuento || 0), 0);
  const baseImponible = subtotal - descuento;
  const itbms = items.reduce((sum, item) => {
    const tasa = codigoTasaItbms(item.tasaItbms || 0);
    return sum + r2((item.precioUnitario * item.cantidad - (item.descuento || 0)) * tasa);
  }, 0);
  const total = r2(baseImponible + itbms);

  return {
    encabezado: {
      tipoDte: tipo,
      fechaEmision: new Date().toISOString(),
      horaEmision: new Date().toTimeString().slice(0, 8),
      moneda: 'PAB',
    },
    emisor: {
      ruc: '123456-1-123456',
      dv: '1',
      nombre: 'EMPRESA OFFLINE S.A.',
      direccion: 'Ciudad de Panamá',
    },
    receptor: {
      ruc: ruc || '0-0-0',
      dv: dv || '0',
      nombre: nombre || 'CONSUMIDOR FINAL',
      direccion: direccion || '',
      correo: correo || '',
      telefono: telefono || '',
      tipo: ruc ? '01' : '02',
    },
    items: items.map((item, i) => ({
      numero: i + 1,
      codigo: item.codigo || `ITEM-${i + 1}`,
      descripcion: item.descripcion || '',
      cantidad: item.cantidad || 1,
      unidadMedida: item.unidadMedida || 'NIU',
      precioUnitario: r2(item.precioUnitario || 0),
      descuento: r2(item.descuento || 0),
      tasaItbms: codigoTasaItbms(item.tasaItbms || 0),
      montoItbms: r2((item.precioUnitario * item.cantidad - (item.descuento || 0)) * (codigoTasaItbms(item.tasaItbms || 0) / 100)),
      total: r2(item.precioUnitario * item.cantidad - (item.descuento || 0)),
    })),
    resumen: {
      subtotal: r2(subtotal),
      descuento: r2(descuento),
      baseImponible: r2(baseImponible),
      itbms: r2(itbms),
      total: r2(total),
      formasPago: formasPago.map(fp => ({ codigo: fp.codigo, monto: r2(fp.monto || total) })),
    },
    comentario: comentario,
  };
}
