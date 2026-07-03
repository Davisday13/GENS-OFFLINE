import { AMBIENTES_HKA } from './catalogos.js';

export class ClienteRestHka {
  constructor({ ambiente = 'DEMO', usuario, clave } = {}) {
    this.ambiente = AMBIENTES_HKA[ambiente] || AMBIENTES_HKA.DEMO;
    this.usuario = usuario || 'offline-user';
    this.clave = clave || 'offline-pass';
    this.token = null;
  }

  async autenticar() {
    this.token = `tok-${crypto.randomUUID().slice(0, 12)}`;
    return { token: this.token, expira: '2099-12-31' };
  }

  async emitir(documento) {
    const cufe = `CUFE-OFFLINE-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
    return {
      cufe,
      numero: `FE${String(Date.now()).slice(-8)}`,
      qr: `https://verify.dgi.gob.pa?cufe=${cufe}`,
      estado: 'emitida',
      fecha: new Date().toISOString(),
    };
  }

  async anular(cufe, motivo) {
    return { cufe, estado: 'anulada', motivo: motivo || 'Anulación solicitada' };
  }

  async consultarRucDv(ruc) {
    return {
      ruc,
      dv: ruc.split('-')[1] || '00',
      nombre: 'CONTRIBUYENTE OFFLINE',
      tipo: '01',
      estado: 'ACTIVO',
    };
  }

  async descargar(cufe, formato = 'pdf') {
    return { cufe, formato, url: `http://localhost:3001/api/motor-fiscal/descargar/${cufe}` };
  }

  async foliosRestantes() {
    return { folios: 99999, fecha_consulta: new Date().toISOString() };
  }

  async listaDocumentos(filtros = {}) {
    return { documentos: [], total: 0 };
  }

  async enviarCorreo(cufe, correos) {
    return { cufe, enviado: true, destinatarios: correos };
  }

  async rastrearCorreos(cufe) {
    return { cufe, historial: [] };
  }
}
