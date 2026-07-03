import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Package, Users } from 'lucide-react'

const BASE = '/api'

export default function Reportes() {
  const stats = [
    { label: 'Ventas por Período', desc: 'Resumen de ventas diarias, semanales y mensuales', icon: TrendingUp, color: 'bg-brand' },
    { label: 'Ventas por Producto', desc: 'Análisis de productos más vendidos', icon: Package, color: 'bg-green-500' },
    { label: 'Ventas por Mesero', desc: 'Rendimiento de ventas por empleado', icon: Users, color: 'bg-purple-500' },
    { label: 'Cierres de Caja', desc: 'Historial completo de cierres X y Z', icon: DollarSign, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm mt-1">Centro de reportes y análisis</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map(s => (
          <button key={s.label} className="card flex items-start gap-4 hover:shadow-lg transition-shadow text-left">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center shrink-0 mt-1`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{s.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Ventas Totales', value: '$ 0.00', icon: DollarSign, color: 'text-green-600' },
            { label: 'Productos Vendidos', value: '0', icon: Package, color: 'text-blue-600' },
            { label: 'Ticket Promedio', value: '$ 0.00', icon: BarChart3, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
