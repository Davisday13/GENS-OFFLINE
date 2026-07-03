import { useState, useEffect } from 'react'
import { TrendingUp, Eye, QrCode, Calendar, BarChart3 } from 'lucide-react'

export default function Analytics() {
  const stats = [
    { label: 'Escaneos Totales', value: '0', icon: Eye, color: 'bg-brand' },
    { label: 'QRs Activos', value: '0', icon: QrCode, color: 'bg-green-500' },
    { label: 'Promedio por QR', value: '0', icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Este Mes', value: '0', icon: Calendar, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Analíticas de escaneos QR y menú digital</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escaneos Recientes</h2>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <TrendingUp className="w-16 h-16 mb-4" />
          <p className="text-lg">Conecta tu menú digital para ver analytics</p>
          <p className="text-sm mt-2">Los datos de escaneo aparecerán aquí automáticamente</p>
        </div>
      </div>
    </div>
  )
}
