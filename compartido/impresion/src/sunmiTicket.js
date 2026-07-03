import { etiquetaFormaPago } from './formasPago.js';

const COLS = 32;

const TIPOS_DOC = {
  '01': 'FACTURA', '02': 'FACTURA IMPORT', '03': 'FACTURA EXPORT',
  '04': 'NOTA DE CREDITO', '05': 'NOTA DE DEBITO',
  '06': 'NOTA DE CREDITO', '07': 'NOTA DE DEBITO',
};
const TASAS_ITBMS_VALOR = { '00': 0, '01': 7, '02': 10, '03': 15 };

const money = (n) => (Number(n) || 0).toFixed(2);

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
  } catch { return String(d || ''); }
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
      while (resto.length > 0) { lineas.push(actual); actual = resto.slice(0, ancho); resto = resto.slice(ancho); }
      continue;
    }
    if ((actual + ' ' + w).length <= ancho) actual += ' ' + w;
    else { lineas.push(actual); actual = w.length > ancho ? w.slice(0, ancho) : w; }
  }
  if (actual) lineas.push(actual);
  return lineas.length ? lineas : [''];
}

const FOLD = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
  'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U', 'ç': 'c', 'Ç': 'C',
  '¿': '?', '¡': '!', '°': 'o', '€': 'E', '\u201c': '"', '\u201d': '"', '\u2019': "'", '\u2013': '-', '\u2014': '-',
};

function asciiBytes(s) {
  const out = [];
  for (const ch of String(s ?? '')) {
    const c = ch.charCodeAt(0);
    if (c < 128) out.push(c);
    else if (FOLD[ch]) out.push(FOLD[ch].charCodeAt(0));
    else out.push(0x3f);
  }
  return out;
}

class SunmiDoc {
  constructor(cols) {
    this.cols = cols;
    this.items = [];
    this._align = 'left'; this._bold = false;
  }
  align(a) { this._align = a; return this; }
  bold(on = true) { this._bold = !!on; return this; }
  big() { return this; }
  text(s) { this.items.push({ text: String(s ?? ''), align: this._align, bold: this._bold }); return this; }
  line(s = '') { return this.text(s); }
  feed(n = 1) { for (let i = 0; i < Math.max(1, n); i++) this.items.push({ text: '', align: 'left', bold: false }); return this; }
  qr(data, size) { if (data) this.items.push({ qr: String(data), size: size || 6 }); return this; }
  hr(ch = '-') { return this.text(ch.repeat(this.cols)); }
  row(label, value) {
    const l = String(label ?? ''), v = String(value ?? '');
    const sp = Math.max(1, this.cols - l.length - v.length);
    return this.text(l + ' '.repeat(sp) + v);
  }
  bigCentered(label, value) {
    return this.align('center').bold(true).text(`${label}  ${value}`).bold(false).align('left');
  }
  item({ cantidad, descripcion, precioUnit, total }) {
    const qty = String(cantidad);
    const descCols = this.cols - qty.length - 1;
    const lineas = envolver(String(descripcion || ''), descCols);
    this.text(`${qty} ${lineas[0] || ''}`);
    for (let i = 1; i < lineas.length; i++) this.text(' '.repeat(qty.length + 1) + lineas[i]);
    const detalle = `   ${cantidad} x ${precioUnit}`;
    const totalStr = String(total);
    const sp = Math.max(1, this.cols - detalle.length - totalStr.length);
    this.text(detalle + ' '.repeat(sp) + totalStr);
    return this;
  }
}

function qrBytes(data, size) {
  const enc = asciiBytes(data);
  const len = enc.length + 3;
  const pL = len & 0xff, pH = (len >> 8) & 0xff;
  const s = Math.max(1, Math.min(16, size || 6));
  return [
    0x1b, 0x61, 0x01,
    0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
    0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, s,
    0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30,
    0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...enc,
    0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30,
    0x0a,
    0x1b, 0x61, 0x00,
  ];
}

function bytesToBase64(arr) {
  let bin = '';
  const CH = 0x4000;
  for (let i = 0; i < arr.length; i += CH) bin += String.fromCharCode.apply(null, arr.slice(i, i + CH));
  return btoa(bin);
}

