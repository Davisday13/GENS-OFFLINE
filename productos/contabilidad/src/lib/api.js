import { api } from 'cliente-api';

export async function getCierresZ(params) {
  return api.get('/api/cierres-z', { params });
}

export async function createCierreZ(data) {
  return api.post('/api/cierres-z', data);
}

export async function getGastos(params) {
  return api.get('/api/gastos', { params });
}

export async function createGasto(data) {
  return api.post('/api/gastos', data);
}

export async function getArqueos(params) {
  return api.get('/api/arqueos', { params });
}

export async function createArqueo(data) {
  return api.post('/api/arqueos', data);
}

export async function getCompras(params) {
  return api.get('/api/compras', { params });
}

export async function createCompra(data) {
  return api.post('/api/compras', data);
}

export async function getConciliacion(params) {
  return api.get('/api/conciliacion', { params });
}

export async function createConciliacion(data) {
  return api.post('/api/conciliacion', data);
}

export async function getAsientos(params) {
  return api.get('/api/asientos', { params });
}

export async function createAsiento(data) {
  return api.post('/api/asientos', data);
}
