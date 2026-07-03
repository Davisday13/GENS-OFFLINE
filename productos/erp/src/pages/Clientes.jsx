import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, User, Phone, Mail, MapPin } from 'lucide-react'

const initialClientes = [
  { id: 1, nit: '12345678-9', nombre: 'Comercial del Sur S.A.', contacto: 'Carlos Méndez', email: 'cmendez@comercialsur.com', telefono: '2255-3344', direccion: '5a Av. 10-20 Zona 14' },
  { id: 2, nit: '87654321-0', nombre: 'Distribuidora Norte', contacto: 'Ana López', email: 'alopez@distnorte.com', telefono: '2299-8877', direccion: '7a Calle 3-45 Zona 9' },
  { id: 3, nit: '11223344-5', nombre: 'Industrias Maya', contacto: 'Pedro Ramírez', email: 'pramirez@imaya.com', telefono: '2255-6677', direccion: '12 Av. 8-90 Zona 10' },
  { id: 4, nit: '55667788-9', nombre: 'Grupo Empresarial GT', contacto: 'María García', email: 'mgarcia@gegt.com', telefono: '2233-4455', direccion: '6a Av. 15-30 Zona 13' },
  { id: 5, nit: '99887766-5', nombre: 'Soluciones Integrales', contacto: 'José Pérez', email: 'jperez@solint.com', telefono: '2211-2233', direccion: '3a Calle 7-12 Zona 1' },
]

const emptyCliente = { nit: '', nombre: '', contacto: '', email: '', telefono: '', direccion: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState(initialClientes)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyCliente)

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.nit.includes(search) ||
    c.contacto.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditando(null); setForm(emptyCliente); setModalOpen(true) }
  const openEdit = (c) => { setEditando(c); setForm({ ...c }); setModalOpen(true) }

  const handleSave = () => {
    if (editando) {
      setClientes(clientes.map(c => c.id === editando.id ? { ...form, id: editando.id } : c))
    } else {
      setClientes([...clientes, { ...form, id: Date.now() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este cliente?')) setClientes(clientes.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de clientes</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Nuevo Cliente</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar clientes..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">NIT</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Contacto</th>
                <th className="text-left px-3 py-2">Teléfono</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cli => (
                <tr key={cli.id} className="table-row">
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{cli.nit}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{cli.nombre}</td>
                  <td className="px-3 py-2.5 text-gray-600">{cli.contacto}</td>
                  <td className="px-3 py-2.5 text-gray-600">{cli.telefono}</td>
                  <td className="px-3 py-2.5 text-gray-600">{cli.email}</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50" onClick={() => openEdit(cli)}><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDelete(cli.id)}><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold text-gray-900">{editando ? 'Editar' : 'Nuevo'} Cliente</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input className="input-field" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input className="input-field" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
                </div>
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
