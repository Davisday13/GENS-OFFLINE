import { etiquetaFormaPago } from './formasPago.js';

const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

const CMD = {
  INIT:               [ESC, 0x40],
  ALIGN_LEFT:         [ESC, 0x61, 0x00],
  ALIGN_CENTER:       [ESC, 0x61, 0x01],
  ALIGN_RIGHT:        [ESC, 0x61, 0x02],
  BOLD_ON:            [ESC, 0x45, 0x01],
  BOLD_OFF:           [ESC, 0x45, 0x00],
  UNDERLINE_ON:       [ESC, 0x2d, 0x01],
  UNDERLINE_OFF:      [ESC, 0x2d, 0x00],
  DOUBLE_HEIGHT_ON:   [ESC, 0x21, 0x10],
  DOUBLE_BOTH_ON:     [ESC, 0x21, 0x30],
  NORMAL:             [ESC, 0x21, 0x00],
  CUT_FULL:           [GS,  0x56, 0x00],
  CUT_PARTIAL:        [GS,  0x56, 0x01],
  CUT_FEED_CUT:       [GS,  0x56, 0x42, 0x00],
  DRAWER_KICK:        [ESC, 0x70, 0x00, 0x32, 0xfa],
  CHARSET_PC858:      [ESC, 0x74, 0x13],
  CHARSET_CP437:      [ESC, 0x74, 0x00],
};

export class TicketBuilder {
  constructor({ anchoCols = 48 } = {}) {
    this.cols = anchoCols;
    this.bytes = [];
    this.push(CMD.INIT);
    this.push(CMD.CHARSET_PC858);
  }

  push(arr) {
    for (const b of arr) this.bytes.push(b);
    return this;
  }

  text(s) {
    const buf = encodeLatin(String(s ?? ''));
    for (const b of buf) this.bytes.push(b);
    return this;
  }

  line(s = '') {
    return this.text(s).push([LF]);
  }

  feed(n = 1) {
    for (let i = 0; i < n; i++) this.bytes.push(LF);
    return this;
  }

  align(a) {
    if (a === 'center') this.push(CMD.ALIGN_CENTER);
    else if (a === 'right') this.push(CMD.ALIGN_RIGHT);
    else this.push(CMD.ALIGN_LEFT);
    return this;
  }

  bold(on = true) {
    this.push(on ? CMD.BOLD_ON : CMD.BOLD_OFF);
    return this;
  }

  big(on = true) {
    this.push(on ? CMD.DOUBLE_BOTH_ON : CMD.NORMAL);
    return this;
  }

  doubleHeight(on = true) {
    this.push(on ? CMD.DOUBLE_HEIGHT_ON : CMD.NORMAL);
    return this;
  }

  hr(char = '-') {
    return this.line(char.repeat(this.cols));
  }

  row(label, value) {
    const l = String(label ?? '');
    const v = String(value ?? '');
    const espacios = Math.max(1, this.cols - l.length - v.length);
    return this.line(l + ' '.repeat(espacios) + v);
  }

  item({ cantidad, descripcion, precioUnit, total }) {
    const qty = String(cantidad);
    const descCols = this.cols - qty.length - 1;
    const lineas = envolver(String(descripcion || ''), descCols);
    this.line(`${qty} ${lineas[0] || ''}`);
    for (let i = 1; i < lineas.length; i++) {
      this.line(' '.repeat(qty.length + 1) + lineas[i]);
    }
    const detalle = `   ${cantidad} x ${precioUnit}`;
    const totalStr = String(total);
    const espacios = Math.max(1, this.cols - detalle.length - totalStr.length);
    this.line(detalle + ' '.repeat(espacios) + totalStr);
    return this;
  }

