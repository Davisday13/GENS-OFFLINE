import { useState, useEffect } from 'react'
import { Search, DollarSign, Receipt, TrendingUp, AlertCircle } from 'lucide-react'
import { erpApi } from '../lib/erpApi'

export default function CierreZ() {
  const [cierres, setCierres] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('pos')

  useEffect(() => {
    erpApi.cierresZ.listar().then(setCierres).catch(() => {})
  }, [])

  const filtered = cierres.filter(c =>
    (c.fecha || '').includes(search) || (c.tipo || '').toLowerCase().includes(search.toLowerCase())
  )

  const getTotal = (campo) => filtered.reduce((s, c) => s + Number(c[campo] || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cierres Z / X</h1>
          <p className="text-gray-500 text-sm mt-1">Cierres de caja del POS y contabilidad</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('pos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'pos' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Cierres POS
        </button>
        <button onClick={() => setTab('cont')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cont' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Contabilidad
        </button>
      </div>
      {tab === 'pos' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center"><Receipt className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-gray-500">Total Cierres</p><p className="text-xl font-bold text-gray-900">{filtered.length}</p></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-gray-500">Ventas Totales</p><p className="text-xl font-bold text-gray-900">$ {getTotal('total_ventas').toLocaleString()}</p></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-gray-500">ITBMS Total</p><p className="text-xl font-bold text-gray-900">$ {getTotal('total_itbms').toLocaleString()}</p></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-gray-500">Diferencia Total</p><p className="text-xl font-bold text-gray-900">$ {getTotal('diferencia').toLocaleString()}</p></div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar por fecha..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-3 py-2">Fecha</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-right px-3 py-2">Total Ventas</th>
                    <th className="text-right px-3 py-2">ITBMS</th>
                    <th className="text-right px-3 py-2">Diferencia</th>
                    <th className="text-left px-3 py-2">Formas de Pago</th>
                    <th className="text-center px-3 py-2">Conteo Billetes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin cierres registrados</td></tr>
                  ) : filtered.map(c => {
                    let formas = {}
                    let billetes = {}
                    try { formas = JSON.parse(c.formas_pago || '{}') } catch {}
                    try { billetes = JSON.parse(c.conteo_billetes || '{}') } catch {}
                    return (
                      <tr key={c.id} className="table-row">
                        <td className="px-3 py-2.5 font-medium text-gray-900">{c.fecha}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.tipo === 'Z' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{c.tipo}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">$ {Number(c.total_ventas || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right">$ {Number(c.total_itbms || 0).toLocaleString()}</td>
                        <td className={`px-3 py-2.5 text-right font-medium ${Number(c.diferencia || 0) !== 0 ? 'text-red-600' : 'text-gray-900'}`}>$ {Number(c.diferencia || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">{Object.entries(formas).map(([k, v]) => `${k}: $${v}`).join(', ') || '—'}</td>
                        <td className="px-3 py-2.5 text-center text-xs text-gray-500">{Object.keys(billetes).length > 0 ? `${Object.keys(billetes).length} denominaciones` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {tab === 'cont' && (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <Receipt className="w-16 h-16 mb-4" />
          <p className="text-lg">Los cierres Z de contabilidad se generan automáticamente desde el POS</p>
          <p className="text-sm mt-2">Revisa la sección de Contabilidad (puerto 3000) para verlos en detalle</p>
        </div>
      )}
    </div>
  )
}
