import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { formatCurrency, formatDate, formatDateTime } from '../utils.js';
import { OPCIONES_FORMA_PAGO, FORMAS_PAGO_LABEL, esVentaCredito } from '../formasPago.js';
import { entregarDocPdf } from './pdfEntrega.js';

const SAVANTE_BLUE        = [0, 49, 83];
const SAVANTE_BLUE_LIGHT  = [219, 234, 245];
const SAVANTE_BLUE_PALE   = [240, 247, 252];
const LINK_BLUE           = [29, 78, 216];
const WHITE   = [255, 255, 255];
const GRAY_900 = [17, 24, 39];
const GRAY_800 = [31, 41, 55];
const GRAY_700 = [55, 65, 81];
const GRAY_600 = [75, 85, 99];
const GRAY_500 = [107, 114, 128];
const GRAY_400 = [156, 163, 175];
const GRAY_300 = [209, 213, 219];
const GRAY_200 = [229, 231, 235];
const GRAY_100 = [243, 244, 246];
const GRAY_50  = [249, 250, 251];
const RED_600  = [220, 38, 38];

const setFill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const setText = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);
const setDraw = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);

const TIPOS_DOCUMENTO = {
  '01': 'FACTURA DE OPERACIÓN INTERNA',
  '02': 'FACTURA DE IMPORTACIÓN',
  '03': 'FACTURA DE EXPORTACIÓN',
  '04': 'NOTA DE CRÉDITO',
  '05': 'NOTA DE DÉBITO',
  '06': 'NOTA DE CREDITO GENERICA',
  '07': 'NOTA DE DEBITO GENERICA',
  '08': 'NOTA DE CREDITO REFERENCIA EXTERNA',
  '09': 'NOTA DE DEBITO REFERENCIA EXTERNA',
  FACTURA: 'FACTURA DE OPERACIÓN INTERNA',
  NOTA_CREDITO: 'NOTA DE CRÉDITO',
  NOTA_DEBITO: 'NOTA DE DÉBITO',
};

const TASAS_ITBMS_LABEL = {
  '00': '0%',
  '01': '7%',
  '02': '10%',
  '03': '15%',
};

const TASAS_ITBMS_VALOR = {
  '00': 0, '01': 7, '02': 10, '03': 15,
};