  qr(data, size = 6) {
    const d = String(data || '');
    if (!d) return this;
    const bytes = encodeLatin(d);
    const len = bytes.length + 3;
    const pL = len & 0xff;
    const pH = (len >> 8) & 0xff;
    this.push([GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);
    this.push([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, Math.max(1, Math.min(16, size))]);
    this.push([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30]);
    this.push([GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]);
    for (const b of bytes) this.bytes.push(b);
    this.push([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]);
    return this;
  }

  cut() {
    this.feed(3);
    this.push(CMD.CUT_FEED_CUT);
    return this;
  }

  drawerKick() {
    this.push(CMD.DRAWER_KICK);
    return this;
  }

  toBase64() {
    return uint8ToBase64(new Uint8Array(this.bytes));
  }

  toUint8Array() {
    return new Uint8Array(this.bytes);
  }
}

function envolver(texto, ancho) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let actual = '';
  for (const w of palabras) {
    if (!w) continue;
    if (actual.length === 0) {
      actual = w.length > ancho ? w.slice(0, ancho) : w;
      let resto = w.length > ancho ? w.slice(ancho) : '';
      while (resto.length > 0) {
        lineas.push(actual);
        actual = resto.slice(0, ancho);
        resto = resto.slice(ancho);
      }
      continue;
    }
    if ((actual + ' ' + w).length <= ancho) {
      actual += ' ' + w;
    } else {
      lineas.push(actual);
      actual = w.length > ancho ? w.slice(0, ancho) : w;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.length ? lineas : [''];
}

function encodeLatin(s) {
  const map = {
    'á': 0xa0, 'é': 0x82, 'í': 0xa1, 'ó': 0xa2, 'ú': 0xa3,
    'Á': 0xb5, 'É': 0x90, 'Í': 0xd6, 'Ó': 0xe0, 'Ú': 0xe9,
    'ñ': 0xa4, 'Ñ': 0xa5,
    'ü': 0x81, 'Ü': 0x9a,
    '¿': 0xa8, '¡': 0xad, '°': 0xf8,
    '€': 0xd5, '$': 0x24,
    'ç': 0x87, 'Ç': 0x80,
  };
  const out = [];
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code < 128) {
      out.push(code);
    } else if (map[ch] !== undefined) {
      out.push(map[ch]);
    } else {
      out.push(0x3f);
    }
  }
  return out;
}

