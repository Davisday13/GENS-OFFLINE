import { useState, useEffect } from 'react'
import { Plus, Search, X, Edit2, UtensilsCrossed, Package } from 'lucide-react'

const BASE = '/api'

export default function MenuDigital() {
  const [items, setItems] = useState([])
  const [categorias, setCategorias] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: 1 })

  useEffect(() => {
    fetch(`${BASE}/engage/menu-items`).then(r => r.json()).then(setItems).catch(() => {})
    setCategorias(['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas', 'General'])
  }, [])

  const filtered = items.filter(i => {
    if (search && !i.nombre?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCat && i.categoria !== filterCat) return false
    return true
  })

  const handleCreate = async () => {
    const res = await fetch(`${BASE}/engage/menu-items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setItems([{ ...form, id: data.id }, ...items])
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menú Digital</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los items de tu menú digital</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo Item</button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...categorias].map(c => (
            <button key={c || 'todas'} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterCat === c ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
              {c || 'Todas'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card flex flex-col items-center justify-center py-16 text-gray-400">
            <UtensilsCrossed className="w-16 h-16 mb-4" />
            <p className="text-lg">Sin items en el menú</p>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className={`card ${!item.disponible ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand mt-1">{item.categoria || 'General'}</span>
              </div>
              <p className="text-lg font-bold text-green-600">$ {Number(item.precio || 0).toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">{item.descripcion || 'Sin descripción'}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className={`text-xs font-medium ${item.disponible ? 'text-green-600' : 'text-red-600'}`}>{item.disponible ? 'Disponible' : 'No disponible'}</span>
              <button className="text-gray-400 hover:text-brand"><Edit2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Item del Menú</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea className="input-field" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio</label><input type="number" className="input-field" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label><select className="input-field" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>{categorias.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="disponible" checked={form.disponible === 1} onChange={e => setForm({ ...form, disponible: e.target.checked ? 1 : 0 })} />
                <label htmlFor="disponible" className="text-sm text-gray-700">Disponible</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><UtensilsCrossed className="w-4 h-4" /> Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
