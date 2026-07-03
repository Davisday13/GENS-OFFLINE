import { useState, useEffect } from 'react'
import { Plus, Search, X, DollarSign, Banknote, CreditCard } from 'lucide-react'

const BASE = '/api'

export default function Arqueos() {
  const [arqueos, setArqueos] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], monto_sistema: 0, monto_contado: 0, observaciones: '' })

  useEffect(() => {
    fetch(`${BASE}/contabilidad/arqueos`).then(r => r.json()).then(setArqueos).catch(() => {})
  }, [])

  const filtered = arqueos.filter(a => (a.fecha || '').includes(search))
  const diferenciaTotal = filtered.reduce((s, a) => s + Number(a.diferencia || 0), 0)

  const handleCreate = async () => {
    const diferencia = form.monto_contado - form.monto_sistema
    const res = await fetch(`${BASE}/contabilidad/arqueos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, diferencia }),
    })
    if (res.ok) {
      const data = await res.json()
      setArqueos([{ ...form, diferencia, id: data.id, created_at: new Date().toISOString() }, ...arqueos])
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arqueos de Caja</h1>
          <p className="text-gray-500 text-sm mt-1">Conteo físico de efectivo vs sistema</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo Arqueo</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><Banknote className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Arqueos</p><p className="text-xl font-bold text-gray-900">{filtered.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Diferencia Total</p><p className={`text-xl font-bold ${diferenciaTotal !== 0 ? 'text-red-600' : 'text-gray-900'}`}>$ {diferenciaTotal.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Promedio Sistema</p><p className="text-xl font-bold text-gray-900">$ {filtered.length > 0 ? (filtered.reduce((s, a) => s + Number(a.monto_sistema || 0), 0) / filtered.length).toFixed(2) : '0.00'}</p></div>
        </div>
      </div>
      <div className="card">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por fecha..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="text-left px-3 py-2">Fecha</th><th className="text-right px-3 py-2">Sistema</th>
              <th className="text-right px-3 py-2">Contado</th><th className="text-right px-3 py-2">Diferencia</th>
              <th className="text-left px-3 py-2">Observaciones</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin arqueos registrados</td></tr> :
                filtered.map(a => {
                  const diff = Number(a.diferencia || (Number(a.monto_contado || 0) - Number(a.monto_sistema || 0)))
                  return <tr key={a.id} className="table-row">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{a.fecha}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(a.monto_sistema || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(a.monto_contado || 0).toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>$ {diff.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-sm">{a.observaciones || '—'}</td>
                  </tr>
                })}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Arqueo</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Monto Sistema</label><input type="number" className="input-field" value={form.monto_sistema} onChange={e => setForm({ ...form, monto_sistema: Number(e.target.value) })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Monto Contado</label><input type="number" className="input-field" value={form.monto_contado} onChange={e => setForm({ ...form, monto_contado: Number(e.target.value) })} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Diferencia estimada</p>
                <p className={`text-2xl font-bold ${form.monto_contado - form.monto_sistema !== 0 ? 'text-red-600' : 'text-green-600'}`}>$ {(form.monto_contado - form.monto_sistema).toLocaleString()}</p>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label><textarea className="input-field" rows={2} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}>Registrar Arqueo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
