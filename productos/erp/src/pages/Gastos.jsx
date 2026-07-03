import { useState, useEffect } from 'react'
import { Plus, Search, X, DollarSign, Wallet } from 'lucide-react'

const BASE = '/api'
const categorias = ['Alimentos', 'Bebidas', 'Limpieza', 'Servicios', 'Mantenimiento', 'Transporte', 'Otros']

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], categoria: 'Alimentos', descripcion: '', monto: 0, metodo_pago: 'efectivo', proveedor: '' })

  useEffect(() => {
    fetch(`${BASE}/contabilidad/gastos`).then(r => r.json()).then(setGastos).catch(() => {})
  }, [])

  const filtered = gastos.filter(g =>
    g.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    g.categoria?.toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.reduce((s, g) => s + Number(g.monto || 0), 0)

  const handleCreate = async () => {
    const res = await fetch(`${BASE}/contabilidad/gastos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setGastos([{ ...form, id: data.id, created_at: new Date().toISOString() }, ...gastos])
      setModalOpen(false)
      setForm({ fecha: new Date().toISOString().split('T')[0], categoria: 'Alimentos', descripcion: '', monto: 0, metodo_pago: 'efectivo', proveedor: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500 text-sm mt-1">Control de gastos operativos</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo Gasto</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Gastos</p><p className="text-xl font-bold text-gray-900">$ {total.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Registros</p><p className="text-xl font-bold text-gray-900">{filtered.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Promedio</p><p className="text-xl font-bold text-gray-900">$ {filtered.length > 0 ? (total / filtered.length).toFixed(2) : '0.00'}</p></div>
        </div>
      </div>
      <div className="card">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar gastos..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Categoría</th>
              <th className="text-left px-3 py-2">Descripción</th><th className="text-left px-3 py-2">Proveedor</th>
              <th className="text-right px-3 py-2">Monto</th><th className="text-center px-3 py-2">Pago</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin gastos registrados</td></tr> :
                filtered.map(g => <tr key={g.id} className="table-row">
                  <td className="px-3 py-2.5">{g.fecha}</td>
                  <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100">{g.categoria}</span></td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{g.descripcion}</td>
                  <td className="px-3 py-2.5 text-gray-500">{g.proveedor || '—'}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-red-600">$ {Number(g.monto || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-500">{g.metodo_pago || 'efectivo'}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Gasto</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label><select className="input-field" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>{categorias.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><input className="input-field" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Monto</label><input type="number" className="input-field" value={form.monto} onChange={e => setForm({ ...form, monto: Number(e.target.value) })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Método Pago</label><select className="input-field" value={form.metodo_pago} onChange={e => setForm({ ...form, metodo_pago: e.target.value })}><option value='efectivo'>Efectivo</option><option value='tarjeta'>Tarjeta</option><option value='transferencia'>Transferencia</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label><input className="input-field" value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><DollarSign className="w-4 h-4" /> Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
