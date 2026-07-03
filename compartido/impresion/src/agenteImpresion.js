import { escposFactura, escposPago, escposOrden } from './escpos.js';

const AGENTE_URL = 'http://localhost:9911';
const TIMEOUT_MS = 6000;

export const IMPRESORA_LOCAL = {
  tipo: 'LOCAL',
  nombre: 'Impresora local',
  ancho_mm: 80,
  es_default: true,
};

let _ultimoPing = { ok: false, ts: 0 };

export async function agenteDisponible() {
  const ahora = Date.now();
  if (_ultimoPing.ok && (ahora - _ultimoPing.ts) < 30000) return true;
  try {
    const res = await fetchConTimeout(`${AGENTE_URL}/ping`, { method: 'GET' }, 1500);
    if (!res.ok) {
      _ultimoPing = { ok: false, ts: ahora };
      return false;
    }
    const data = await res.json();
    const ok = !!data?.ok;
    _ultimoPing = { ok, ts: ahora };
    return ok;
  } catch {
    _ultimoPing = { ok: false, ts: ahora };
    return false;
  }
}

export async function listarPuertosCom() {
  try {
    const res = await fetchConTimeout(`${AGENTE_URL}/impresoras`, { method: 'GET' }, 3000);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return data?.puertos || [];
  } catch (e) {
    throw new Error('No se pudo contactar al agente: ' + e.message);
  }
}

export async function obtenerImpresoraDefault() {
  try {
    const res = await fetch('http://localhost:3001/api/impresion/configuracion');
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch {}
  return IMPRESORA_LOCAL;
}

async function enviarAlAgente(impresora, comandosBase64) {
  if (!impresora) throw new Error('No hay impresora configurada.');

  const body = {
    tipo: impresora.tipo,
    comandos: comandosBase64,
  };

  if (impresora.tipo === 'IP') {
    body.host = impresora.host;
    body.puerto = impresora.puerto || 9100;
  } else if (impresora.tipo === 'SERIAL') {
    body.com = impresora.com;
    body.baudRate = impresora.baud_rate || 9600;
  } else {
    throw new Error('Tipo de impresora no soportado: ' + impresora.tipo);
  }

  const res = await fetchConTimeout(`${AGENTE_URL}/imprimir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, TIMEOUT_MS);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Agente respondió ${res.status}: ${txt}`);
  }
  return await res.json();
}

export async function imprimirFacturaAgente({
  factura,
  items = [],
  empresa = {},
  cliente = {},
  impresora,
  copias = 1,
  abrirGaveta = false,
}) {
  if (!impresora) impresora = IMPRESORA_LOCAL;
  const anchoMm = impresora?.ancho_mm || empresa?.ticket_ancho_mm || 80;
  const comandos = escposFactura({ factura, items, empresa, cliente, anchoMm, copias, abrirGaveta });
  return enviarAlAgente(impresora, comandos);
}

export async function imprimirPagoAgente({
  pago,
  empresa = {},
  cliente = {},
  factura = null,
  impresora,
  copias = 1,
}) {
  if (!impresora) impresora = IMPRESORA_LOCAL;
  const anchoMm = impresora?.ancho_mm || empresa?.ticket_ancho_mm || 80;
  const comandos = escposPago({ pago, empresa, cliente, factura, anchoMm, copias });
  return enviarAlAgente(impresora, comandos);
}

export async function imprimirOrdenAgente({
  orden,
  items = [],
  empresa = {},
  cliente = {},
  equipo = null,
  impresora,
  copias = 1,
}) {
  if (!impresora) impresora = IMPRESORA_LOCAL;
  const anchoMm = impresora?.ancho_mm || empresa?.ticket_ancho_mm || 80;
  const comandos = escposOrden({ orden, items, empresa, cliente, equipo, anchoMm, copias });
  return enviarAlAgente(impresora, comandos);
}

function fetchConTimeout(url, options = {}, ms = 5000) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const tm = setTimeout(() => {
      ctrl.abort();
      reject(new Error('timeout'));
    }, ms);
    fetch(url, { ...options, signal: ctrl.signal })
      .then((r) => { clearTimeout(tm); resolve(r); })
      .catch((e) => { clearTimeout(tm); reject(e); });
  });
}
