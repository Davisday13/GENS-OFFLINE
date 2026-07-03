import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Package, Tag, DollarSign, Hash } from 'lucide-react'

const initialProductos = [
  { id: 1, codigo: 'PRO-001', nombre: 'Laptop Gamer X1', categoria: 'Electrónicos', precio: 12500, stock: 45, unidad: 'UNIDAD' },
  { id: 2, codigo: 'PRO-002', nombre: 'Monitor 27" 4K', categoria: 'Electrónicos', precio: 6800, stock: 23, unidad: 'UNIDAD' },
  { id: 3, codigo: 'PRO-003', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', precio: 850, stock: 120, unidad: 'UNIDAD' },
  { id: 4, codigo: 'PRO-004', nombre: 'Mouse Inalámbrico', categoria: 'Accesorios', precio: 450, stock: 200, unidad: 'UNIDAD' },
  { id: 5, codigo: 'PRO-005', nombre: 'Webcam HD 1080p', categoria: 'Electrónicos', precio: 1200, stock: 67, unidad: 'UNIDAD' },
  { id: 6, codigo: 'PRO-006', nombre: 'Audífonos Bluetooth', categoria: 'Accesorios', precio: 650, stock: 89, unidad: 'UNIDAD' },
  { id: 7, codigo: 'PRO-007', nombre: 'Hub USB-C 7 puertos', categoria: 'Accesorios', precio: 380, stock: 150, unidad: 'UNIDAD' },
  { id: 8, codigo: 'PRO-008', nombre: 'Disco SSD 1TB', categoria: 'Almacenamiento', precio: 950, stock: 34, unidad: 'UNIDAD' },
]

const emptyProducto = { codigo: '', nombre: '', categoria: '', precio: 0, stock: 0, unidad: 'UNIDAD' }

export default function Productos() {
  const [productos, setProductos] = useState(initialProductos)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyProducto)

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditando(null)
    setForm({ ...emptyProducto, codigo: `PRO-${String(productos.length + 1).padStart(3, '0')}` })
    setModalOpen(true)
  }

  const openEdit = (prod) => {
    setEditando(prod)
    setForm({ ...prod })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editando) {
      setProductos(productos.map(p => p.id === editando.id ? { ...form, id: editando.id } : p))
    } else {
      setProductos([...productos, { ...form, id: Date.now() }])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de catálogo de productos</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar productos..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Categoría</th>
                <th className="text-right px-3 py-2">Precio</th>
                <th className="text-right px-3 py-2">Stock</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prod => (
                <tr key={prod.id} className="table-row">
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{prod.codigo}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{prod.nombre}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand">{prod.categoria}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium">Q {prod.precio.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-medium ${prod.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>{prod.stock}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand rounded-lg hover:bg-brand-50" onClick={() => openEdit(prod)}><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDelete(prod.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? 'Editar' : 'Nuevo'} Producto</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select className="input-field" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                    <option>UNIDAD</option>
                    <option>CAJA</option>
                    <option>LIBRA</option>
                    <option>LITRO</option>
                    <option>METRO</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" className="input-field pl-9" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                  <input type="number" className="input-field" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
