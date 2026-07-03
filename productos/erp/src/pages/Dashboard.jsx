import { useState, useEffect } from 'react'
import { Package, Users, Truck, DollarSign, FileText, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const kpiData = [
  { label: 'Productos', value: '1,284', icon: Package, color: 'bg-blue-500' },
  { label: 'Clientes', value: '342', icon: Users, color: 'bg-green-500' },
  { label: 'Proveedores', value: '86', icon: Truck, color: 'bg-purple-500' },
  { label: 'Ventas Hoy', value: 'Q 24,580', icon: DollarSign, color: 'bg-emerald-500' },
  { label: 'Ventas Mes', value: 'Q 486,200', icon: TrendingUp, color: 'bg-brand' },
  { label: 'Facturas Pend.', value: '23', icon: FileText, color: 'bg-amber-500' },
  { label: 'Stock Bajo', value: '15', icon: AlertTriangle, color: 'bg-red-500' },
]

const ventasMes = [
  { dia: 'Lun', ventas: 18500 },
  { dia: 'Mar', ventas: 22300 },
  { dia: 'Mié', ventas: 19800 },
  { dia: 'Jue', ventas: 25600 },
  { dia: 'Vie', ventas: 31200 },
  { dia: 'Sáb', ventas: 18400 },
  { dia: 'Dom', ventas: 10200 },
]

const ultimasFacturas = [
  { id: 'FAC-001', cliente: 'Comercial del Sur', monto: 'Q 15,800', estado: 'Pagada', fecha: '26/06/2026' },
  { id: 'FAC-002', cliente: 'Distribuidora Norte', monto: 'Q 42,300', estado: 'Pendiente', fecha: '26/06/2026' },
  { id: 'FAC-003', cliente: 'Industrias Maya', monto: 'Q 8,950', estado: 'Pagada', fecha: '25/06/2026' },
  { id: 'FAC-004', cliente: 'Grupo Empresarial GT', monto: 'Q 31,200', estado: 'Vencida', fecha: '24/06/2026' },
  { id: 'FAC-005', cliente: 'Soluciones Integrales', monto: 'Q 6,700', estado: 'Pendiente', fecha: '24/06/2026' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema ERP</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${kpi.color} rounded-xl flex items-center justify-center`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas de la Semana</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#1E4FFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Facturas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2">Factura</th>
                  <th className="text-left px-3 py-2">Cliente</th>
                  <th className="text-right px-3 py-2">Monto</th>
                  <th className="text-center px-3 py-2">Estado</th>
                  <th className="text-right px-3 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimasFacturas.map((fac) => (
                  <tr key={fac.id} className="table-row">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{fac.id}</td>
                    <td className="px-3 py-2.5 text-gray-600">{fac.cliente}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{fac.monto}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        fac.estado === 'Pagada' ? 'bg-green-100 text-green-700' :
                        fac.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{fac.estado}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{fac.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
