import { useState } from 'react'
import { Plus, Search, X, FileText, Trash2, Eye, Printer } from 'lucide-react'

const initialFacturas = [
  { id: 1, numero: 'FAC-001', cliente: 'Comercial del Sur S.A.', fecha: '26/06/2026', monto: 15800, estado: 'Pagada' },
  { id: 2, numero: 'FAC-002', cliente: 'Distribuidora Norte', fecha: '26/06/2026', monto: 42300, estado: 'Pendiente' },
  { id: 3, numero: 'FAC-003', cliente: 'Industrias Maya', fecha: '25/06/2026', monto: 8950, estado: 'Pagada' },
  { id: 4, numero: 'FAC-004', cliente: 'Grupo Empresarial GT', fecha: '24/06/2026', monto: 31200, estado: 'Vencida' },
  { id: 5, numero: 'FAC-005', cliente: 'Soluciones Integrales', fecha: '24/06/2026', monto: 6700, estado: 'Pendiente' },
  { id: 6, numero: 'FAC-006', cliente: 'Comercial del Sur S.A.', fecha: '23/06/2026', monto: 22100, estado: 'Pagada' },
]

const clientesList = ['Comercial del Sur S.A.', 'Distribuidora Norte', 'Industrias Maya', 'Grupo Empresarial GT', 'Soluciones Integrales']
const productosList = [
  { id: 1, nombre: 'Laptop Gamer X1', precio: 12500 },
  { id: 2, nombre: 'Monitor 27" 4K', precio: 6800 },
  { id: 3, nombre: 'Teclado Mecánico RGB', precio: 850 },
  { id: 4, nombre: 'Mouse Inalámbrico', precio: 450 },
  { id: 5, nombre: 'Webcam HD 1080p', precio: 1200 },
]

export default function Facturas() {
  const [facturas, setFacturas] = useState(initialFacturas)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ cliente: '', fecha: new Date().toISOString().split('T')[0], items: [{ producto: '', cantidad: 1, precio: 0 }] })

  const filtered = facturas.filter(f =>
    f.numero.toLowerCase().includes(search.toLowerCase()) ||
    f.cliente.toLowerCase().includes(search.toLowerCase())
  )

  const addItem = () => setForm({ ...form, items: [...form.items, { producto: '', cantidad: 1, precio: 0 }] })

  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const updateItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    if (field === 'producto') {
      const prod = productosList.find(p => p.nombre === value)
      if (prod) items[idx].precio = prod.precio
    }
    setForm({ ...form, items })
  }

  const totalFactura = form.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0)

  const handleCreate = () => {
    const num = `FAC-${String(facturas.length + 1).padStart(3, '0')}`
    setFacturas([{ id: Date.now(), numero: num, cliente: form.cliente, fecha: form.fecha, monto: totalFactura, estado: 'Pendiente' }, ...facturas])
    setModalOpen(false)
    setForm({ cliente: '', fecha: new Date().toISOString().split('T')[0], items: [{ producto: '', cantidad: 1, precio: 0 }] })
  }

  const handleAnular = (id) => {
    setFacturas(facturas.map(f => f.id === id ? { ...f, estado: 'Anulada' } : f))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de facturación</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nueva Factura</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar facturas..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">No.</th>
                <th className="text-left px-3 py-2">Cliente</th>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-right px-3 py-2">Monto</th>
                <th className="text-center px-3 py-2">Estado</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{f.numero}</td>
                  <td className="px-3 py-2.5 text-gray-600">{f.cliente}</td>
                  <td className="px-3 py-2.5 text-gray-500">{f.fecha}</td>
                  <td className="px-3 py-2.5 text-right font-medium">Q {f.monto.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
                      f.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      f.estado === 'Vencida' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{f.estado}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><Printer className="w-4 h-4" /></button>
                      {f.estado !== 'Anulada' && (
                        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleAnular(f.id)}><Trash2 className="w-4 h-4" /></button>
                      )}
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
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Factura</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select className="input-field" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {clientesList.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items</label>
                  <button className="text-sm text-brand font-medium hover:underline" onClick={addItem}>+ Agregar item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select className="input-field flex-1" value={item.producto} onChange={e => updateItem(idx, 'producto', e.target.value)}>
                        <option value="">Seleccionar producto</option>
                        {productosList.map(p => <option key={p.id}>{p.nombre}</option>)}
                      </select>
                      <input type="number" className="input-field w-20 text-center" value={item.cantidad} min={1} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))} />
                      <input type="number" className="input-field w-28 text-right" value={item.precio} onChange={e => updateItem(idx, 'precio', Number(e.target.value))} />
                      <span className="text-sm font-medium text-gray-900 w-24 text-right">Q {(item.cantidad * item.precio).toLocaleString()}</span>
                      {form.items.length > 1 && (
                        <button className="p-1.5 text-gray-400 hover:text-red-600" onClick={() => removeItem(idx)}><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">Q {totalFactura.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><FileText className="w-4 h-4" /> Crear Factura</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