function uint8ToBase64(u8) {
  let bin = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

const TIPOS_DOC = {
  '01': 'FACTURA',
  '02': 'FACTURA IMPORT',
  '03': 'FACTURA EXPORT',
  '04': 'NOTA DE CREDITO',
  '05': 'NOTA DE DEBITO',
  '06': 'NOTA DE CREDITO',
  '07': 'NOTA DE DEBITO',
};

const TASAS_ITBMS_VALOR = { '00': 0, '01': 7, '02': 10, '03': 15 };

export function escposFactura({
  factura,
  items = [],
  empresa = {},
  cliente = {},
  anchoMm = 80,
  copias = 1,
  abrirGaveta = false,
}) {
  const cols = anchoMm === 58 ? 32 : 48;
  const t = new TicketBuilder({ anchoCols: cols });

  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).big(true);
    t.line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA');
    t.big(false);
    if (empresa?.ruc) t.line(`RUC ${empresa.ruc}${empresa.dv ? ' DV ' + empresa.dv : ''}`);
    t.bold(false);
    if (empresa?.direccion) t.line(empresa.direccion);
    if (empresa?.telefono || empresa?.correo) t.line([empresa.telefono, empresa.correo].filter(Boolean).join(' | '));
    t.hr('=');

    t.bold(true).line(TIPOS_DOC[factura.tipo_documento] || 'FACTURA');
    t.bold(false);
    t.line(`No. ${factura.numero_documento || factura.numero_externo || factura.numero_factura || factura.numero || '-'}`);
    if (factura.fecha_emision || factura.created_at) {
      t.line(formatFecha(factura.fecha_emision || factura.created_at));
    }
    if (factura.estado === 'AUTORIZADA') t.line('AUTORIZADA POR DGI');
    if (factura.estado === 'INTERNA') t.line('DOCUMENTO INTERNO (NO FISCAL)');
    t.hr('-').align('left');

    t.bold(true).line('CLIENTE:').bold(false);
    t.line(factura.receptor_razon_social || cliente?.razon_social || cliente?.nombre || 'CONSUMIDOR FINAL');
    const ruc = factura.receptor_ruc || cliente?.ruc || cliente?.ruc_cedula || '';
    if (ruc) t.line(`RUC/Ced: ${ruc}${(factura.receptor_dv || cliente?.dv) ? ' DV ' + (factura.receptor_dv || cliente?.dv) : ''}`);
    t.hr('-');

    for (const it of items) {
      const qty = Number(it.cantidad) || 0;
      const pu = Number(it.precio_unitario) || 0;
      const desc = Number(it.descuento_unitario) || 0;
      const tasa = TASAS_ITBMS_VALOR[it.tasa_itbms] || 0;
      const importe = qty * (pu - desc);
      const itbms = importe * (tasa / 100);
      const total = importe + itbms;
      t.item({
        cantidad: qty.toFixed(2),
        descripcion: it.descripcion || '',
        precioUnit: money(pu),
        total: money(total),
      });
    }
    t.hr('-');

    const subtotal = Number(factura.total_neto ?? factura.subtotal) || 0;
    const itbmsTotal = Number(factura.total_itbms ?? factura.itbms_total) || 0;
    const descuento = Number(factura.total_descuento ?? factura.descuento_total) || 0;
    const total = Number(factura.total_factura ?? factura.total) || (subtotal + itbmsTotal - descuento);

    t.row('Subtotal', money(subtotal));
    if (descuento > 0) t.row('Descuento', '-' + money(descuento));
    t.row('ITBMS', money(itbmsTotal));
    t.hr('=');
    t.bold(true).big(true);
    t.row('TOTAL', '$' + money(total));
    t.big(false).bold(false);

    const formaPago = etiquetaFormaPago(factura, { ascii: true });
    if (formaPago) t.line(`Pago: ${formaPago}`);

    const qrData = factura.qr_url || factura.cufe;
    if (qrData) {
      t.feed(1).align('center').bold(true).line('Escanea para verificar en DGI').bold(false);
      const qrLen = String(qrData).length;
      const qrSize = anchoMm === 58
        ? (qrLen > 250 ? 4 : qrLen > 120 ? 5 : 6)
        : (qrLen > 250 ? 6 : qrLen > 120 ? 7 : 8);
      t.qr(qrData, qrSize);
      if (factura.cufe) {
        t.feed(1).line('CUFE:');
        const cufe = String(factura.cufe);
        for (let i = 0; i < cufe.length; i += anchoMm === 58 ? 16 : 22) {
          t.line(cufe.slice(i, i + (anchoMm === 58 ? 16 : 22)));
        }
      }
    }

    t.feed(1).align('center');
    t.line(empresa?.ticket_pie || 'Gracias por su compra');
    if (empresa?.web) t.line(empresa.web);

    if (factura.estado === 'AUTORIZADA') {
      t.feed(1).hr('-');
      const pacNombre = empresa?.pac_nombre || 'The Factory HKA Panama, S.A.';
      const pacRuc = empresa?.pac_ruc || '155596713-2-2015';
      const pacDv = empresa?.pac_dv || '59';
      const pacReso = empresa?.pac_resolucion || 'Resolucion No. 201-9719 de 12/10/2021';
      const leyenda = `Documento validado por ${pacNombre} con RUC ${pacRuc} DV ${pacDv}, es Proveedor Autorizado Calificado, ${pacReso}`;
      t.line(leyenda);
    }

    t.align('left');

    if (c < copias - 1) t.feed(2).hr('=');
  }

  if (abrirGaveta) t.drawerKick();
  t.cut();

  return t.toBase64();
}

