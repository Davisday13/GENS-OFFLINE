import { useState, useEffect } from 'react'
import { Clock, CheckCircle, ChefHat, Coffee } from 'lucide-react'

const BASE = '/api'

export default function Cocina() {
  const [pedidos, setPedidos] = useState([])
  const [completados, setCompletados] = useState([])

  useEffect(() => {
    fetch(`${BASE}/pos/pedidos?estado=abierto`).then(r => r.json()).then(data => {
      const pendientes = data.filter(p => p.estado !== 'completado')
      setPedidos(pendientes)
    }).catch(() => {})
    const interval = setInterval(() => {
      fetch(`${BASE}/pos/pedidos?estado=abierto`).then(r => r.json()).then(data => {
        setPedidos(data.filter(p => p.estado !== 'completado'))
      }).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const marcarListo = async (pedidoId) => {
    setPedidos(pedidos.filter(p => p.id !== pedidoId))
    setCompletados([...completados, pedidoId])
    setTimeout(() => setCompletados(completados.filter(id => id !== pedidoId)), 5000)
  }

  const parseItems = (items) => {
    if (!items) return []
    if (Array.isArray(items)) return items
    try { return JSON.parse(items) } catch { return [] }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cocina — KDS</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de display para cocina</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-brand" />
          <span className="text-gray-500">Actualización automática cada 10s</span>
        </div>
      </div>
      {pedidos.length === 0 && completados.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <ChefHat className="w-20 h-20 mb-4" />
          <p className="text-xl">Sin pedidos pendientes</p>
          <p className="text-sm mt-2">Los pedidos del POS aparecerán aquí automáticamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.map(p => {
            const items = parseItems(p.items)
            return (
              <div key={p.id} className="card border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">#{p.id?.slice(0, 8)}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      <Coffee className="w-3 h-3 inline mr-1" />{p.mesa_id ? `Mesa ${String(p.mesa_id).slice(0, 8)}` : 'Mostrador'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{p.created_at?.slice(11, 19) || '—'}</span>
                </div>
                <div className="space-y-2 mb-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre || item.producto || 'Item'}</p>
                        <p className="text-xs text-gray-400">Cant: {item.cantidad || 1}</p>
                      </div>
                      {item.notas && <p className="text-xs text-gray-400 italic">{item.notas}</p>}
                    </div>
                  ))}
                </div>
                <button onClick={() => marcarListo(p.id)}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Marcar Listo
                </button>
              </div>
            )
          })}
          {completados.map(id => (
            <div key={id} className="card border-l-4 border-l-green-500 bg-green-50 opacity-60">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">#{id.slice(0, 8)}</p>
                  <p className="text-xs text-green-600">Completado</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
