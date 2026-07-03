import { useState, useEffect } from 'react'
import { Package, Users, Truck, DollarSign, FileText, AlertTriangle, TrendingUp, ShoppingCart, Coffee, ChefHat } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BASE = '/api'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/pos/pedidos`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/pos/mesas`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/pos/productos`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/inventario/alertas-stock`).then(r => r.json()).catch(() => []),
    ]).then(([pedidos, mesas, menu, alertas]) => {
      const hoy = new Date().toISOString().slice(0, 10)
      const ventasHoy = pedidos.filter(p => p.estado === 'cerrado' && String(p.created_at || '').slice(0, 10) === hoy)
        .reduce((s, p) => s + Number(p.total || 0), 0)
      const pedidosActivos = pedidos.filter(p => p.estado !== 'cerrado').length
      const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length
      const stockBajo = Array.isArray(alertas) ? alertas.length : 0
      setStats({ ventasHoy, pedidosActivos, mesasOcupadas, stockBajo, menuItems: Array.isArray(menu) ? menu.length : 0, clientes: pedidos.filter(p => p.cliente).length })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const ultimasFacturas = [
    { id: 'FAC-001', cliente: 'Comercial del Sur', monto: '$ 1,250', estado: 'Pagada', fecha: '03/07/2026' },
    { id: 'FAC-002', cliente: 'Restaurante El Fogón', monto: '$ 3,420', estado: 'Pendiente', fecha: '03/07/2026' },
    { id: 'FAC-003', cliente: 'Cliente Mostrador', monto: '$ 185', estado: 'Pagada', fecha: '02/07/2026' },
  ]

  const kpiData = [
    { label: 'Menú', value: loading ? '...' : String(stats.menuItems || 0), icon: ChefHat, color: 'bg-purple-500' },
    { label: 'Clientes', value: loading ? '...' : String(stats.clientes || 0), icon: Users, color: 'bg-green-500' },
    { label: 'Proveedores', value: '3', icon: Truck, color: 'bg-purple-500' },
    { label: 'Ventas Hoy', value: loading ? '...' : `$ ${(stats.ventasHoy || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Mesas Ocupadas', value: loading ? '...' : String(stats.mesasOcupadas || 0), icon: Coffee, color: 'bg-brand' },
    { label: 'Pedidos Activos', value: loading ? '...' : String(stats.pedidosActivos || 0), icon: ShoppingCart, color: 'bg-amber-500' },
    { label: 'Stock Bajo', value: loading ? '...' : String(stats.stockBajo || 0), icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard - ERP Restaurante</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
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
              <BarChart data={[
                { dia: 'Lun', ventas: 1850 }, { dia: 'Mar', ventas: 2230 },
                { dia: 'Mié', ventas: 1980 }, { dia: 'Jue', ventas: 2560 },
                { dia: 'Vie', ventas: 3120 }, { dia: 'Sáb', ventas: 2840 },
                { dia: 'Dom', ventas: 1020 },
              ]}>
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
