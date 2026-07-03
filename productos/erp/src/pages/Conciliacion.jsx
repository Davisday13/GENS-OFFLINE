import { useState, useEffect } from 'react'
import { Plus, Search, X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

const BASE = '/api'

export default function Conciliacion() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], tipo: 'banco', descripcion: '', monto: 0, estado: 'pendiente' })

  useEffect(() => {
    fetch(`${BASE}/contabilidad/conciliacion`).then(r => r.json()).then(setItems).catch(() => {})
  }, [])

  const filtered = items.filter(i => (i.descripcion || '').toLowerCase().includes(search.toLowerCase()))
  const pendientes = filtered.filter(i => i.estado === 'pendiente').reduce((s, i) => s + Number(i.monto || 0), 0)
  const conciliados = filtered.filter(i => i.estado === 'conciliado').reduce((s, i) => s + Number(i.monto || 0), 0)

  const handleCreate = async () => {
    const res = await fetch(`${BASE}/contabilidad/conciliacion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) {
      setItems([{ ...form, id: Date.now().toString() }, ...items])
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conciliación Bancaria</h1>
          <p className="text-gray-500 text-sm mt-1">Conciliación de movimientos bancarios</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nueva Partida</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Partidas</p><p className="text-xl font-bold text-gray-900">{filtered.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Pendientes</p><p className="text-xl font-bold text-yellow-600">$ {pendientes.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Conciliado</p><p className="text-xl font-bold text-green-600">$ {conciliados.toLocaleString()}</p></div>
        </div>
      </div>
      <div className="card">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="text-left px-3 py-2">Fecha</th><th className="text-left px-3 py-2">Tipo</th>
              <th className="text-left px-3 py-2">Descripción</th><th className="text-right px-3 py-2">Monto</th>
              <th className="text-center px-3 py-2">Estado</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin movimientos</td></tr> :
                filtered.map(i => <tr key={i.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium">{i.fecha}</td>
                  <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{i.tipo}</span></td>
                  <td className="px-3 py-2.5 text-gray-900">{i.descripcion}</td>
                  <td className="px-3 py-2.5 text-right font-medium">$ {Number(i.monto || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i.estado === 'conciliado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{i.estado}</span>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Partida</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}><option value='banco'>Banco</option><option value='caja'>Caja</option><option value='tarjeta'>Tarjeta</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><input className="input-field" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Monto</label><input type="number" className="input-field" value={form.monto} onChange={e => setForm({ ...form, monto: Number(e.target.value) })} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
