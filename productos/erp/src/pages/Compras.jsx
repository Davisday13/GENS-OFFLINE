import { useState } from 'react'
import { Plus, Search, X, Truck, Eye, CheckCircle } from 'lucide-react'

const initialCompras = [
  { id: 1, numero: 'OC-001', proveedor: 'Tecnología Avanzada S.A.', fecha: '25/06/2026', monto: 45000, estado: 'Recibida' },
  { id: 2, numero: 'OC-002', proveedor: 'Suministros Globales', fecha: '24/06/2026', monto: 12800, estado: 'Pendiente' },
  { id: 3, numero: 'OC-003', proveedor: 'Distribuidora Electrónica', fecha: '23/06/2026', monto: 23400, estado: 'Pendiente' },
  { id: 4, numero: 'OC-004', proveedor: 'Importaciones del Pacífico', fecha: '22/06/2026', monto: 56200, estado: 'Recibida' },
  { id: 5, numero: 'OC-005', proveedor: 'Tecnología Avanzada S.A.', fecha: '21/06/2026', monto: 8900, estado: 'Cancelada' },
]

const proveedoresList = ['Tecnología Avanzada S.A.', 'Suministros Globales', 'Distribuidora Electrónica', 'Importaciones del Pacífico']
const productosCompra = [
  { id: 1, nombre: 'Laptop Gamer X1', precio: 9500 },
  { id: 2, nombre: 'Monitor 27" 4K', precio: 5200 },
  { id: 3, nombre: 'Teclado Mecánico RGB', precio: 550 },
]

export default function Compras() {
  const [compras, setCompras] = useState(initialCompras)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ proveedor: '', fecha: new Date().toISOString().split('T')[0], items: [{ producto: '', cantidad: 1, precio: 0 }] })

  const filtered = compras.filter(c => c.numero.toLowerCase().includes(search.toLowerCase()) || c.proveedor.toLowerCase().includes(search.toLowerCase()))

  const addItem = () => setForm({ ...form, items: [...form.items, { producto: '', cantidad: 1, precio: 0 }] })
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const updateItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    if (field === 'producto') {
      const prod = productosCompra.find(p => p.nombre === value)
      if (prod) items[idx].precio = prod.precio
    }
    setForm({ ...form, items })
  }

  const total = form.items.reduce((s, i) => s + i.cantidad * i.precio, 0)

  const handleCreate = () => {
    const num = `OC-${String(compras.length + 1).padStart(3, '0')}`
    setCompras([{ id: Date.now(), numero: num, proveedor: form.proveedor, fecha: form.fecha, monto: total, estado: 'Pendiente' }, ...compras])
    setModalOpen(false)
    setForm({ proveedor: '', fecha: new Date().toISOString().split('T')[0], items: [{ producto: '', cantidad: 1, precio: 0 }] })
  }

  const handleRecibir = (id) => {
    setCompras(compras.map(c => c.id === id ? { ...c, estado: 'Recibida' } : c))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de compras y órdenes</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nueva Orden</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar órdenes..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">No.</th>
                <th className="text-left px-3 py-2">Proveedor</th>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-right px-3 py-2">Monto</th>
                <th className="text-center px-3 py-2">Estado</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{c.numero}</td>
                  <td className="px-3 py-2.5 text-gray-600">{c.proveedor}</td>
                  <td className="px-3 py-2.5 text-gray-500">{c.fecha}</td>
                  <td className="px-3 py-2.5 text-right font-medium">$ {c.monto.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.estado === 'Recibida' ? 'bg-green-100 text-green-700' :
                      c.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50"><Eye className="w-4 h-4" /></button>
                      {c.estado === 'Pendiente' && (
                        <button className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" onClick={() => handleRecibir(c.id)}><CheckCircle className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold text-gray-900">Nueva Orden de Compra</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select className="input-field" value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {proveedoresList.map(p => <option key={p}>{p}</option>)}
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
                        {productosCompra.map(p => <option key={p.id}>{p.nombre}</option>)}
                      </select>
                      <input type="number" className="input-field w-20 text-center" value={item.cantidad} min={1} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))} />
                      <input type="number" className="input-field w-28 text-right" value={item.precio} onChange={e => updateItem(idx, 'precio', Number(e.target.value))} />
                      <span className="text-sm font-medium text-gray-900 w-24 text-right">$ {(item.cantidad * item.precio).toLocaleString()}</span>
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
                  <p className="text-2xl font-bold text-gray-900">$ {total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><Truck className="w-4 h-4" /> Crear Orden</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
