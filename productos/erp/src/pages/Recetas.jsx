import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, X, DollarSign, Package, ChefHat, TrendingUp, Scale, ClipboardList } from 'lucide-react'
import { erpApi } from '../lib/erpApi'

const emptyReceta = { nombre: '', descripcion: '', categoria_id: '', rendimiento: 1, unidad_rendimiento: 'porción', instrucciones: '', costo_mano_obra: 0, precio_sugerido: 0 }

export default function Recetas() {
  const [recetas, setRecetas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyReceta)
  const [selected, setSelected] = useState(null)
  const [costos, setCostos] = useState(null)
  const [ingModal, setIngModal] = useState(false)
  const [prodModal, setProdModal] = useState(false)
  const [prodCantidad, setProdCantidad] = useState(1)
  const [productos, setProductos] = useState([])

  useEffect(() => {
    erpApi.recetas.listar().then(setRecetas).catch(() => {})
    erpApi.recetas.categorias.listar().then(setCategorias).catch(() => {})
    erpApi.productos.listar().then(setProductos).catch(() => {})
  }, [])

  const filtered = recetas.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditando(null)
    setForm(emptyReceta)
    setModalOpen(true)
  }

  const openEdit = (r) => {
    setEditando(r)
    setForm({ ...r })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (editando) {
      await erpApi.recetas.actualizar(editando.id, form)
    } else {
      await erpApi.recetas.crear(form)
    }
    setModalOpen(false)
    const updated = await erpApi.recetas.listar()
    setRecetas(updated)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta receta?')) {
      await erpApi.recetas.eliminar(id)
      setRecetas(recetas.filter(r => r.id !== id))
    }
  }

  const selectReceta = async (r) => {
    setSelected(r)
    const data = await erpApi.recetas.obtener(r.id).catch(() => r)
    setSelected(data)
    const c = await erpApi.recetas.costo(r.id).catch(() => null)
    setCostos(c)
  }

  const handleProducir = async () => {
    if (!selected) return
    await erpApi.recetas.producir(selected.id, { cantidad: prodCantidad })
    setProdModal(false)
    setProdCantidad(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recetas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de recetas, ingredientes y costos</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nueva Receta
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar recetas..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filtered.map(r => (
              <button key={r.id} onClick={() => selectReceta(r)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selected?.id === r.id ? 'bg-brand text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                <div className="font-medium">{r.nombre}</div>
                <div className={`text-xs ${selected?.id === r.id ? 'text-white/70' : 'text-gray-400'}`}>
                  Costo: $ {Number(r.costo_total || 0).toFixed(2)} | {r.total_ingredientes || 0} ingredientes
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <ChefHat className="w-16 h-16 mb-4" />
              <p className="text-lg">Selecciona una receta para ver detalles</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.nombre}</h2>
                    <p className="text-sm text-gray-500">{selected.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm" onClick={() => openEdit(selected)}><Edit2 className="w-4 h-4" /> Editar</button>
                    <button className="btn-secondary text-sm text-green-600" onClick={() => setProdModal(true)}><TrendingUp className="w-4 h-4" /> Producir</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Rendimiento</p>
                    <p className="text-lg font-bold text-gray-900">{selected.rendimiento} {selected.unidad_rendimiento}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Costo Total</p>
                    <p className="text-lg font-bold text-gray-900">$ {Number(selected.costo_total || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Costo Unitario</p>
                    <p className="text-lg font-bold text-gray-900">$ {costos ? Number(costos.costo_unitario).toFixed(2) : '0.00'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Precio Sugerido</p>
                    <p className="text-lg font-bold text-green-600">$ {Number(selected.precio_sugerido || 0).toFixed(2)}</p>
                  </div>
                </div>
                {costos && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <span className="font-medium text-blue-800">Margen bruto: {costos.margen_bruto}%</span>
                    <span className="text-blue-600 ml-4">Margen unitario: $ {Number(costos.precio_sugerido - costos.costo_unitario).toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Package className="w-4 h-4" /> Ingredientes</h3>
                  <button className="text-sm text-brand font-medium hover:underline" onClick={() => setIngModal(true)}>+ Agregar</button>
                </div>
                {(!selected.ingredientes || selected.ingredientes.length === 0) ? (
                  <p className="text-gray-400 text-sm py-4">Sin ingredientes. Agrega los insumos de esta receta.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="table-header">
                          <th className="text-left px-3 py-2">Producto</th>
                          <th className="text-right px-3 py-2">Cantidad</th>
                          <th className="text-right px-3 py-2">Merma %</th>
                          <th className="text-right px-3 py-2">Subtotal</th>
                          <th className="text-center px-3 py-2">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.ingredientes.map(ing => (
                          <tr key={ing.id} className="table-row">
                            <td className="px-3 py-2.5 font-medium text-gray-900">{ing.producto_nombre || '—'}</td>
                            <td className="px-3 py-2.5 text-right">{ing.cantidad} {ing.unidad || ''}</td>
                            <td className="px-3 py-2.5 text-right">{ing.merma_porcentaje || 0}%</td>
                            <td className="px-3 py-2.5 text-right font-medium">$ {Number(ing.subtotal || 0).toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-center">
                              <button onClick={async () => {
                                await fetch(`/api/recetas/${selected.id}/ingredientes/${ing.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
                                selectReceta(selected)
                              }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {selected.instrucciones && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Instrucciones</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.instrucciones}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? 'Editar' : 'Nueva'} Receta</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select className="input-field" value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rendimiento</label>
                  <input type="number" className="input-field" value={form.rendimiento} onChange={e => setForm({ ...form, rendimiento: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input-field" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Mano de Obra</label>
                  <input type="number" className="input-field" value={form.costo_mano_obra} onChange={e => setForm({ ...form, costo_mano_obra: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Sugerido</label>
                  <input type="number" className="input-field" value={form.precio_sugerido} onChange={e => setForm({ ...form, precio_sugerido: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones</label>
                <textarea className="input-field" rows={3} value={form.instrucciones} onChange={e => setForm({ ...form, instrucciones: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      {prodModal && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProdModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Producir: {selected.nombre}</h2>
              <button onClick={() => setProdModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Esto consumirá los ingredientes del inventario y registrará la producción.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a producir</label>
              <input type="number" className="input-field" value={prodCantidad} min={1} onChange={e => setProdCantidad(Number(e.target.value))} />
            </div>
            {costos && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm mb-4">
                <p>Costo unitario: <strong>$ {Number(costos.costo_unitario).toFixed(2)}</strong></p>
                <p>Costo total: <strong>$ {Number(costos.costo_unitario * prodCantidad).toFixed(2)}</strong></p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setProdModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleProducir}><TrendingUp className="w-4 h-4" /> Producir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
