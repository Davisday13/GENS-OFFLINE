const API_BASE = 'http://localhost:3001/api';

class ClienteApi {
  constructor() {
    this.token = localStorage.getItem('gens_token') || null;
    this.usuario = JSON.parse(localStorage.getItem('gens_usuario') || 'null');
    this.dbSchema = localStorage.getItem('gens_schema') || 'public';
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Error ${res.status}`);
    }
    return res.json();
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  delete(path) { return this.request('DELETE', path); }

  async authLogin(email, password) {
    const data = await this.post('/auth/login', { email, password });
    this.token = data.token;
    this.usuario = data.usuario;
    localStorage.setItem('gens_token', data.token);
    localStorage.setItem('gens_usuario', JSON.stringify(data.usuario));
    return data;
  }

  async authRegister(email, nombre, password) {
    return this.post('/auth/register', { email, nombre, password });
  }

  authLogout() {
    this.token = null;
    this.usuario = null;
    localStorage.removeItem('gens_token');
    localStorage.removeItem('gens_usuario');
  }

  authPerfil() {
    return this.get('/auth/perfil');
  }

  authUpdatePerfil(datos) {
    return this.put('/auth/perfil', datos);
  }

  getUsuario() {
    return this.usuario;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const api = new ClienteApi();
export default ClienteApi;
