const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Error en la solicitud');
  }
  return res.json();
}

// QRs
export function getQRs() {
  return request('/qrs');
}

export function getQR(id) {
  return request(`/qrs/${id}`);
}

export function createQR(data) {
  return request('/qrs', { method: 'POST', body: JSON.stringify(data) });
}

export function updateQR(id, data) {
  return request(`/qrs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteQR(id) {
  return request(`/qrs/${id}`, { method: 'DELETE' });
}

// Escaneos
export function getScans(qrId) {
  return request(`/scans?qrId=${qrId}`);
}

export function getRecentScans(limit = 10) {
  return request(`/scans/recent?limit=${limit}`);
}

export function getScanStats() {
  return request('/scans/stats');
}

// Menú
export function getMenuItems() {
  return request('/menu');
}

export function getMenuItemsByCategory(category) {
  return request(`/menu?category=${encodeURIComponent(category)}`);
}

export function createMenuItem(data) {
  return request('/menu', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMenuItem(id, data) {
  return request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteMenuItem(id) {
  return request(`/menu/${id}`, { method: 'DELETE' });
}
