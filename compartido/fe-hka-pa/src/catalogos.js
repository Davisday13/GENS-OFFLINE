export const TIPOS_DOCUMENTO_FE = {
  FACTURA: '01',
  NC: '02',
  ND: '03',
  TICKET: '04',
};

export const TIPOS_CLIENTE_FE = {
  CONTRIBUYENTE: '01',
  CONSUMIDOR_FINAL: '02',
  EXTRANJERO: '03',
};

export const FORMAS_PAGO_FE = {
  EFECTIVO: '01',
  TARJETA_CREDITO: '02',
  TARJETA_DEBITO: '03',
  CHEQUE: '04',
  TRANSFERENCIA: '05',
  OTRO: '06',
};

export const TASAS_ITBMS_FE = [
  { codigo: '01', descripcion: 'ITBMS 7%', porcentaje: 7 },
  { codigo: '02', descripcion: 'ITBMS 0% (Exento)', porcentaje: 0 },
  { codigo: '03', descripcion: 'ITBMS 10%', porcentaje: 10 },
  { codigo: '04', descripcion: 'ITBMS 5%', porcentaje: 5 },
];

export const AMBIENTES_HKA = {
  DEMO: {
    baseUrl: 'https://demointegracion.thefactoryhka.com.pa',
    descripcion: 'Ambiente de pruebas DGI',
  },
  PROD: {
    baseUrl: 'https://integracion.thefactoryhka.com.pa',
    descripcion: 'Ambiente de producción DGI',
  },
};
