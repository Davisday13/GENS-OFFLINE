export const FORMAS_PAGO_FE = [
  { value: '02', label: 'Efectivo' },
  { value: '03', label: 'Tarjeta de crédito' },
  { value: '04', label: 'Tarjeta de débito' },
  { value: '05', label: 'Cheque' },
  { value: '06', label: 'Transferencia / ACH' },
  { value: '07', label: 'Vale' },
  { value: '08', label: 'Yappy / Nequi' },
  { value: '99', label: 'Otro' },
];

export const OPCION_CREDITO = { value: '01', label: 'Crédito' };

export const OPCIONES_FORMA_PAGO = [OPCION_CREDITO, ...FORMAS_PAGO_FE];

export const FORMAS_PAGO_LABEL = Object.fromEntries(
  OPCIONES_FORMA_PAGO.map((o) => [o.value, o.label]),
);

export const FORMAS_PAGO_LABEL_ASCII = {
  '01': 'Credito',
  '02': 'Efectivo',
  '03': 'Tarjeta Credito',
  '04': 'Tarjeta Debito',
  '05': 'Cheque',
  '06': 'Transferencia/ACH',
  '07': 'Vale',
  '08': 'Yappy/Nequi',
  '99': 'Otro',
};

export function esVentaCredito(f) {
  return f?.condicion_pago === 'CREDITO' || String(f?.tiempo_pago) === '2';
}

export function camposPorCondicion(condicion, formaPagoActual = '02') {
  const credito = condicion === 'CREDITO';
  return {
    tiempo_pago: credito ? '2' : '1',
    forma_pago: credito ? '01' : (formaPagoActual === '01' ? '02' : formaPagoActual),
  };
}

export function etiquetaFormaPago(factura, { ascii = false } = {}) {
  if (esVentaCredito(factura)) return ascii ? 'Credito' : 'Crédito';
  const mapa = ascii ? FORMAS_PAGO_LABEL_ASCII : FORMAS_PAGO_LABEL;
  if (Array.isArray(factura?.formas_pago) && factura.formas_pago.length) {
    return factura.formas_pago.map((p) => mapa[p.forma_pago] || p.forma_pago).join(', ');
  }
  if (factura?.forma_pago) return mapa[factura.forma_pago] || factura.forma_pago;
  return '';
}