function sanitizarNombreArchivo(s) {
  return String(s || '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function getTipoDocumentoLabel(factura, referencias = []) {
  const t = factura?.tipo_documento;
  const tieneRefs = Array.isArray(referencias) && referencias.length > 0;
  if (t === '04') return tieneRefs ? 'NOTA DE CREDITO REFERENCIADA' : 'NOTA DE CRÉDITO';
  if (t === '05') return tieneRefs ? 'NOTA DE DEBITO REFERENCIADA'  : 'NOTA DE DÉBITO';
  return TIPOS_DOCUMENTO[t] || (typeof t === 'string' ? t.toUpperCase() : 'FACTURA DE OPERACIÓN INTERNA');
}

function getRucDv(ruc, dv) {
  if (!ruc) return '';
  return dv ? `${ruc} DV ${dv}` : String(ruc);
}

function getFormaPagoLabel(codigo) {
  if (!codigo) return '';
  return FORMAS_PAGO_LABEL[codigo] || codigo;
}

function getTiempoPagoLabel(factura) {
  if (factura?.tiempo_pago === '2' || factura?.condicion_pago === 'CREDITO') return 'Credito';
  return 'Contado';
}

function formatoFechaDGI(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatTelefonoPA(tel) {
  if (!tel) return '';
  const limpio = String(tel).trim();
  if (limpio.startsWith('507') || limpio.startsWith('+507')) return limpio.replace('+', '');
  return `507 ${limpio}`;
}

function getTipoDocumentoLabelCorto(factura, referencias = []) {
  const t = factura?.tipo_documento;
  const tieneRefs = Array.isArray(referencias) && referencias.length > 0;
  if (t === '04') return tieneRefs ? 'Nota de credito referenciada' : 'Nota de credito';
  if (t === '05') return tieneRefs ? 'Nota de debito referenciada'  : 'Nota de debito';
  const map = {
    '01': 'Factura de operación interna',
    '02': 'Factura de importación',
    '03': 'Factura de exportación',
    '06': 'Nota de crédito genérica',
    '07': 'Nota de débito genérica',
    '08': 'Nota de credito referenciada',
    '09': 'Nota de debito referenciada',
  };
  return map[t] || (typeof t === 'string' ? t : 'Factura de operación interna');
}

function getTipoReceptorLabel(codigo) {
  const map = {
    '01': 'Contribuyente',
    '02': 'Consumidor Final',
    '03': 'Gobierno',
    '04': 'Extranjero',
  };
  return map[String(codigo || '')] || 'Consumidor Final';
}

function formatoFechaLiteral(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

async function generarQRDataUrl(texto) {
  if (!texto) return null;
  try {
    return await QRCode.toDataURL(String(texto), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 600,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  } catch {
    return null;
  }
}

async function cargarImagenComoDataUrl(url) {
  if (!url) return null;
  if (typeof url === 'string' && url.startsWith('data:')) return url;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch { resolve(null); }
  });
}

function dibujarSelloAnulada(doc, pageW, pageH) {
  doc.saveGraphicsState && doc.saveGraphicsState();
  setText(doc, RED_600);
  setDraw(doc, RED_600);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(90);
  const cx = pageW / 2;
  const cy = pageH / 2;
  try {
    doc.text('ANULADA', cx, cy, { align: 'center', angle: -30 });
  } catch {
    doc.text('ANULADA', cx, cy, { align: 'center' });
  }
  doc.setLineWidth(1.5);
  try {
    setDraw(doc, RED_600);
    doc.setLineWidth(0.8);
    doc.rect(cx - 70, cy - 17.5, 140, 35);
  } catch {}
  doc.setLineWidth(0.2);
  doc.restoreGraphicsState && doc.restoreGraphicsState();
}

function dibujarPar(doc, x, y, label, value, opts = {}) {
  const labelColor = opts.labelColor || GRAY_900;
  const valueColor = opts.valueColor || GRAY_900;
  const labelSize = opts.labelSize || 8.5;
  const valueSize = opts.valueSize || 8.5;
  const gap = opts.gap ?? 1.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelSize);
  setText(doc, labelColor);
  doc.text(label, x, y);
  const wLabel = doc.getTextWidth(label);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(valueSize);
  setText(doc, valueColor);
  doc.text(String(value ?? ''), x + wLabel + gap, y);

  return wLabel + gap + doc.getTextWidth(String(value ?? ''));
}

export async function generarPdfFactura({
  factura,
  items = [],
  referencias = [],
  empresa = {},
  cliente = {},
  accion = 'descargar',
}) {
  if (!factura) throw new Error('generarPdfFactura: factura es requerida');

  const esInterna = factura.estado === 'INTERNA' || factura.es_interna === true;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - 2 * margin;
  const footerH = 22;
  let y = 10;

  const recRazon  = factura.receptor_razon_social || cliente.razon_social || cliente.nombre || '-';
  const recRuc    = factura.receptor_ruc || cliente.ruc || cliente.ruc_cedula || '';
  const recDv     = factura.receptor_dv  || cliente.dv  || '';
  const recDir    = factura.receptor_direccion || cliente.direccion || '';
  const recCorreo = factura.receptor_correo || cliente.correo || '';
  const recTel    = factura.receptor_telefono || cliente.telefono || '';
  const tipoClienteFE = factura.receptor_tipo_fe || cliente.tipo_cliente_fe || (recRuc ? '01' : '02');

  const [logoDataUrl, qrDataUrl] = await Promise.all([
    cargarImagenComoDataUrl(empresa?.logo_url),
    esInterna ? Promise.resolve(null) : generarQRDataUrl(factura.qr_url || factura.cufe),
  ]);

  const headerTop = y;
  const headerH   = 46;
  const colLogoW  = 60;
  const colQrW    = 34;
  const colLogoX  = margin;
  const colQrX    = pageW - margin - colQrW;
  const colDgiX   = colLogoX + colLogoW + 2;
  const colDgiW   = colQrX - colDgiX - 2;

  const logoMaxW = colLogoW - 4;
  const logoMaxH = 20;
  let logoBottomY = headerTop + 4;
  if (logoDataUrl) {
    try {
      const props = doc.getImageProperties ? doc.getImageProperties(logoDataUrl) : null;
      let lw = logoMaxW;
      let lh = logoMaxH;
      if (props && props.width && props.height) {
        const ratio = props.width / props.height;
        if (ratio > logoMaxW / logoMaxH) { lw = logoMaxW; lh = logoMaxW / ratio; }
        else { lh = logoMaxH; lw = logoMaxH * ratio; }
      }
      const lx = colLogoX + 1 + (colLogoW - lw) / 2;
      const zonaLogo = 22;
      const ly = headerTop + (zonaLogo - lh) / 2;
      doc.addImage(logoDataUrl, 'PNG', lx, ly, lw, lh, undefined, 'FAST');
      logoBottomY = ly + lh;
    } catch { /* ignorar */ }
  } else {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(
      String(empresa?.nombre_empresa || 'GENS').toUpperCase(),
      colLogoX + 1 + colLogoW / 2,
      headerTop + 13,
      { align: 'center' }
    );
    logoBottomY = headerTop + 18;
  }

  const emiNombreHdr   = (empresa?.razon_social_fiscal || empresa?.nombre_empresa || 'GENS').toString();
  const emiRucHdr      = empresa?.ruc || '';
  const emiDvHdr       = empresa?.dv  || '';
  const emiTelHdr      = empresa?.telefono ? formatTelefonoPA(empresa.telefono) : '';
  const emiCorreoHdr   = empresa?.correo || '';
  const emiDirHdr      = empresa?.direccion || '';

  let yEmi = logoBottomY + 3;
  const xEmi = colLogoX + 1;
  const wEmi = colLogoW - 2;

  setText(doc, GRAY_900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const nomLines = doc.splitTextToSize(emiNombreHdr, wEmi);
  doc.text(nomLines[0] || '', xEmi, yEmi);
  yEmi += 3.4;

  if (emiRucHdr) {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('RUC:', xEmi, yEmi);
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'normal');
    doc.text(getRucDv(emiRucHdr, emiDvHdr), xEmi + 9, yEmi);
    yEmi += 3.4;
  }

  if (emiTelHdr) {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Tel:', xEmi, yEmi);
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'normal');
    doc.text(emiTelHdr, xEmi + 7, yEmi);
    yEmi += 3.2;
  }

  if (emiCorreoHdr) {
    setText(doc, GRAY_700);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const corLines = doc.splitTextToSize(emiCorreoHdr, wEmi);
    doc.text(corLines[0] || '', xEmi, yEmi);
    yEmi += 3.2;
  }

  if (emiDirHdr) {
    setText(doc, GRAY_700);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const dirLines = doc.splitTextToSize(emiDirHdr, wEmi);
    doc.text(dirLines.slice(0, 2), xEmi, yEmi);
  }

  const xDgiCenter = colDgiX + colDgiW / 2;
  const tituloBaseY = headerTop + 14;

  if (esInterna) {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('FACTURA', xDgiCenter, tituloBaseY + 4, { align: 'center' });
    setText(doc, GRAY_600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Documento interno · GENS', xDgiCenter, tituloBaseY + 11, { align: 'center' });
  } else {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DGI', xDgiCenter, tituloBaseY, { align: 'center' });
    setText(doc, GRAY_800);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Comprobante Auxiliar de Factura Electrónica', xDgiCenter, tituloBaseY + 7, { align: 'center' });
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(getTipoDocumentoLabel(factura, referencias), xDgiCenter, tituloBaseY + 15, { align: 'center' });
  }

  if (!esInterna) {
    const qrSize = 32;
    const qrX = colQrX + (colQrW - qrSize) / 2;
    const qrY = headerTop + (headerH - qrSize) / 2;
    if (qrDataUrl) {
      try { doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST'); } catch {}
    } else {
      setText(doc, GRAY_400);
      doc.setFontSize(6);
      doc.text('QR no\ndisp.', colQrX + colQrW / 2, headerTop + headerH / 2, { align: 'center' });
    }
  }

  y = headerTop + headerH + 1;

  const sucCod    = String(factura.codigo_sucursal || empresa.codigo_sucursal || '0001').padStart(4, '0');
  const puntoFact = String(factura.punto_facturacion || empresa.punto_facturacion || '001').padStart(3, '0');
  const sucPunto  = `${sucCod}/${puntoFact}`;
  const tipoDocCorto = getTipoDocumentoLabelCorto(factura, referencias);
  const fechaLiteral = formatoFechaLiteral(factura.fecha_emision) || formatDateTime(factura.fecha_emision) || '-';
  const numDocTxt = String(factura.numero_documento || '-');
  const protocolo = factura.nro_protocolo_autorizacion || factura.protocolo_autorizacion || '';
  const fechaRecepDgi = factura.fecha_recepcion_dgi || factura.fecha_autorizacion || factura.fecha_emision;
  const fechaRecepTxt = formatoFechaDGI(fechaRecepDgi);
  const protocoloTxt = protocolo
    ? `${protocolo}${fechaRecepTxt ? ' del ' + fechaRecepTxt : ''}`
    : '-';

  const urlBoxTop2 = y;
  const urlTxt = 'https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE';
  const cufeText = String(factura.cufe || '-');

  if (!esInterna) {
    setText(doc, GRAY_700);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Consulte por la clave de acceso en:', margin, urlBoxTop2);
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.text(' ' + urlTxt, margin + doc.getTextWidth('Consulte por la clave de acceso en:'), urlBoxTop2);
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('usando el CUFE:', margin, urlBoxTop2 + 4);
    const cufeLblW2 = doc.getTextWidth('usando el CUFE:');
    setText(doc, GRAY_900);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    const cufeLines = doc.splitTextToSize(cufeText, contentW - cufeLblW2 - 4);
    doc.text(cufeLines[0] || '-', margin + cufeLblW2 + 2, urlBoxTop2 + 4);
    y = urlBoxTop2 + 9;
  } else {
    y = urlBoxTop2;
  }

  const partyTop  = y;
  const partyHdrH = 6;
  const colPartyW = contentW / 2;
  const docCajaX   = margin;
  const receptorX  = margin + colPartyW;

  const dibujarFilaParty = (cx, cy, cw, label, value) => {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(label, cx + 2, cy);
    const lblW = doc.getTextWidth(label);
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const valLines = doc.splitTextToSize(String(value || '-'), cw - lblW - 5);
    doc.text(valLines[0] || '-', cx + 2 + lblW + 1.5, cy);
    return valLines.length;
  };

  const recTipoLabel = getTipoReceptorLabel(tipoClienteFE);
  const recDireccion = recDir || '-';
  const recTelFmt    = recTel ? formatTelefonoPA(recTel) : '';
  const recRucLinea  = [
    recRuc ? `${recRuc}` : '-',
    recDv ? `   DV: ${recDv}` : '',
    recTelFmt ? `   Teléfono: ${recTelFmt}` : '',
  ].join('');

  const rowH = 4.5;
  const filasMax = 5;
  const partyBodyH = filasMax * rowH + 3;
  const partyH = partyHdrH + partyBodyH;

  setFill(doc, WHITE);
  setDraw(doc, SAVANTE_BLUE);
  doc.setLineWidth(0.35);
  doc.rect(docCajaX,  partyTop, colPartyW, partyH, 'FD');
  doc.rect(receptorX, partyTop, colPartyW, partyH, 'FD');

  setFill(doc, SAVANTE_BLUE);
  doc.rect(docCajaX,  partyTop, colPartyW, partyHdrH, 'F');
  doc.rect(receptorX, partyTop, colPartyW, partyHdrH, 'F');

  setText(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATOS DEL DOCUMENTO', docCajaX  + colPartyW / 2, partyTop + 4.2, { align: 'center' });
  doc.text('RECEPTOR',            receptorX + colPartyW / 2, partyTop + 4.2, { align: 'center' });

  let yD = partyTop + partyHdrH + 4;
  dibujarFilaParty(docCajaX, yD, colPartyW, 'Documento:',      tipoDocCorto);   yD += rowH;
  dibujarFilaParty(docCajaX, yD, colPartyW, 'Sucursal/Punto:', sucPunto);       yD += rowH;
  dibujarFilaParty(docCajaX, yD, colPartyW, 'Fecha emisión:',  fechaLiteral);   yD += rowH;
  dibujarFilaParty(docCajaX, yD, colPartyW, 'Número:',          numDocTxt);     yD += rowH;
  if (esInterna) {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Documento:', docCajaX + 2, yD);
    const estLblW = doc.getTextWidth('Documento:');
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Interno · GENS', docCajaX + 2 + estLblW + 1.5, yD);
  } else {
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Protocolo:', docCajaX + 2, yD);
    const protoLblW2 = doc.getTextWidth('Protocolo:');
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const protoLines = doc.splitTextToSize(protocoloTxt, colPartyW - protoLblW2 - 6);
    doc.text(protoLines[0] || '-', docCajaX + 2 + protoLblW2 + 1.5, yD);
  }

  let yR = partyTop + partyHdrH + 4;
  dibujarFilaParty(receptorX, yR, colPartyW, 'Tipo de receptor:', recTipoLabel); yR += rowH;
  dibujarFilaParty(receptorX, yR, colPartyW, 'Nombre:',    recRazon);            yR += rowH;
  dibujarFilaParty(receptorX, yR, colPartyW, 'Dirección:', recDireccion);        yR += rowH;
  dibujarFilaParty(receptorX, yR, colPartyW, 'RUC:',       recRucLinea);         yR += rowH;
  dibujarFilaParty(receptorX, yR, colPartyW, 'Correo:',    recCorreo || '-');

  y = partyTop + partyH + 6;

  const bodyItems = items.map((it, idx) => {
    const cant = Number(it.cantidad || 0);
    const precio = Number(it.precio_unitario || 0);
    const descU = Number(it.descuento_unitario ?? it.descuento ?? 0);
    const tasaCodigo = it.tasa_itbms || '01';
    const tasaLabel = TASAS_ITBMS_LABEL[tasaCodigo] || `${tasaCodigo}%`;
    const tasaPct = TASAS_ITBMS_VALOR[tasaCodigo] ?? Number(tasaCodigo) ?? 0;
    const totalLinea = Number(
      it.valor_total ?? it.total_linea ?? ((cant * precio - descU) * (1 + tasaPct / 100))
    );
    return [
      String(idx + 1),
      it.codigo || it.sku || '-',
      it.descripcion || '-',
      cant.toLocaleString('es-PA', { minimumFractionDigits: 2 }),
      it.unidad_medida || 'UND',
      formatCurrency(precio),
      descU > 0 ? formatCurrency(descU) : '-',
      tasaLabel,
      formatCurrency(totalLinea),
    ];
  });

  autoTable(doc, {
    startY: y,
    theme: 'plain',
    head: [['#', 'Código', 'Descripción', 'Cant.', 'U/M', 'Precio Unit.', 'Descuento', 'ITBMS', 'Total']],
    body: bodyItems,
    headStyles: {
      fillColor: SAVANTE_BLUE,
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: { top: 2.2, right: 2, bottom: 2.2, left: 2 },
      textColor: GRAY_900,
      lineColor: GRAY_200,
      lineWidth: 0.1,
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: GRAY_50 },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 20, halign: 'left' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 12, halign: 'right' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: footerH + 10 },
    showHead: 'everyPage',
  });
  y = doc.lastAutoTable.finalY + 4;

  const itbmsPorTasa = {};
  let subtotalCalc = 0;
  let descuentoCalc = 0;
  items.forEach((it) => {
    const tasaCodigo = it.tasa_itbms || '01';
    const tasaLabel = TASAS_ITBMS_LABEL[tasaCodigo] || `${tasaCodigo}%`;
    const cant = Number(it.cantidad || 0);
    const precio = Number(it.precio_unitario || 0);
    const descU = Number(it.descuento_unitario ?? it.descuento ?? 0);
    const base = (cant * precio) - descU;
    const tasaPct = TASAS_ITBMS_VALOR[tasaCodigo] ?? 0;
    const imp = it.valor_itbms != null
      ? Number(it.valor_itbms)
      : (base * tasaPct / 100);
    if (!itbmsPorTasa[tasaLabel]) itbmsPorTasa[tasaLabel] = { base: 0, imp: 0 };
    itbmsPorTasa[tasaLabel].base += base;
    itbmsPorTasa[tasaLabel].imp += imp;
    subtotalCalc += base;
    descuentoCalc += descU;
  });

  const subtotal = Number(factura.total_neto ?? factura.subtotal ?? subtotalCalc);
  const descuentoTotal = Number(factura.total_descuento ?? descuentoCalc);
  const itbmsTotal = Number(
    factura.total_itbms ??
    Object.values(itbmsPorTasa).reduce((s, v) => s + v.imp, 0)
  );
  const totalGeneral = Number(
    factura.total_factura ?? factura.total ?? (subtotal + itbmsTotal - descuentoTotal)
  );

  const totalesFilas = [];
  totalesFilas.push(['Subtotal:', formatCurrency(subtotal)]);
  if (descuentoTotal > 0) {
    totalesFilas.push(['Descuento:', `- ${formatCurrency(descuentoTotal)}`]);
  }
  const tasasOrdenadas = Object.entries(itbmsPorTasa).sort((a, b) =>
    parseFloat(a[0]) - parseFloat(b[0])
  );
  tasasOrdenadas.forEach(([label, { imp }]) => {
    if (imp > 0) { totalesFilas.push([`ITBMS ${label}:`, formatCurrency(imp)]); }
  });

  const totalesW = 82;
  const totalesX = pageW - margin - totalesW;
  const izqW = contentW - totalesW - 4;
  const totH = totalesFilas.length * 5 + 22;

  if (y + totH > pageH - footerH - 30) { doc.addPage(); y = margin; }

  setFill(doc, GRAY_50);
  setDraw(doc, GRAY_300);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, izqW, totH, 'FD');

  setFill(doc, SAVANTE_BLUE);
  doc.rect(margin, y, izqW, 6, 'F');
  setText(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('FORMA DE PAGO', margin + 3, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, GRAY_900);
  let yp = y + 11;
  doc.setFont('helvetica', 'bold');
  const formaPagoTexto = esVentaCredito(factura) ? 'Crédito' : (getFormaPagoLabel(factura.forma_pago) || 'Efectivo');
  doc.text(`${formaPagoTexto}`, margin + 3, yp);
  yp += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, GRAY_700);
  doc.text(`Tiempo de pago: ${getTiempoPagoLabel(factura)}`, margin + 3, yp);
  yp += 4;

  if (factura.dias_credito) { doc.text(`Dias de credito: ${factura.dias_credito}`, margin + 3, yp); yp += 4; }
  if (factura.fecha_vencimiento) { doc.text(`Vence: ${formatDate(factura.fecha_vencimiento)}`, margin + 3, yp); yp += 4; }
  if (factura.monto_pagado != null && Number(factura.monto_pagado) > 0) {
    doc.text(`Monto pagado: ${formatCurrency(factura.monto_pagado)}`, margin + 3, yp);
  }

  setFill(doc, WHITE);
  setDraw(doc, GRAY_300);
  doc.setLineWidth(0.3);
  doc.rect(totalesX, y, totalesW, totH, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let yt = y + 6;
  totalesFilas.forEach(([label, value]) => {
    setText(doc, GRAY_700);
    doc.setFont('helvetica', 'normal');
    doc.text(label, totalesX + 3, yt);
    setText(doc, GRAY_900);
    doc.setFont('helvetica', 'bold');
    doc.text(value, totalesX + totalesW - 3, yt, { align: 'right' });
    yt += 5;
  });

  setDraw(doc, SAVANTE_BLUE);
  doc.setLineWidth(0.5);
  doc.line(totalesX + 3, yt - 1, totalesX + totalesW - 3, yt - 1);
  yt += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setText(doc, SAVANTE_BLUE);
  doc.text('TOTAL:', totalesX + 3, yt);
  doc.text(formatCurrency(totalGeneral), totalesX + totalesW - 3, yt, { align: 'right' });

  y += totH + 5;

  const tieneRefs = Array.isArray(referencias) && referencias.length > 0;
  const textoInfo = factura.informacion_interes || factura.observaciones;
  const tieneInfo = !!(textoInfo && String(textoInfo).trim());

  if (tieneRefs || tieneInfo) {
    let infoLinesPre = [];
    if (tieneInfo) {
      doc.setFontSize(8);
      infoLinesPre = doc.splitTextToSize(String(textoInfo), contentW - 6);
    }

    let altoEstim = 7;
    if (tieneRefs) altoEstim += 4 + referencias.length * 3.4;
    if (tieneRefs && tieneInfo) altoEstim += 4;
    if (tieneInfo) altoEstim += 3.5 + infoLinesPre.length * 3.4;
    altoEstim += 3;

    if (y + altoEstim > pageH - footerH - 10) { doc.addPage(); y = margin; }

    setFill(doc, WHITE);
    setDraw(doc, SAVANTE_BLUE);
    doc.setLineWidth(0.35);
    doc.rect(margin, y, contentW, altoEstim, 'FD');

    setFill(doc, SAVANTE_BLUE);
    doc.rect(margin, y, contentW, 6, 'F');
    setText(doc, WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const titulo = tieneRefs && tieneInfo
      ? 'DOCUMENTOS REFERENCIADOS · INFORMACIÓN DE INTERÉS'
      : tieneRefs ? 'DOCUMENTOS REFERENCIADOS' : 'INFORMACIÓN DE INTERÉS';
    doc.text(titulo, margin + 3, y + 4.2);

    let yBlock = y + 9;

    if (tieneRefs) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      setText(doc, GRAY_900);
      referencias.forEach((ref, i) => {
        const cufeRef = typeof ref === 'string' ? ref : (ref.cufe || ref.cufe_referencia || '');
        const numRef = typeof ref === 'object' ? (ref.numero_documento || ref.numero || '') : '';
        const fechaRef = typeof ref === 'object' && ref.fecha_emision ? ` - ${formatDate(ref.fecha_emision)}` : '';
        const linea = `${i + 1}. ${numRef ? `Doc ${numRef}${fechaRef} - ` : ''}CUFE: ${cufeRef}`;
        doc.text(doc.splitTextToSize(linea, contentW - 6), margin + 3, yBlock);
        yBlock += 3.4;
      });
    }

    if (tieneInfo) {
      if (tieneRefs) yBlock += 1;
      setText(doc, SAVANTE_BLUE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      if (tieneRefs) { doc.text('Información de interés:', margin + 3, yBlock); yBlock += 3.4; }
      setText(doc, GRAY_900);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(infoLinesPre, margin + 3, yBlock);
    }

    y += altoEstim + 4;
  }

  const totalPages = doc.internal.getNumberOfPages();
  const anio = new Date().getFullYear();

  const pacNombre = empresa?.pac_nombre || 'The Factory HKA Panamá, S.A.';
  const pacRucDv  = getRucDv(empresa?.pac_ruc || '155596713-2-2015', empresa?.pac_dv || '59');
  const pacReso   = empresa?.pac_resolucion || 'Resolución No. 201-9719 de 12/10/2021';
  const leyendaPac = esInterna
    ? 'Documento interno de GENS para control y gestión de la operación.'
    : `Documento validado por ${pacNombre} con RUC ${pacRucDv}, es Proveedor Autorizado Calificado, ${pacReso}`;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setDraw(doc, GRAY_300);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 22, pageW - margin, pageH - 22);
    setText(doc, GRAY_600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const leyendaLines = doc.splitTextToSize(leyendaPac, contentW - 22);
    doc.text(leyendaLines.slice(0, 2), margin, pageH - 18);
    setText(doc, GRAY_600);
    doc.setFontSize(6.5);
    doc.text(`Pág. ${i} de ${totalPages}`, pageW - margin, pageH - 18, { align: 'right' });
    setDraw(doc, GRAY_200);
    doc.setLineWidth(0.15);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    setText(doc, SAVANTE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('Generado por GENS', margin, pageH - 9);
    setText(doc, GRAY_500);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`(c) ${anio} GENS - Todos los derechos reservados`, pageW - margin, pageH - 9, { align: 'right' });

    if (factura.estado === 'ANULADA') {
      dibujarSelloAnulada(doc, pageW, pageH);
    }
  }

  const tipoLabelFile = String(factura.tipo_documento || '01');
  const numDoc = String(factura.numero_documento || '');
  const nombreCliente = recRazon || 'Cliente';
  const nombreArchivo = esInterna
    ? `FACTURA-INTERNA-${sanitizarNombreArchivo(numDoc)}-${sanitizarNombreArchivo(nombreCliente)}.pdf`
    : `CAFE-${sanitizarNombreArchivo(tipoLabelFile)}-${sanitizarNombreArchivo(numDoc)}-${sanitizarNombreArchivo(nombreCliente)}.pdf`;

  switch (accion) {
    case 'blob':
      return { blob: doc.output('blob'), nombre: nombreArchivo };
    case 'datauri':
      return { datauri: doc.output('datauristring'), nombre: nombreArchivo };
    case 'imprimir':
      try {
        doc.autoPrint && doc.autoPrint();
        const url = doc.output('bloburl');
        const win = window.open(url, '_blank');
        if (win) win.focus();
        return { nombre: nombreArchivo, url };
      } catch {
        doc.save(nombreArchivo);
        return { nombre: nombreArchivo };
      }
    case 'descargar':
    default:
      doc.save(nombreArchivo);
      return { blob: doc.output('blob'), nombre: nombreArchivo };
  }
}

export default generarPdfFactura;
