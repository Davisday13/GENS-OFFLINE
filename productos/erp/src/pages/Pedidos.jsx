import { useState, useEffect } from 'react'
import { Search, Plus, X, Coffee, CheckCircle, Printer, DollarSign } from 'lucide-react'

const BASE = '/api'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [mesas, setMesas] = useState([])
  const [productos, setProductos] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('abierto')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMesa, setSelectedMesa] = useState('')
  const [items, setItems] = useState([{ producto: '', cantidad: 1, precio: 0 }])

  useEffect(() => {
    fetch(`${BASE}/pos/pedidos`).then(r => r.json()).then(setPedidos).catch(() => {})
    fetch(`${BASE}/pos/mesas`).then(r => r.json()).then(setMesas).catch(() => {})
    fetch(`${BASE}/pos/productos`).then(r => r.json()).then(setProductos).catch(() => {})
  }, [])

  const filtered = pedidos.filter(p => {
    if (filter !== 'todos' && p.estado !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return String(p.id ?? '').toLowerCase().includes(s) || String(p.mesa_id ?? '').toLowerCase().includes(s)
    }
    return true
  })

  const mesaNombre = (id) => mesas.find(m => m.id === id)?.nombre || 'Mostrador'

  const totalItems = (items) => (items || []).reduce((s, i) => s + (i.cantidad || 0) * (i.precio || 0), 0)

  const handleCreate = async () => {
    const total = items.reduce((s, i) => s + (i.cantidad || 1) * (i.precio || 0), 0)
    const res = await fetch(`${BASE}/pos/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesa_id: selectedMesa || null, items, total }),
    })
    if (res.ok) {
      const data = await res.json()
      setPedidos([data, ...pedidos])
      setModalOpen(false)
      setItems([{ producto: '', cantidad: 1, precio: 0 }])
      setSelectedMesa('')
    }
  }

  const handleCerrar = async (pedido) => {
    const res = await fetch(`${BASE}/pos/pedidos/${pedido.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cerrado' }),
    })
    if (res.ok) {
      setPedidos(pedidos.map(p => p.id === pedido.id ? { ...p, estado: 'cerrado' } : p))
    }
  }

  const addItem = () => setItems([...items, { producto: '', cantidad: 1, precio: 0 }])
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    if (field === 'producto') {
      const prod = productos.find(p => p.nombre === value)
      if (prod) newItems[idx].precio = prod.precio
    }
    setItems(newItems)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de pedidos del restaurante</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo Pedido</button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar pedidos..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['abierto', 'cerrado', 'todos'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f === 'abierto' ? 'Abiertos' : f === 'cerrado' ? 'Cerrados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card flex flex-col items-center justify-center py-16 text-gray-400">
            <Coffee className="w-16 h-16 mb-4" />
            <p className="text-lg">Sin pedidos {filter !== 'todos' ? filter : ''}</p>
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className={`card ${p.estado === 'abierto' ? 'border-l-4 border-l-brand' : 'border-l-4 border-l-gray-300'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">#{String(p.id ?? '').slice(0, 8)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  <Coffee className="w-3 h-3 inline mr-1" />
                  {mesaNombre(p.mesa_id)} — {p.created_at?.slice(0, 10) || '—'}
                </p>
              </div>
              <p className="text-lg font-bold text-brand">$ {Number(p.total || 0).toLocaleString()}</p>
            </div>
            {(p.items || []).length > 0 && (
              <div className="text-sm text-gray-600 mb-3 space-y-1">
                {(typeof p.items === 'string' ? JSON.parse(p.items) : p.items).slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.nombre || item.producto || 'Item'} x{item.cantidad || 1}</span>
                    <span>$ {((item.cantidad || 1) * (item.precio || 0)).toLocaleString()}</span>
                  </div>
                ))}
                {(typeof p.items === 'string' ? JSON.parse(p.items) : p.items).length > 4 && (
                  <p className="text-xs text-gray-400">... y más items</p>
                )}
              </div>
            )}
            {p.estado === 'abierto' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleCerrar(p)} className="btn-secondary flex-1 text-sm"><CheckCircle className="w-4 h-4" /> Cerrar</button>
                <button className="btn-secondary text-sm"><Printer className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Pedido</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
                <select className="input-field" value={selectedMesa} onChange={e => setSelectedMesa(e.target.value)}>
                  <option value="">Mostrador / Sin mesa</option>
                  {mesas.filter(m => m.estado === 'libre').map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} ({m.capacidad} pers.)</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items</label>
                  <button className="text-sm text-brand font-medium hover:underline" onClick={addItem}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select className="input-field flex-1" value={item.producto} onChange={e => updateItem(idx, 'producto', e.target.value)}>
                        <option value="">Seleccionar</option>
                        {productos.map(p => <option key={p.id} value={p.nombre}>{p.nombre} — ${p.precio}</option>)}
                      </select>
                      <input type="number" className="input-field w-16 text-center" value={item.cantidad} min={1} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))} />
                      <span className="text-sm font-medium w-20 text-right">$ {(item.cantidad * item.precio).toLocaleString()}</span>
                      {items.length > 1 && <button onClick={() => removeItem(idx)}><X className="w-4 h-4 text-red-400" /></button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <p className="text-xl font-bold text-gray-900">Total: $ {items.reduce((s, i) => s + (i.cantidad || 1) * (i.precio || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><DollarSign className="w-4 h-4" /> Crear Pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
