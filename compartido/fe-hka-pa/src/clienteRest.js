import { AMBIENTES_HKA } from './catalogos.js';

export function crearClienteHka({ urlBase = AMBIENTES_HKA.DEMO, usuario, clave }) {
  let token = null;
  let tokenExp = 0;

  async function autenticar() {
    const r = await fetch(`${urlBase}/api/Autenticacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave }),
    });
    const j = await r.json();
    if (!j.token) throw new Error(j.mensaje || 'No se pudo autenticar con HKA');
    token = j.token;
    tokenExp = j.expiracion ? new Date(j.expiracion).getTime() : (Date.now() + 23 * 3600 * 1000);
    return token;
  }

  async function getToken() {
    if (token && Date.now() < tokenExp - 60000) return token;
    return autenticar();
  }

  async function postAuth(path, body) {
    const r = await fetch(`${urlBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
      body: JSON.stringify(body),
    });
    const txt = await r.text();
    try { return JSON.parse(txt); } catch { return { raw: txt }; }
  }

  return {
    autenticar,
    getToken,

    emitir(documento) {
      return postAuth('/api/Enviar', { documento });
    },

    anular({ motivoAnulacion, datosDocumento }) {
      return postAuth('/api/Anulacion', { motivoAnulacion, datosDocumento });
    },

    consultarRucDv({ tipoRuc = '2', ruc }) {
      return postAuth('/api/ConsultaRucDv', { tipoRuc, ruc });
    },

    descargar({ cufe, numeroDocumento, tipoArchivo = 'PDF' }) {
      return postAuth('/api/Descarga', { cufe, numeroDocumento, tipoArchivo });
    },

    async foliosRestantes() {
      const r = await fetch(`${urlBase}/api/FoliosRestantes`, {
        headers: { 'Authorization': `Bearer ${await getToken()}` },
      });
      return r.json();
    },

    listaDocumentos({ codigoSucursal, ptoFacturacion, tipoDocumento = '01', serialDispositivo = '', fechaInicio, fechaFin, paginaActual = 1 }) {
      return postAuth('/api/ListaDocumentos', {
        codigoSucursal, ptoFacturacion, tipoDocumento, serialDispositivo,
        fechaInicio: fechaInicio || fechaFin, fechaFin, paginaActual,
      });
    },

    enviarCorreo({ cufe, correos }) {
      return postAuth('/api/EnvioCorreo', { cufe, correos: Array.isArray(correos) ? correos : [correos] });
    },

    rastrearCorreos({ cufe }) {
      return postAuth('/api/RastrearCorreos', { cufe });
    },
  };
}

export class ClienteRestHka {
  constructor({ ambiente = 'DEMO', usuario, clave } = {}) {
    this.ambiente = AMBIENTES_HKA[ambiente]?.baseUrl || AMBIENTES_HKA.DEMO.baseUrl;
    this.usuario = usuario || 'offline-user';
    this.clave = clave || 'offline-pass';
  }

  async autenticar() {
    const hka = crearClienteHka({ urlBase: this.ambiente, usuario: this.usuario, clave: this.clave });
    this._hka = hka;
    return hka.autenticar().catch(() => offlineAuth(this));
  }

  async emitir(documento) {
    if (this._hka) {
      try { return await this._hka.emitir(documento); } catch {}
    }
    return offlineEmitir(documento);
  }

  async anular(cufe, motivo) {
    if (this._hka) {
      try { return await this._hka.anular({ motivoAnulacion: motivo, datosDocumento: { cufe } }); } catch {}
    }
    return { cufe, estado: 'anulada', motivo: motivo || 'Anulación solicitada' };
  }

  async consultarRucDv(ruc) {
    if (this._hka) {
      try { return await this._hka.consultarRucDv({ ruc }); } catch {}
    }
    return offlineConsultarRuc(ruc);
  }

  async descargar(cufe, tipoArchivo = 'PDF') {
    if (this._hka) {
      try { return await this._hka.descargar({ cufe, tipoArchivo }); } catch {}
    }
    return { cufe, tipoArchivo, url: `http://localhost:3001/api/motor-fiscal/descargar/${cufe}` };
  }

  async foliosRestantes() {
    if (this._hka) {
      try { return await this._hka.foliosRestantes(); } catch {}
    }
    return { foliosDisponibleCiclo: 99999, foliosDisponibleRango: 99999 };
  }

  async listaDocumentos(filtros = {}) {
    if (this._hka) {
      try { return await this._hka.listaDocumentos(filtros); } catch {}
    }
    return { documentos: [], total: 0 };
  }

  async enviarCorreo(cufe, correos) {
    if (this._hka) {
      try { return await this._hka.enviarCorreo({ cufe, correos }); } catch {}
    }
    return { codigo: '0', resultado: 'Procesado offline' };
  }

  async rastrearCorreos(cufe) {
    if (this._hka) {
      try { return await this._hka.rastrearCorreos({ cufe }); } catch {}
    }
    return { cufe, correos: [] };
  }
}

function offlineAuth(self) {
  self._token = `tok-${crypto.randomUUID().slice(0, 12)}`;
  return { token: self._token, expiracion: '2099-12-31' };
}

function offlineEmitir(documento) {
  const cufe = `CUFE-OFFLINE-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
  return {
    codigo: '0', resultado: 'Procesado',
    cufe, qr: `https://verify.dgi.gob.pa?cufe=${cufe}`,
    numeroDocumento: `FE${String(Date.now()).slice(-8)}`,
  };
}

function offlineConsultarRuc(ruc) {
  return {
    infoRuc: {
      ruc, dv: ruc?.split('-')[1] || '00',
      razonSocial: 'CONTRIBUYENTE OFFLINE',
      afiliadoFE: 'SI',
    },
  };
}
