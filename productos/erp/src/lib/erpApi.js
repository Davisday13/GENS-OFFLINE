const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Error en la solicitud')
  }
  return res.json()
}

export const erpApi = {
  productos: {
    listar: () => request('/productos'),
    obtener: (id) => request(`/productos/${id}`),
    crear: (data) => request('/productos', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
  },
  clientes: {
    listar: () => request('/clientes'),
    obtener: (id) => request(`/clientes/${id}`),
    crear: (data) => request('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
  },
  proveedores: {
    listar: () => request('/proveedores'),
    obtener: (id) => request(`/proveedores/${id}`),
    crear: (data) => request('/proveedores', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => request(`/proveedores/${id}`, { method: 'DELETE' }),
  },
  bodegas: {
    listar: () => request('/bodegas'),
    obtener: (id) => request(`/bodegas/${id}`),
    crear: (data) => request('/bodegas', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => request(`/bodegas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => request(`/bodegas/${id}`, { method: 'DELETE' }),
  },
  inventario: {
    listar: () => request('/inventario'),
    porBodega: (bodegaId) => request(`/inventario/bodega/${bodegaId}`),
    ajustar: (data) => request('/inventario/ajustar', { method: 'POST', body: JSON.stringify(data) }),
  },
  facturas: {
    listar: () => request('/facturas'),
    obtener: (id) => request(`/facturas/${id}`),
    crear: (data) => request('/facturas', { method: 'POST', body: JSON.stringify(data) }),
    anular: (id) => request(`/facturas/${id}/anular`, { method: 'PUT' }),
  },
  ventas: {
    listar: () => request('/ventas'),
    crear: (data) => request('/ventas', { method: 'POST', body: JSON.stringify(data) }),
    obtener: (id) => request(`/ventas/${id}`),
  },
  compras: {
    listar: () => request('/compras'),
    crear: (data) => request('/compras', { method: 'POST', body: JSON.stringify(data) }),
    recibir: (id) => request(`/compras/${id}/recibir`, { method: 'PUT' }),
  },
  planilla: {
    listar: () => request('/planilla'),
    calcular: (id) => request(`/planilla/${id}/calcular`, { method: 'POST' }),
    pagar: (id) => request(`/planilla/${id}/pagar`, { method: 'PUT' }),
  },
  dashboard: {
    kpis: () => request('/dashboard/kpis'),
    ventasMes: () => request('/dashboard/ventas-mes'),
    ultimasFacturas: () => request('/dashboard/ultimas-facturas'),
  },
  recetas: {
    listar: () => request('/recetas'),
    obtener: (id) => request(`/recetas/${id}`),
    crear: (data) => request('/recetas', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => request(`/recetas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => request(`/recetas/${id}`, { method: 'DELETE' }),
    costo: (id) => request(`/recetas/${id}/costo`),
    producir: (id, data) => request(`/recetas/${id}/producir`, { method: 'POST', body: JSON.stringify(data) }),
    categorias: {
      listar: () => request('/recetas/categorias'),
      crear: (data) => request('/recetas/categorias', { method: 'POST', body: JSON.stringify(data) }),
    },
    menuEngineering: () => request('/recetas/dashboard/menu-engineering'),
    vincularPos: (data) => request('/recetas/vincular-pos', { method: 'POST', body: JSON.stringify(data) }),
    desvincularPos: (id) => request(`/recetas/vincular-pos/${id}`, { method: 'DELETE' }),
  },
  cierresZ: {
    listar: () => request('/pos/cierres'),
    contCierres: () => request('/contabilidad/cierres'),
  },
  produccion: {
    historial: (recetaId) => request(`/recetas/historial/${recetaId}`),
  },
}
