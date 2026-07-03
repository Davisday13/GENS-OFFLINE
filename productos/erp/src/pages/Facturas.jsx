import { useState, useEffect } from 'react'
import { Search, FileText, Download, ExternalLink, Plus, X, DollarSign, Receipt } from 'lucide-react'

const BASE = '/api'

export default function Facturas() {
  const [facturasPos, setFacturasPos] = useState([])
  const [facturasErp, setFacturasErp] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('fiscales')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ cliente: '', ruc: '', fecha: new Date().toISOString().split('T')[0], total: 0, itbms: 0 })

  useEffect(() => {
    fetch(`${BASE}/pos/facturas`)
      .then(r => r.json())
      .then(data => {
        const conCufe = data.map(f => ({
          ...f,
          cufe: f.cufe || `CUFE-${f.id?.slice(0, 8).toUpperCase() || 'XXXX'}`,
        }))
        setFacturasPos(conCufe)
      })
      .catch(() => {})
    fetch(`${BASE}/ventas/facturas`)
      .then(r => r.json())
      .then(setFacturasErp)
      .catch(() => {})
  }, [])

  const fiscalesFiltradas = facturasPos.filter(f =>
    (f.numero || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.cliente || '').toLowerCase().includes(search.toLowerCase())
  )

  const erpFiltradas = facturasErp.filter(f =>
    (f.numero || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.cliente_id || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateFiscal = async () => {
    const res = await fetch(`${BASE}/pos/facturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setFacturasPos([{ ...form, id: data.id, numero: data.numero, cufe: data.cufe, created_at: new Date().toISOString() }, ...facturasPos])
      setModalOpen(false)
      setForm({ cliente: '', ruc: '', fecha: new Date().toISOString().split('T')[0], total: 0, itbms: 0 })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación Fiscal</h1>
          <p className="text-gray-500 text-sm mt-1">Facturas electrónicas con CUFE — DGI Panamá</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Nueva Factura Fiscal
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('fiscales')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'fiscales' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Receipt className="w-4 h-4 inline mr-1" /> Facturas Fiscales
        </button>
        <button onClick={() => setTab('erp')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'erp' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <FileText className="w-4 h-4 inline mr-1" /> ERP
        </button>
      </div>
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar facturas..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {tab === 'fiscales' && (
        <div className="space-y-3">
          {fiscalesFiltradas.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <Receipt className="w-16 h-16 mb-4" />
              <p className="text-lg">Sin facturas fiscales</p>
              <p className="text-sm mt-1">Las facturas del POS aparecerán aquí automáticamente</p>
            </div>
          ) : fiscalesFiltradas.map(f => (
            <div key={f.id} className="card">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">{f.numero}</span>
                    <span className="text-sm text-gray-400">{f.fecha || f.created_at?.slice(0, 10)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${f.estado === 'emitida' || f.estado === 'pagada' ? 'bg-green-100 text-green-700' : f.estado === 'anulada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {f.estado || 'emitida'}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">Cliente:</span> {f.cliente || 'Consumidor Final'}
                    {f.ruc && <span className="ml-4 text-gray-400">RUC: {f.ruc}</span>}
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-green-600">$ {Number(f.total || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-400">ITBMS: $ {Number(f.itbms || 0).toLocaleString()}</p>
                  </div>
                  {f.cufe && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 overflow-hidden">
                      <span className="shrink-0 font-semibold text-gray-500">CUFE:</span>
                      <span className="truncate">{f.cufe}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-3" title="Descargar PDF">
                    <Download size={16} /> PDF
                  </button>
                  <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-3" title="Ver XML">
                    <ExternalLink size={16} /> XML
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'erp' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2">No.</th>
                  <th className="text-left px-3 py-2">Cliente</th>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-right px-3 py-2">Subtotal</th>
                  <th className="text-right px-3 py-2">ITBMS</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-center px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {erpFiltradas.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin facturas ERP</td></tr>
                ) : erpFiltradas.map(f => (
                  <tr key={f.id} className="table-row">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{f.numero}</td>
                    <td className="px-3 py-2.5 text-gray-600">{f.cliente_id || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-500">{f.fecha}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(f.subtotal || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(f.itbms || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-medium">$ {Number(f.total || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${f.estado === 'pagada' ? 'bg-green-100 text-green-700' : f.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : f.estado === 'anulada' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        {f.estado || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Factura Fiscal</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input className="input-field" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                <input className="input-field" value={form.ruc} onChange={e => setForm({ ...form, ruc: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input type="number" className="input-field" value={form.total} onChange={e => setForm({ ...form, total: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ITBMS</label>
                  <input type="number" className="input-field" value={form.itbms} onChange={e => setForm({ ...form, itbms: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreateFiscal}>
                <Receipt className="w-4 h-4" /> Emitir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
