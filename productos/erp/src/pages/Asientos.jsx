import { useState, useEffect } from 'react'
import { Plus, Search, X, FileText, BookOpen } from 'lucide-react'

const BASE = '/api'

export default function Asientos() {
  const [asientos, setAsientos] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], tipo: 'general', descripcion: '', referencia: '', cuenta: '110101', debe: 0, haber: 0 })

  useEffect(() => {
    fetch(`${BASE}/finanzas/asientos`).then(r => r.json()).then(setAsientos).catch(() => {})
  }, [])

  const filtered = asientos.filter(a =>
    (a.descripcion || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.referencia || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    const res = await fetch(`${BASE}/finanzas/asientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setAsientos([{ ...form, id: data.id, numero: data.numero, created_at: new Date().toISOString() }, ...asientos])
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asientos Contables</h1>
          <p className="text-gray-500 text-sm mt-1">Libro diario — partida doble</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo Asiento</button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar asientos..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">No.</th>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Descripción</th>
                <th className="text-left px-3 py-2">Referencia</th>
                <th className="text-left px-3 py-2">Cuenta</th>
                <th className="text-right px-3 py-2">Debe</th>
                <th className="text-right px-3 py-2">Haber</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin asientos contables</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-3 py-2.5 font-mono text-xs">{a.numero || '—'}</td>
                  <td className="px-3 py-2.5">{a.fecha}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{a.descripcion}</td>
                  <td className="px-3 py-2.5 text-gray-500">{a.referencia || '—'}</td>
                  <td className="px-3 py-2.5">{a.cuenta || a.cuenta_id || '—'}</td>
                  <td className="px-3 py-2.5 text-right text-green-600 font-medium">$ {Number(a.debe || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-red-600 font-medium">$ {Number(a.haber || 0).toLocaleString()}</td>
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
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Asiento</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value='general'>General</option>
                    <option value='venta'>Venta</option>
                    <option value='compra'>Compra</option>
                    <option value='gasto'>Gasto</option>
                    <option value='cierre_z'>Cierre Z</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input className="input-field" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input className="input-field" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Debe ($)</label>
                  <input type="number" className="input-field" value={form.debe} onChange={e => setForm({ ...form, debe: Number(e.target.value) })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Haber ($)</label>
                  <input type="number" className="input-field" value={form.haber} onChange={e => setForm({ ...form, haber: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><BookOpen className="w-4 h-4" /> Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