async function runSunmiDoc(doc) {
  const bytes = [0x1b, 0x40];
  for (const it of doc.items) {
    if (it.qr) { bytes.push(...qrBytes(it.qr, it.size)); continue; }
    bytes.push(0x1b, 0x61, it.align === 'center' ? 1 : it.align === 'right' ? 2 : 0);
    bytes.push(0x1b, 0x45, it.bold ? 1 : 0);
    bytes.push(...asciiBytes(it.text), 0x0a);
  }
  bytes.push(0x1b, 0x61, 0x00, 0x0a, 0x0a, 0x0a, 0x0a);
  bytes.push(0x1d, 0x56, 0x42, 0x00);

  try {
    const b64 = bytesToBase64(bytes);
    const { SunmiPrinter } = await import('@kduma-autoid/capacitor-sunmi-printer');
    SunmiPrinter.sendRAWBase64Data({ data: b64 }).then(() => {}, () => {});
  } catch { /* ignore */ }
  return { ok: true, via: 'sunmi-fire' };
}

export async function sunmiImprimirFactura({ factura, items = [], empresa = {}, cliente = {}, anchoMm = 58, copias = 1 }) {
  const t = new SunmiDoc(COLS);
  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA');
    if (empresa?.ruc) t.line(`RUC ${empresa.ruc}${empresa.dv ? ' DV ' + empresa.dv : ''}`);
    t.bold(false);
    if (empresa?.direccion) t.line(empresa.direccion);
    if (empresa?.telefono || empresa?.correo) t.line([empresa.telefono, empresa.correo].filter(Boolean).join(' | '));
    t.hr('=');
    t.bold(true).line(TIPOS_DOC[factura.tipo_documento] || 'FACTURA').bold(false);
    t.line(`No. ${factura.numero_documento || factura.numero_externo || factura.numero_factura || factura.numero || '-'}`);
    if (factura.fecha_emision || factura.created_at) t.line(formatFecha(factura.fecha_emision || factura.created_at));
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
      const total = importe + importe * (tasa / 100);
      t.item({ cantidad: qty.toFixed(2), descripcion: it.descripcion || '', precioUnit: money(pu), total: money(total) });
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
    t.bigCentered('TOTAL', '$' + money(total));
    const formaPago = etiquetaFormaPago(factura, { ascii: true });
    if (formaPago) t.line(`Pago: ${formaPago}`);
    const qrData = factura.qr_url || factura.cufe;
    if (qrData) {
      t.feed(1).align('center').bold(true).line('Escanea para verificar en DGI').bold(false).align('left');
      const qrLen = String(qrData).length;
      t.qr(qrData, qrLen > 250 ? 4 : qrLen > 120 ? 5 : 6);
      if (factura.cufe) {
        t.align('center').line('CUFE:');
        const cufe = String(factura.cufe);
        for (let i = 0; i < cufe.length; i += 16) t.line(cufe.slice(i, i + 16));
        t.align('left');
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
      for (const l of envolver(`Documento validado por ${pacNombre} con RUC ${pacRuc} DV ${pacDv}, es Proveedor Autorizado Calificado, ${pacReso}`, COLS)) t.line(l);
    }
    t.align('left');
    if (c < copias - 1) t.feed(2).hr('=');
  }
  return runSunmiDoc(t);
}

export async function sunmiImprimirPago({ pago, empresa = {}, cliente = {}, factura = null, anchoMm = 58, copias = 1 }) {
  const t = new SunmiDoc(COLS);
  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA');
    if (empresa?.ruc) t.line(`RUC ${empresa.ruc}${empresa.dv ? ' DV ' + empresa.dv : ''}`);
    t.bold(false).hr('=');
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
    t.bigCentered('MONTO', '$' + money(Number(pago.monto) || 0));
    if (pago.observaciones) { t.feed(1).align('left'); for (const l of envolver(pago.observaciones, COLS)) t.line(l); }
    t.feed(1).align('center').line(empresa?.ticket_pie || 'Gracias por su pago').align('left');
    if (c < copias - 1) t.feed(2).hr('=');
  }
  return runSunmiDoc(t);
}

export async function sunmiImprimirOrden({ orden, items = [], empresa = {}, cliente = {}, equipo = null, anchoMm = 58, copias = 1 }) {
  const t = new SunmiDoc(COLS);
  for (let c = 0; c < copias; c++) {
    t.align('center').bold(true).line(empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'EMPRESA').bold(false);
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
    if (orden.falla_reportada) { t.hr('-').bold(true).line('FALLA REPORTADA:').bold(false); for (const l of envolver(orden.falla_reportada, COLS)) t.line(l); }
    if (items.length) {
      t.hr('-').bold(true).line('REPUESTOS / SERVICIOS:').bold(false);
      for (const it of items) for (const l of envolver(`${it.cantidad || 1} x ${it.descripcion || it.nombre || ''}`, COLS)) t.line(l);
    }
    if (orden.estado) t.hr('-').row('Estado', orden.estado);
    t.hr('-').align('center').line('Conserve este ticket').line('para reclamar su equipo').align('left');
    if (c < copias - 1) t.feed(2).hr('=');
  }
  return runSunmiDoc(t);
}
