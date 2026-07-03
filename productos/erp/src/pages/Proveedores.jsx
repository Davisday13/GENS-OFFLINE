import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Building2, User, Phone, Mail, Globe } from 'lucide-react'

const initialProveedores = [
  { id: 1, nombre: 'Tecnología Avanzada S.A.', contacto: 'Roberto Díaz', email: 'rdiaz@tecavanzada.com', telefono: '2244-5566', direccion: 'Zona 10, Guatemala' },
  { id: 2, nombre: 'Suministros Globales', contacto: 'Laura Martínez', email: 'lmartinez@sumglobal.com', telefono: '2277-8899', direccion: 'Zona 12, Guatemala' },
  { id: 3, nombre: 'Distribuidora Electrónica', contacto: 'Miguel Ángel', email: 'mangel@delectro.com', telefono: '2233-1122', direccion: 'Zona 9, Guatemala' },
  { id: 4, nombre: 'Importaciones del Pacífico', contacto: 'Sofía Torres', email: 'storres@impac.com', telefono: '2255-3344', direccion: 'Zona 1, Guatemala' },
]

const emptyProveedor = { nombre: '', contacto: '', email: '', telefono: '', direccion: '' }

export default function Proveedores() {
  const [proveedores, setProveedores] = useState(initialProveedores)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyProveedor)

  const filtered = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.contacto.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditando(null); setForm(emptyProveedor); setModalOpen(true) }
  const openEdit = (p) => { setEditando(p); setForm({ ...p }); setModalOpen(true) }

  const handleSave = () => {
    if (editando) {
      setProveedores(proveedores.map(p => p.id === editando.id ? { ...form, id: editando.id } : p))
    } else {
      setProveedores([...proveedores, { ...form, id: Date.now() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este proveedor?')) setProveedores(proveedores.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de proveedores</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Nuevo Proveedor</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar proveedores..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Contacto</th>
                <th className="text-left px-3 py-2">Teléfono</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Dirección</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.contacto}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.telefono}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.email}</td>
                  <td className="px-3 py-2.5 text-gray-500">{p.direccion}</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50" onClick={() => openEdit(p)}><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold text-gray-900">{editando ? 'Editar' : 'Nuevo'} Proveedor</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input className="input-field" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
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
