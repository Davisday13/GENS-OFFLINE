import { r2, pctTasaItbms, fechaPanama, truncarCodigoItem } from './helpers.js';

export function construirDocumento({ empresa, cliente, items, cabecera, referencias, descuentoCuenta = 0 }) {
  const tipoClienteFE = cliente?.tipo_cliente_fe || (cliente?.ruc_cedula ? '01' : '02');

  const descCuenta = Number(descuentoCuenta) || 0;
  const brutos = items.map((it) => (Number(it.cantidad) || 1) * (Number(it.precioUnitario) || 0));
  const totalBruto = brutos.reduce((s, b) => s + b, 0);

  const itemsHka = items.map((it, i) => {
    const cantidad = Number(it.cantidad) || 1;
    const precioUnit = Number(it.precioUnitario) || 0;
    const prorrateo = (descCuenta > 0 && totalBruto > 0) ? (descCuenta * brutos[i]) / totalBruto : 0;
    const descuentoUnit = r2((Number(it.descuentoUnitario) || 0) + (cantidad > 0 ? prorrateo / cantidad : 0));
    const precioItem = r2(cantidad * (precioUnit - descuentoUnit));
    const tasaCodigo = it.tasaItbms || '01';
    const tasaPct = pctTasaItbms(tasaCodigo) / 100;
    const valorItbms = r2(precioItem * tasaPct);
    const valorTotal = r2(precioItem + valorItbms);
    const itemHka = {
      descripcion: it.descripcion || '',
      codigo: truncarCodigoItem(it.codigo),
      unidadMedida: it.unidadMedida || 'und',
      cantidad: cantidad.toFixed(2),
      precioUnitario: precioUnit.toFixed(2),
      precioItem: precioItem.toFixed(2),
      valorTotal: valorTotal.toFixed(2),
      codigoGTIN: it.codigoGtin || '0',
      cantGTINCom: '0.00',
      codigoGTINInv: '0',
      cantGTINComInv: '0.00',
      tasaITBMS: tasaCodigo,
      valorITBMS: valorItbms.toFixed(2),
    };
    if (descuentoUnit > 0) itemHka.precioUnitarioDescuento = descuentoUnit.toFixed(2);
    if (it.codigoCpbs && String(it.codigoCpbs).trim()) itemHka.codigoCPBS = String(it.codigoCpbs).trim();
    return itemHka;
  });

  const totalPrecioNeto = r2(itemsHka.reduce((s, it) => s + Number(it.precioItem), 0));
  const totalItbms = r2(itemsHka.reduce((s, it) => s + Number(it.valorITBMS), 0));
  const totalFactura = r2(totalPrecioNeto + totalItbms);

  const formaPagoFact = cabecera.formaPago || '02';
  const valorRecibido = Number(cabecera.valorRecibido ?? totalFactura);
  const tiempoPago = cabecera.tiempoPago || '1';

  const listaFormaPago = (Array.isArray(cabecera.formasPago) && cabecera.formasPago.length)
    ? cabecera.formasPago.map((fp) => ({
        formaPagoFact: fp.formaPagoFact || '02',
        descFormaPago: fp.descFormaPago || '',
        valorCuotaPagada: r2(fp.valorCuotaPagada).toFixed(2),
      }))
    : [{ formaPagoFact, descFormaPago: cabecera.descFormaPago || '', valorCuotaPagada: totalFactura.toFixed(2) }];

  const clienteHka = tipoClienteFE === '02' ? {
    tipoClienteFE: '02',
    razonSocial: cliente?.nombre || 'Consumidor Final',
    telefono1: cliente?.telefono || '',
    correoElectronico1: cliente?.correo || '',
    pais: cliente?.pais || 'PA',
  } : {
    tipoClienteFE,
    tipoContribuyente: cliente?.tipo_contribuyente || '',
    numeroRUC: cliente?.ruc_cedula || '',
    digitoVerificadorRUC: cliente?.dv || '',
    razonSocial: cliente?.nombre || '',
    direccion: cliente?.direccion || empresa?.direccion || '',
    codigoUbicacion: empresa?.codigo_ubicacion || '',
    provincia: empresa?.provincia || '',
    distrito: empresa?.distrito || '',
    corregimiento: empresa?.corregimiento || '',
    tipoIdentificacion: cliente?.tipo_identificacion || '',
    nroIdentificacionExtranjero: cliente?.nro_identif_extranj || '',
    paisExtranjero: cliente?.pais_extranjero || '',
    telefono1: cliente?.telefono || '',
    correoElectronico1: cliente?.correo || '',
    pais: cliente?.pais || empresa?.pais || 'PA',
  };

  const doc = {
    codigoSucursalEmisor: empresa.codigo_sucursal || '0000',
    tipoSucursal: empresa.tipo_sucursal || '1',
    datosTransaccion: {
      tipoEmision: '01',
      tipoDocumento: cabecera.tipoDocumento || '01',
      numeroDocumentoFiscal: String(cabecera.numeroDocumento || ''),
      puntoFacturacionFiscal: empresa.punto_facturacion || '001',
      fechaEmision: cabecera.fechaEmision || fechaPanama(),
      fechaSalida: cabecera.fechaSalida || fechaPanama(),
      naturalezaOperacion: cabecera.naturalezaOperacion || '01',
      tipoOperacion: cabecera.tipoOperacion || '1',
      destinoOperacion: cabecera.destinoOperacion || '1',
      formatoCAFE: cabecera.formatoCafe || '1',
      entregaCAFE: cabecera.entregaCafe || '1',
      envioContenedor: '2',
      procesoGeneracion: '1',
      tipoVenta: cabecera.tipoVenta || '',
      informacionInteres: cabecera.informacionInteres || '',
      cliente: clienteHka,
    },
    listaItems: itemsHka,
    totalesSubTotales: {
      totalPrecioNeto: totalPrecioNeto.toFixed(2),
      totalITBMS: totalItbms.toFixed(2),
      totalMontoGravado: totalItbms.toFixed(2),
      totalFactura: totalFactura.toFixed(2),
      totalValorRecibido: valorRecibido.toFixed(2),
      vuelto: r2(Math.max(0, valorRecibido - totalFactura)).toFixed(2),
      tiempoPago,
      nroItems: String(itemsHka.length),
      totalTodosItems: totalFactura.toFixed(2),
      listaFormaPago,
    },
  };

  if (tiempoPago === '2' || tiempoPago === '3') {
    doc.totalesSubTotales.listaPagoPlazo = (Array.isArray(cabecera.pagosPlazo) && cabecera.pagosPlazo.length)
      ? cabecera.pagosPlazo.map((c) => ({
          fechaVenceCuota: c.fechaVence ? fechaPanama(c.fechaVence) : (cabecera.fechaVencimiento ? fechaPanama(cabecera.fechaVencimiento) : fechaPanama()),
          valorCuota: r2(c.valorCuota).toFixed(2),
          infoPagoCuota: c.info || '',
        }))
      : [{
          fechaVenceCuota: cabecera.fechaVencimiento ? fechaPanama(cabecera.fechaVencimiento) : fechaPanama(),
          valorCuota: totalFactura.toFixed(2),
          infoPagoCuota: '',
        }];
  }

  if (referencias && Array.isArray(referencias) && referencias.length) {
    doc.datosTransaccion.listaDocsFiscalReferenciados = referencias.map((rf) => ({
      fechaEmisionDocFiscalReferenciado: rf.fechaEmision ? fechaPanama(rf.fechaEmision) : '',
      cufeFEReferenciada: rf.cufe || '',
      nroFacturaPapel: rf.nroFacturaPapel || '',
      nroFacturaImpFiscal: rf.nroFacturaImpFiscal || '',
    }));
  }

  return doc;
}
