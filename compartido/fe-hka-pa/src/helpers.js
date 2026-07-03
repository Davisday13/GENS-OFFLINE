export const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function codigoTasaItbms(pct) {
  const n = Number(pct);
  if (n === 7) return '01';
  if (n === 10) return '02';
  if (n === 15) return '03';
  return '00';
}

export function pctTasaItbms(codigo) {
  switch (String(codigo)) {
    case '01': return 7;
    case '02': return 10;
    case '03': return 15;
    default: return 0;
  }
}

export function fechaPanama(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}-05:00`;
}

export function desglosarItbms(monto, pct, incluido = false) {
  const m = Number(monto) || 0;
  const tasa = (Number(pct) || 0) / 100;
  if (incluido) {
    const base = r2(m / (1 + tasa));
    const itbms = r2(m - base);
    return { base, itbms, total: r2(m) };
  }
  const itbms = r2(m * tasa);
  return { base: r2(m), itbms, total: r2(m + itbms) };
}

export function truncarCodigoItem(codigo, max = 20) {
  const s = String(codigo || '').trim();
  if (s.length <= max) return s;
  return s.replace(/-/g, '').slice(0, max);
}

export function normalizarInfoRuc(respuesta) {
  if (!respuesta || typeof respuesta !== 'object') return null;
  const info = respuesta.infoRuc || respuesta.InfoRuc || respuesta.datos || respuesta;
  const ruc = info.ruc ?? info.Ruc ?? info.RUC;
  const dv = info.dv ?? info.Dv ?? info.DV;
  const razonSocial = info.razonSocial ?? info.RazonSocial ?? info.razon_social;
  if (ruc == null && dv == null && razonSocial == null) return null;
  return {
    tipoRuc: info.tipoRuc ?? info.TipoRuc ?? '',
    ruc: ruc != null ? String(ruc) : '',
    dv: dv != null ? String(dv) : '',
    razonSocial: razonSocial != null ? String(razonSocial) : '',
    afiliadoFE: info.afiliadoFE ?? info.AfiliadoFE ?? '',
  };
}
