import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, ChefHat } from 'lucide-react'
import { erpApi } from '../lib/erpApi'

export default function MenuEngineering() {
  const [platos, setPlatos] = useState([])

  useEffect(() => {
    erpApi.recetas.menuEngineering().then(setPlatos).catch(() => {})
  }, [])

  const avgMargen = platos.length > 0 ? platos.reduce((s, p) => s + Number(p.margen_porcentaje || 0), 0) / platos.length : 0
  const totalCosto = platos.reduce((s, p) => s + Number(p.costo_total || 0), 0)
  const totalVenta = platos.reduce((s, p) => s + Number(p.precio_sugerido || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu Engineering</h1>
        <p className="text-gray-500 text-sm mt-1">Análisis de rentabilidad del menú</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center"><ChefHat className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Platos</p><p className="text-xl font-bold text-gray-900">{platos.length}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Precio Promedio</p><p className="text-xl font-bold text-gray-900">$ {platos.length > 0 ? Number(totalVenta / platos.length).toFixed(2) : '0.00'}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><PieChart className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Margen Promedio</p><p className="text-xl font-bold text-gray-900">{avgMargen.toFixed(1)}%</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div><p className="text-sm text-gray-500">Margen Total</p><p className="text-xl font-bold text-gray-900">$ {Number(totalVenta - totalCosto).toFixed(2)}</p></div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad por Plato</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Plato</th>
                <th className="text-left px-3 py-2">Categoría</th>
                <th className="text-right px-3 py-2">Costo Total</th>
                <th className="text-right px-3 py-2">Precio Sugerido</th>
                <th className="text-right px-3 py-2">Margen Unitario</th>
                <th className="text-right px-3 py-2">Margen %</th>
                <th className="text-center px-3 py-2">Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {platos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Crea recetas con precio sugerido para ver el análisis</td></tr>
              ) : platos.map(p => {
                const margen = Number(p.margen_porcentaje || 0)
                const color = margen >= 40 ? 'text-green-600' : margen >= 20 ? 'text-amber-600' : 'text-red-600'
                const bgColor = margen >= 40 ? 'bg-green-50' : margen >= 20 ? 'bg-amber-50' : 'bg-red-50'
                return (
                  <tr key={p.id} className={`table-row ${bgColor}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-3 py-2.5 text-gray-500">{p.categoria_nombre || '—'}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(p.costo_total || 0).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right">$ {Number(p.precio_sugerido || 0).toFixed(2)}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${color}`}>$ {Number(p.margen_unitario || 0).toFixed(2)}</td>
                    <td className={`px-3 py-2.5 text-right font-bold ${color}`}>
                      <span className="flex items-center justify-end gap-1">
                        {margen >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {margen.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{p.rendimiento} {p.unidad_rendimiento || 'porción'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
