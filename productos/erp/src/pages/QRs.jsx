import { useState, useEffect } from 'react'
import { Plus, Search, X, QrCode, ExternalLink, Eye } from 'lucide-react'

const BASE = '/api'

export default function QRs() {
  const [qrs, setQrs] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', url_destino: '', color: '#003153' })

  useEffect(() => {
    fetch(`${BASE}/engage/qrs`).then(r => r.json()).then(setQrs).catch(() => {})
  }, [])

  const filtered = qrs.filter($ => q.nombre?.toLowerCase().includes(search.toLowerCase()))
  const totalScans = qrs.reduce((s, q) => s + Number(q.escaneos || 0), 0)

  const handleCreate = async () => {
    const res = await fetch(`${BASE}/engage/qrs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setQrs([{ ...form, id: data.id, escaneos: 0, activo: 1 }, ...qrs])
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Códigos QR</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de códigos QR para menú digital</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Nuevo QR</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center"><QrCode className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total QRs</p><p className="text-xl font-bold text-gray-900">{qrs.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><Eye className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Escaneos Totales</p><p className="text-xl font-bold text-gray-900">{totalScans.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><ExternalLink className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Activos</p><p className="text-xl font-bold text-gray-900">{qrs.filter($ => q.activo).length}</p></div>
        </div>
      </div>
      <div className="card">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar QRs..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">Sin QRs registrados</div>
          ) : filtered.map($ => (
            <div key={q.id} className="card border-t-4" style={{ borderTopColor: q.color || '#003153' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{q.nombre}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${q.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{q.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">{q.url_destino}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand font-medium">{q.escaneos || 0} escaneos</span>
                <a href={q.url_destino} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo QR</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">URL Destino</label><input className="input-field" value={form.url_destino} onChange={e => setForm({ ...form, url_destino: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><input type="color" className="input-field h-10" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><QrCode className="w-4 h-4" /> Crear QR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
