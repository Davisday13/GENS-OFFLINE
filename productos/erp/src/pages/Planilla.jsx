import { useState } from 'react'
import { Search, Calculator, DollarSign, User, CheckCircle, Clock } from 'lucide-react'

const initialPlanilla = [
  { id: 1, empleado: 'Juan Pérez', cargo: 'Vendedor', salarioBase: 8500, bonificacion: 500, descuentos: 1200, total: 7800, periodo: 'Junio 2026', estado: 'Pagada' },
  { id: 2, empleado: 'María García', cargo: 'Contadora', salarioBase: 12000, bonificacion: 800, descuentos: 1800, total: 11000, periodo: 'Junio 2026', estado: 'Pagada' },
  { id: 3, empleado: 'Carlos López', cargo: 'Bodeguero', salarioBase: 6000, bonificacion: 300, descuentos: 900, total: 5400, periodo: 'Junio 2026', estado: 'Pendiente' },
  { id: 4, empleado: 'Ana Martínez', cargo: 'Gerente de Ventas', salarioBase: 15000, bonificacion: 1000, descuentos: 2200, total: 13800, periodo: 'Junio 2026', estado: 'Pendiente' },
  { id: 5, empleado: 'Pedro Ramírez', cargo: 'Asistente Admin.', salarioBase: 5500, bonificacion: 300, descuentos: 800, total: 5000, periodo: 'Junio 2026', estado: 'Pendiente' },
]

export default function Planilla() {
  const [planilla, setPlanilla] = useState(initialPlanilla)
  const [search, setSearch] = useState('')

  const filtered = planilla.filter(p =>
    p.empleado.toLowerCase().includes(search.toLowerCase()) ||
    p.cargo.toLowerCase().includes(search.toLowerCase())
  )

  const totalPagar = filtered.reduce((sum, p) => sum + p.total, 0)

  const handlePagar = (id) => {
    setPlanilla(planilla.map(p => p.id === id ? { ...p, estado: 'Pagada' } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planilla</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de planilla y salarios</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total a pagar</p>
            <p className="text-lg font-bold text-gray-900">Q {totalPagar.toLocaleString()}</p>
          </div>
          <button className="btn-primary"><Calculator className="w-4 h-4" /> Calcular Todo</button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar empleados..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-44">
            <option>Todos los periodos</option>
            <option>Junio 2026</option>
            <option>Mayo 2026</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Empleado</th>
                <th className="text-left px-3 py-2">Cargo</th>
                <th className="text-right px-3 py-2">Salario Base</th>
                <th className="text-right px-3 py-2">Bonificación</th>
                <th className="text-right px-3 py-2">Descuentos</th>
                <th className="text-right px-3 py-2">Total</th>
                <th className="text-center px-3 py-2">Estado</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{p.empleado}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.cargo}</td>
                  <td className="px-3 py-2.5 text-right">Q {p.salarioBase.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-green-600">+ Q {p.bonificacion.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-red-600">- Q {p.descuentos.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-bold">Q {p.total.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === 'Pagada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.estado === 'Pagada' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.estado === 'Pendiente' && (
                      <button className="btn-primary text-xs py-1.5 px-3" onClick={() => handlePagar(p.id)}>
                        <DollarSign className="w-3.5 h-3.5" /> Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
