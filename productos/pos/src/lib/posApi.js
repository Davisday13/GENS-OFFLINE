const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

// --- Mesas ---
export function getMesas() {
  return request('/mesas');
}

export function updateMesaEstado(id, estado) {
  return request(`/mesas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

// --- Productos ---
export function getProductos() {
  return request('/productos');
}

export function getCategorias() {
  return request('/categorias');
}

// --- Pedidos ---
export function getPedidos() {
  return request('/pedidos');
}

export function createPedido(data) {
  return request('/pedidos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePedido(id, data) {
  return request(`/pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Facturas ---
export function getFacturas() {
  return request('/facturas');
}

export function createFactura(data) {
  return request('/facturas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Cierres ---
export function getCierres() {
  return request('/cierres');
}

export function createCierre(data) {
  return request('/cierres', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