export function escposPago({
  pago,
  empresa = {},
  cliente = {},
  factura = null,
  anchoMm = 80,
  copias = 1,
}) {
  const cols = anchoMm === 58 ? 32 : 48;
  const t = new TicketBuilder({ anchoCols: cols });

  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).big(true);
    t.line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA');
    t.big(false);
    if (empresa?.ruc) t.line(`RUC ${empresa.ruc}${empresa.dv ? ' DV ' + empresa.dv : ''}`);
    t.bold(false);
    t.hr('=');
    t.bold(true).line('RECIBO DE PAGO').bold(false);
    if (pago.numero_recibo) t.line(`No. ${pago.numero_recibo}`);
    if (pago.fecha_pago || pago.created_at) t.line(formatFecha(pago.fecha_pago || pago.created_at));
    t.hr('-').align('left');

    t.bold(true).line('CLIENTE:').bold(false);
    t.line(cliente?.razon_social || cliente?.nombre || '-');
    if (factura?.numero_factura) t.line(`Factura: ${factura.numero_factura}`);
    t.hr('-');

    const metodo = pago.metodo_pago || pago.forma_pago || '';
    if (metodo) t.row('Metodo', metodo);
    const ref = pago.referencia || pago.numero_referencia || '';
    if (ref) t.row('Ref.', ref);
    t.hr('=');

    t.bold(true).big(true);
    t.row('MONTO', '$' + money(Number(pago.monto) || 0));
    t.big(false).bold(false);

    if (pago.observaciones) {
      t.feed(1).align('left').line(pago.observaciones);
    }
    t.feed(1).align('center');
    t.line(empresa?.ticket_pie || 'Gracias por su pago');
    t.align('left');

    if (c < copias - 1) t.feed(2).hr('=');
  }
  t.cut();
  return t.toBase64();
}

export function escposOrden({
  orden,
  items = [],
  empresa = {},
  cliente = {},
  equipo = null,
  anchoMm = 80,
  copias = 1,
}) {
  const cols = anchoMm === 58 ? 32 : 48;
  const t = new TicketBuilder({ anchoCols: cols });

  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).big(true);
    t.line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA');
    t.big(false).bold(false);
    if (empresa?.telefono) t.line(`Tel: ${empresa.telefono}`);
    t.hr('=');

    t.bold(true).line('ORDEN DE TALLER').bold(false);
    t.line(`No. ${orden.numero_orden || orden.id_orden || '-'}`);
    if (orden.fecha_ingreso || orden.created_at) t.line(formatFecha(orden.fecha_ingreso || orden.created_at));
    t.hr('-').align('left');

    t.bold(true).line('CLIENTE:').bold(false);
    t.line(cliente?.razon_social || cliente?.nombre || '-');
    if (cliente?.telefono) t.line(`Tel: ${cliente.telefono}`);

    if (equipo) {
      t.hr('-').bold(true).line('EQUIPO:').bold(false);
      t.line(`${equipo.tipo || ''} ${equipo.marca || ''} ${equipo.modelo || ''}`.trim());
      if (equipo.serie) t.line(`Serie: ${equipo.serie}`);
    }

    if (orden.falla_reportada) {
      t.hr('-').bold(true).line('FALLA REPORTADA:').bold(false);
      t.line(orden.falla_reportada);
    }

    if (items.length) {
      t.hr('-').bold(true).line('REPUESTOS / SERVICIOS:').bold(false);
      for (const it of items) {
        t.line(`${it.cantidad || 1} x ${it.descripcion || it.nombre || ''}`);
      }
    }

    if (orden.estado) {
      t.hr('-').row('Estado', orden.estado);
    }

    t.hr('-').align('center');
    t.line('Conserve este ticket');
    t.line('para reclamar su equipo');
    t.align('left');

    if (c < copias - 1) t.feed(2).hr('=');
  }
  t.cut();
  return t.toBase64();
}

function money(n) {
  const v = Number(n) || 0;
  return v.toFixed(2);
}

function formatFecha(d) {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d || '');
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  } catch {
    return String(d || '');
  }
}
