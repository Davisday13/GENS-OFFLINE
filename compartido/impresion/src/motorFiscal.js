const MOTOR_URL = 'http://localhost:8088';

export async function motorDisponible(timeoutMs = 1500) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(`${MOTOR_URL}/estado`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return false;
    const j = await r.json();
    return j?.motor === 'ok';
  } catch {
    return false;
  }
}

export async function emitirEnMotor(documento, id_factura = null) {
  const r = await fetch(`${MOTOR_URL}/emitir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_factura, documento }),
  });
  if (!r.ok) throw new Error(`Motor fiscal respondió ${r.status}`);
  return r.json();
}

export async function anularEnMotor(payload) {
  const r = await fetch(`${MOTOR_URL}/anular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Motor fiscal respondió ${r.status}`);
  return r.json();
}

export async function colaPendiente() {
  try {
    const r = await fetch(`${MOTOR_URL}/cola`);
    return r.ok ? r.json() : { pendientes: 0 };
  } catch {
    return { pendientes: 0 };
  }
}
