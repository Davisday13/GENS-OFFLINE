export const TASAS_ITBMS = [
  { value: 0,  label: 'Exento (0%)' },
  { value: 7,  label: 'Estándar (7%)' },
  { value: 10, label: 'Bebidas/Hospedaje (10%)' },
  { value: 15, label: 'Tabaco (15%)' },
];

export const UNIDADES = ['UND', 'M', 'KG', 'L', 'CAJA', 'PAQUETE', 'HORA'];

export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPPY', 'CHEQUE', 'OTRO'];

export const ESTADOS_FACTURA = {
  BORRADOR: 'Borrador',
  INTERNA: 'Interna',
  ENVIANDO: 'Enviando a DGI',
  AUTORIZADA: 'Autorizada',
  RECHAZADA: 'Rechazada',
  ANULADA: 'Anulada',
  ERROR: 'Error',
};

export const ESTADOS_FACTURA_COLOR = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-300',
  INTERNA: 'bg-amber-100 text-amber-800 border-amber-300',
  ENVIANDO: 'bg-blue-100 text-blue-700 border-blue-300',
  AUTORIZADA: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  RECHAZADA: 'bg-red-100 text-red-700 border-red-300',
  ANULADA: 'bg-amber-100 text-amber-700 border-amber-300',
  ERROR: 'bg-red-100 text-red-700 border-red-300',
};

export const ESTADO_PAGO_LABEL = {
  PAGADO: 'Pagado',
  PARCIAL: 'Parcial',
  PENDIENTE: 'Pendiente',
  SIN_COSTO: 'Sin costo',
};

export const ESTADO_PAGO_COLOR = {
  PAGADO: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  PARCIAL: 'bg-amber-100 text-amber-700 border-amber-300',
  PENDIENTE: 'bg-red-100 text-red-700 border-red-300',
  SIN_COSTO: 'bg-gray-100 text-gray-600 border-gray-300',
};
