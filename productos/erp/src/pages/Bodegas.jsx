import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Building2, MapPin, User, Phone } from 'lucide-react'

const initialBodegas = [
  { id: 1, nombre: 'Bodega Central', ubicacion: 'Zona 10, Guatemala', encargado: 'Juan Pérez', telefono: '2255-3344', capacidad: 5000 },
  { id: 2, nombre: 'Bodega Norte', ubicacion: 'Zona 18, Guatemala', encargado: 'María López', telefono: '2299-8877', capacidad: 3500 },
  { id: 3, nombre: 'Bodega Sur', ubicacion: 'Villa Nueva', encargado: 'Carlos Ruiz', telefono: '2277-1122', capacidad: 2000 },
]

const emptyBodega = { nombre: '', ubicacion: '', encargado: '', telefono: '', capacidad: 0 }

export default function Bodegas() {
  const [bodegas, setBodegas] = useState(initialBodegas)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyBodega)

  const filtered = bodegas.filter(b => b.nombre.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditando(null); setForm(emptyBodega); setModalOpen(true) }
  const openEdit = (b) => { setEditando(b); setForm({ ...b }); setModalOpen(true) }

  const handleSave = () => {
    if (editando) {
      setBodegas(bodegas.map(b => b.id === editando.id ? { ...form, id: editando.id } : b))
    } else {
      setBodegas([...bodegas, { ...form, id: Date.now() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta bodega?')) setBodegas(bodegas.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bodegas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de bodegas</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva Bodega</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar bodegas..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Ubicación</th>
                <th className="text-left px-3 py-2">Encargado</th>
                <th className="text-left px-3 py-2">Teléfono</th>
                <th className="text-right px-3 py-2">Capacidad</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{b.nombre}</td>
                  <td className="px-3 py-2.5 text-gray-600">{b.ubicacion}</td>
                  <td className="px-3 py-2.5 text-gray-600">{b.encargado}</td>
                  <td className="px-3 py-2.5 text-gray-600">{b.telefono}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{b.capacidad.toLocaleString()} m²</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50" onClick={() => openEdit(b)}><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? 'Editar' : 'Nueva'} Bodega</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Encargado</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.encargado} onChange={e => setForm({ ...form, encargado: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (m²)</label>
                <input type="number" className="input-field" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
