export function r2(valor) {
  return Math.round((valor || 0) * 100) / 100;
}

export function codigoTasaItbms(porcentaje) {
  if (porcentaje <= 0) return 0;
  if (porcentaje <= 5) return 5;
  if (porcentaje <= 7) return 7;
  return 10;
}

export function fechaPanama() {
  return new Date().toLocaleString('es-PA', { timeZone: 'America/Panama' });
}

export function desglosarItbms(total, tasa = 7) {
  const factor = 1 + (tasa / 100);
  const base = r2(total / factor);
  const itbms = r2(total - base);
  return { base, itbms, tasa };
}
