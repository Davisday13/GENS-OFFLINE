import { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Banknote, Receipt, TrendingUp, Printer, X } from 'lucide-react'

const BASE = '/api'

export default function Caja() {
  const [pedidos, setPedidos] = useState([])
  const [cierres, setCierres] = useState([])
  const [showCierre, setShowCierre] = useState(false)
  const [formCierre, setFormCierre] = useState({ efectivo: 0, tarjeta: 0, otros: 0 })

  useEffect(() => {
    fetch(`${BASE}/pos/pedidos`).then(r => r.json()).then(setPedidos).catch(() => {})
    fetch(`${BASE}/pos/cierres`).then(r => r.json()).then(setCierres).catch(() => {})
  }, [])

  const abiertos = pedidos.filter(p => p.estado === 'abierto')
  const ventasHoy = pedidos.filter(p => p.estado === 'cerrado').reduce((s, p) => s + Number(p.total || 0), 0)
  const totalCierres = cierres.reduce((s, c) => s + Number(c.total_ventas || 0), 0)

  const handleCierreZ = async () => {
    const total = formCierre.efectivo + formCierre.tarjeta + formCierre.otros
    const res = await fetch(`${BASE}/pos/cierres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha: new Date().toISOString().slice(0, 10),
        tipo: 'Z',
        total_ventas: ventasHoy || total,
        total_itbms: Math.round((ventasHoy || total) * 0.07 * 100) / 100,
        formas_pago: { efectivo: formCierre.efectivo, tarjeta: formCierre.tarjeta, otros: formCierre.otros },
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setCierres([{ id: data.id, fecha: new Date().toISOString().slice(0, 10), tipo: 'Z', total_ventas: ventasHoy || total, formas_pago: JSON.stringify(formCierre) }, ...cierres])
      setShowCierre(false)
      setFormCierre({ efectivo: 0, tarjeta: 0, otros: 0 })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de caja y cierres</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCierre(true)}>
          <Receipt className="w-4 h-4" /> Cerrar Z
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Ventas Hoy</p><p className="text-xl font-bold text-gray-900">$ {ventasHoy.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Pedidos Abiertos</p><p className="text-xl font-bold text-gray-900">{abiertos.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Cierres</p><p className="text-xl font-bold text-gray-900">$ {totalCierres.toLocaleString()}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"><Banknote className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Cierres Realizados</p><p className="text-xl font-bold text-gray-900">{cierres.length}</p></div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-gray-900">Formas de Pago — Hoy</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Efectivo', icon: Banknote, color: 'bg-green-500', total: cierres.reduce((s, c) => { try { return s + Number(JSON.parse(c.formas_pago || '{}').efectivo || 0) } catch { return s } }, 0) },
            { label: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500', total: cierres.reduce((s, c) => { try { return s + Number(JSON.parse(c.formas_pago || '{}').tarjeta || 0) } catch { return s } }, 0) },
            { label: 'Otros', icon: DollarSign, color: 'bg-purple-500', total: cierres.reduce((s, c) => { try { return s + Number(JSON.parse(c.formas_pago || '{}').otros || 0) } catch { return s } }, 0) },
          ].map(f => (
            <div key={f.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 ${f.color} rounded-lg flex items-center justify-center`}><f.icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-sm text-gray-500">{f.label}</p><p className="text-lg font-bold text-gray-900">$ {f.total.toLocaleString()}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Últimos Cierres</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-right px-3 py-2">Ventas</th>
                <th className="text-right px-3 py-2">Efectivo</th>
                <th className="text-right px-3 py-2">Tarjeta</th>
                <th className="text-right px-3 py-2">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {cierres.slice(0, 10).map(c => {
                let fp = {}
                try { fp = JSON.parse(c.formas_pago || '{}') } catch {}
                return (
                  <tr key={c.id} className="table-row">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{c.fecha}</td>
                    <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">{c.tipo}</span></td>
                    <td className="px-3 py-2.5 text-right">$ {Number(c.total_ventas || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(fp.efectivo || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(fp.tarjeta || 0).toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${Number(c.diferencia || 0) !== 0 ? 'text-red-600' : ''}`}>$ {Number(c.diferencia || 0).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showCierre && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCierre(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Cierre Z</h2>
              <button onClick={() => setShowCierre(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Ventas del día: <strong>$ {ventasHoy.toLocaleString()}</strong></p>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Efectivo</label>
                <input type="number" className="input-field" value={formCierre.efectivo} onChange={e => setFormCierre({ ...formCierre, efectivo: Number(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tarjeta</label>
                <input type="number" className="input-field" value={formCierre.tarjeta} onChange={e => setFormCierre({ ...formCierre, tarjeta: Number(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Otros</label>
                <input type="number" className="input-field" value={formCierre.otros} onChange={e => setFormCierre({ ...formCierre, otros: Number(e.target.value) })} /></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Total declarado</p>
                <p className="text-2xl font-bold text-gray-900">$ {(formCierre.efectivo + formCierre.tarjeta + formCierre.otros).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowCierre(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCierreZ}><Printer className="w-4 h-4" /> Realizar Cierre Z</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
