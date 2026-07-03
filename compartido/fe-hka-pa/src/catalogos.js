export const TIPOS_DOCUMENTO_FE = [
  { value: '01', label: 'Factura de Operación Interna' },
  { value: '02', label: 'Factura de Exportación' },
  { value: '03', label: 'Factura de Importación' },
  { value: '04', label: 'Nota de Crédito' },
  { value: '05', label: 'Nota de Débito' },
  { value: '06', label: 'Factura de Reembolso' },
  { value: '07', label: 'Factura de Zona Franca' },
];

export const TIPOS_CLIENTE_FE = [
  { value: '01', label: 'Contribuyente (con RUC)' },
  { value: '02', label: 'Consumidor Final' },
  { value: '03', label: 'Gobierno' },
  { value: '04', label: 'Extranjero' },
];

export const TIPOS_CONTRIBUYENTE = [
  { value: '1', label: 'Persona Natural' },
  { value: '2', label: 'Persona Jurídica' },
];

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

export const TIEMPOS_PAGO = [
  { value: '1', label: 'Contado' },
  { value: '2', label: 'Crédito / Plazo' },
  { value: '3', label: 'Mixto' },
];

export const TASAS_ITBMS_FE = [
  { value: '00', label: 'Exento (0%)' },
  { value: '01', label: 'Estándar (7%)' },
  { value: '02', label: 'Hospedaje/Bebidas (10%)' },
  { value: '03', label: 'Tabaco (15%)' },
];

export const AMBIENTES_HKA = {
  DEMO: 'https://demointegracion.thefactoryhka.com.pa',
  PROD: 'https://integracion.thefactoryhka.com.pa',
};
