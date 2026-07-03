import { useState } from 'react'
import { Plus, Search, X, DollarSign, Eye, FileText } from 'lucide-react'

const initialVentas = [
  { id: 1, numero: 'VEN-001', cliente: 'Comercial del Sur', fecha: '26/06/2026', monto: 15800, tipo: 'Contado', estado: 'Completada' },
  { id: 2, numero: 'VEN-002', cliente: 'Distribuidora Norte', fecha: '25/06/2026', monto: 42300, tipo: 'Crédito', estado: 'Pendiente' },
  { id: 3, numero: 'VEN-003', cliente: 'Industrias Maya', fecha: '25/06/2026', monto: 8950, tipo: 'Contado', estado: 'Completada' },
  { id: 4, numero: 'VEN-004', cliente: 'Grupo GT', fecha: '24/06/2026', monto: 12500, tipo: 'Crédito', estado: 'Pendiente' },
  { id: 5, numero: 'VEN-005', cliente: 'Soluciones Integrales', fecha: '24/06/2026', monto: 6700, tipo: 'Contado', estado: 'Completada' },
]

const clientesList = ['Comercial del Sur', 'Distribuidora Norte', 'Industrias Maya', 'Grupo GT', 'Soluciones Integrales']
const productosVenta = [
  { id: 1, nombre: 'Laptop Gamer X1', precio: 12500 },
  { id: 2, nombre: 'Monitor 27" 4K', precio: 6800 },
  { id: 3, nombre: 'Teclado Mecánico RGB', precio: 850 },
]

export default function Ventas() {
  const [ventas, setVentas] = useState(initialVentas)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ cliente: '', fecha: new Date().toISOString().split('T')[0], tipo: 'Contado', items: [{ producto: '', cantidad: 1, precio: 0 }], notas: '' })

  const filtered = ventas.filter(v => v.numero.toLowerCase().includes(search.toLowerCase()) || v.cliente.toLowerCase().includes(search.toLowerCase()))

  const addItem = () => setForm({ ...form, items: [...form.items, { producto: '', cantidad: 1, precio: 0 }] })
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const updateItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    if (field === 'producto') {
      const prod = productosVenta.find(p => p.nombre === value)
      if (prod) items[idx].precio = prod.precio
    }
    setForm({ ...form, items })
  }

  const total = form.items.reduce((s, i) => s + i.cantidad * i.precio, 0)

  const handleCreate = () => {
    const num = `VEN-${String(ventas.length + 1).padStart(3, '0')}`
    setVentas([{ id: Date.now(), numero: num, cliente: form.cliente, fecha: form.fecha, monto: total, tipo: form.tipo, estado: 'Pendiente' }, ...ventas])
    setModalOpen(false)
    setForm({ cliente: '', fecha: new Date().toISOString().split('T')[0], tipo: 'Contado', items: [{ producto: '', cantidad: 1, precio: 0 }], notas: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de ventas y cotizaciones</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nueva Venta</button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar ventas..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">No.</th>
                <th className="text-left px-3 py-2">Cliente</th>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-right px-3 py-2">Monto</th>
                <th className="text-center px-3 py-2">Estado</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{v.numero}</td>
                  <td className="px-3 py-2.5 text-gray-600">{v.cliente}</td>
                  <td className="px-3 py-2.5 text-gray-500">{v.fecha}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${v.tipo === 'Contado' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{v.tipo}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium">$ {v.monto.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.estado}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><FileText className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold text-gray-900">Nueva Venta</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select className="input-field" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {clientesList.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option>Contado</option>
                    <option>Crédito</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                        {productosVenta.map(p => <option key={p.id}>{p.nombre}</option>)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea className="input-field" rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
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
              <button className="btn-primary" onClick={handleCreate}><DollarSign className="w-4 h-4" /> Registrar Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
