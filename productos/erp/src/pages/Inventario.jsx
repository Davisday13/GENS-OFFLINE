import { useState } from 'react'
import { Search, Filter, Warehouse, Package, ArrowUpDown } from 'lucide-react'

const inventario = [
  { id: 1, producto: 'Laptop Gamer X1', codigo: 'PRO-001', bodega: 'Bodega Central', stock: 25, min: 10 },
  { id: 2, producto: 'Monitor 27" 4K', codigo: 'PRO-002', bodega: 'Bodega Central', stock: 23, min: 5 },
  { id: 3, producto: 'Teclado Mecánico RGB', codigo: 'PRO-003', bodega: 'Bodega Norte', stock: 50, min: 20 },
  { id: 4, producto: 'Mouse Inalámbrico', codigo: 'PRO-004', bodega: 'Bodega Central', stock: 80, min: 30 },
  { id: 5, producto: 'Webcam HD 1080p', codigo: 'PRO-005', bodega: 'Bodega Norte', stock: 67, min: 15 },
  { id: 6, producto: 'Teclado Mecánico RGB', codigo: 'PRO-003', bodega: 'Bodega Central', stock: 70, min: 20 },
  { id: 7, producto: 'Disco SSD 1TB', codigo: 'PRO-008', bodega: 'Bodega Central', stock: 34, min: 10 },
  { id: 8, producto: 'Mouse Inalámbrico', codigo: 'PRO-004', bodega: 'Bodega Norte', stock: 120, min: 30 },
]

const bodegas = ['Todas', 'Bodega Central', 'Bodega Norte']

export default function Inventario() {
  const [search, setSearch] = useState('')
  const [bodegaFilter, setBodegaFilter] = useState('Todas')

  const filtered = inventario.filter(item => {
    const matchSearch = item.producto.toLowerCase().includes(search.toLowerCase()) || item.codigo.toLowerCase().includes(search.toLowerCase())
    const matchBodega = bodegaFilter === 'Todas' || item.bodega === bodegaFilter
    return matchSearch && matchBodega
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-500 text-sm mt-1">Control de inventario por bodega</p>
      </div>
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar en inventario..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select className="input-field w-44" value={bodegaFilter} onChange={e => setBodegaFilter(e.target.value)}>
              {bodegas.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Producto</th>
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Bodega</th>
                <th className="text-right px-3 py-2">Stock Actual</th>
                <th className="text-right px-3 py-2">Stock Mínimo</th>
                <th className="text-center px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="table-row">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{item.producto}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{item.codigo}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Warehouse className="w-3.5 h-3.5" /> {item.bodega}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium">{item.stock}</td>
                  <td className="px-3 py-2.5 text-right text-gray-500">{item.min}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.stock <= item.min ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.stock <= item.min ? 'Stock Bajo' : 'Normal'}
                    </span>
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
