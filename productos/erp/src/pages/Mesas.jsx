import { useState, useEffect } from 'react'
import { Circle, Users, Coffee, Plus, X, ShoppingCart, Check, UtensilsCrossed } from 'lucide-react'

const BASE = '/api'

const colorMap = {
  libre: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'text-green-500', bg: 'bg-green-50' },
  ocupada: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', dot: 'text-red-500', bg: 'bg-red-50' },
  reservada: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', dot: 'text-yellow-500', bg: 'bg-yellow-50' },
}

export default function Mesas() {
  const [mesas, setMesas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [selected, setSelected] = useState(null)
  const [cart, setCart] = useState([])
  const [catActiva, setCatActiva] = useState(null)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/pos/mesas`).then(r => r.json()).then(setMesas).catch(() => {})
    fetch(`${BASE}/pos/categorias`).then(r => r.json()).then(c => { setCategorias(c); if (c.length) setCatActiva(c[0].id) }).catch(() => {})
    fetch(`${BASE}/pos/productos`).then(r => r.json()).then(setProductos).catch(() => {})
    fetch(`${BASE}/pos/pedidos`).then(r => r.json()).then(setPedidos).catch(() => {})
  }, [])

  const stats = {
    libres: mesas.filter(m => m.estado === 'libre').length,
    ocupadas: mesas.filter(m => m.estado === 'ocupada').length,
    reservadas: mesas.filter(m => m.estado === 'reservada').length,
  }

  const pedidosDeMesa = (mesaId) => pedidos.filter(p => p.mesa_id === mesaId && p.estado !== 'cerrado')
  const prodFiltrados = productos.filter(p => p.categoria_id === catActiva)
  const totalCarro = cart.reduce((s, i) => s + (i.cantidad || 1) * Number(i.precio || 0), 0)

  const agregarAlCarro = (prod) => {
    setCart(prev => {
      const exist = prev.find(i => i.producto_id === prod.id)
      if (exist) return prev.map(i => i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto_id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 }]
    })
  }

  const quitarDelCarro = (prodId) => {
    setCart(prev => {
      const exist = prev.find(i => i.producto_id === prodId)
      if (exist && exist.cantidad > 1) return prev.map(i => i.producto_id === prodId ? { ...i, cantidad: i.cantidad - 1 } : i)
      return prev.filter(i => i.producto_id !== prodId)
    })
  }

  const crearPedido = async () => {
    if (cart.length === 0) return
    setCreando(true)
    const items = cart.map(i => ({ producto: i.nombre, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio }))
    const res = await fetch(`${BASE}/pos/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesa_id: selected?.id || null, items, total: totalCarro }),
    })
    if (res.ok) {
      fetch(`${BASE}/pos/pedidos`).then(r => r.json()).then(setPedidos).catch(() => {})
      fetch(`${BASE}/pos/mesas`).then(r => r.json()).then(setMesas).catch(() => {})
      setCart([])
      setSelected(null)
    }
    setCreando(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salón — Mapa de Mesas</h1>
          <p className="text-gray-500 text-sm mt-1">Toca una mesa para tomar el pedido</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-3 border-l-4 border-l-green-500">
          <Circle className="w-8 h-8 text-green-500" />
          <div><p className="text-sm text-gray-500">Libres</p><p className="text-2xl font-bold text-gray-900">{stats.libres}</p></div>
        </div>
        <div className="card flex items-center gap-3 border-l-4 border-l-red-500">
          <Circle className="w-8 h-8 text-red-500" />
          <div><p className="text-sm text-gray-500">Ocupadas</p><p className="text-2xl font-bold text-gray-900">{stats.ocupadas}</p></div>
        </div>
        <div className="card flex items-center gap-3 border-l-4 border-l-yellow-500">
          <Circle className="w-8 h-8 text-yellow-500" />
          <div><p className="text-sm text-gray-500">Reservadas</p><p className="text-2xl font-bold text-gray-900">{stats.reservadas}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map(mesa => {
          const colors = colorMap[mesa.estado] || colorMap.libre
          const activos = pedidosDeMesa(mesa.id)
          return (
            <button key={mesa.id} onClick={() => { setSelected(mesa); setCart([]); setCatActiva(categorias[0]?.id) }}
              className={`card flex flex-col items-center justify-center gap-2 border-l-4 ${colors.border} hover:shadow-xl transition-shadow cursor-pointer min-h-[130px] relative ${colors.bg}`}>
              <UtensilsCrossed className={`w-6 h-6 ${colors.dot}`} />
              <span className="text-lg font-bold text-gray-900">{mesa.nombre}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                {mesa.estado}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> {mesa.capacidad} pers.
              </span>
              {activos.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activos.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-3 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.nombre}</h2>
                <p className="text-sm text-gray-500">{selected.capacidad} personas — {selected.estado}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {categorias.map(cat => (
                  <button key={cat.id} onClick={() => setCatActiva(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${catActiva === cat.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    style={catActiva === cat.id ? {} : {}}>
                    {cat.nombre}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {prodFiltrados.map(prod => (
                  <button key={prod.id} onClick={() => agregarAlCarro(prod)}
                    className="p-3 rounded-xl border border-gray-200 hover:border-brand hover:bg-brand-50/30 text-left transition-colors">
                    <p className="text-sm font-medium text-gray-900">{prod.nombre}</p>
                    <p className="text-sm font-bold text-brand mt-1">$ {Number(prod.precio).toFixed(2)}</p>
                  </button>
                ))}
                {prodFiltrados.length === 0 && (
                  <p className="col-span-full text-center text-gray-400 py-8">Sin productos en esta categoría</p>
                )}
              </div>
              {cart.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Pedido</h3>
                    <span className="text-sm text-gray-500">{cart.reduce((s, i) => s + i.cantidad, 0)} items</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {cart.map(item => (
                      <div key={item.producto_id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.nombre}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => quitarDelCarro(item.producto_id)} className="w-5 h-5 rounded bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-300">−</button>
                            <span className="w-6 text-center font-medium">{item.cantidad}</span>
                            <button onClick={() => agregarAlCarro({ id: item.producto_id, nombre: item.nombre, precio: item.precio })} className="w-5 h-5 rounded bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-300">+</button>
                          </div>
                          <span className="w-16 text-right font-medium">$ {Number(item.cantidad * item.precio).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <p className="text-lg font-bold text-gray-900">Total: $ {totalCarro.toFixed(2)}</p>
                    <button onClick={crearPedido} disabled={creando || cart.length === 0}
                      className="btn-primary text-sm flex items-center gap-1">
                      {creando ? 'Creando...' : <><Check className="w-4 h-4" /> Tomar Pedido</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
