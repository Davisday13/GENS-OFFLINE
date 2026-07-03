import { useState } from 'react';
import { Plus, Edit3, Trash2, X, UtensilsCrossed } from 'lucide-react';

const categories = ['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'];

const initialItems = [
  { id: 1, name: 'Bruschetta Clásica', description: 'Pan tostado con tomate, albahaca y aceite de oliva', price: 8.50, category: 'Entradas' },
  { id: 2, name: 'Carpaccio de Res', description: 'Finas láminas de res con parmesano y rúcula', price: 12.00, category: 'Entradas' },
  { id: 3, name: 'Risotto al Funghi', description: 'Arroz cremoso con setas portobello y parmesano', price: 16.00, category: 'Platos Fuertes' },
  { id: 4, name: 'Salmón a la Plancha', description: 'Salmón fresco con verduras asadas y puré de camote', price: 19.50, category: 'Platos Fuertes' },
  { id: 5, name: 'Tiramisú', description: 'Postre italiano clásico con mascarpone y café', price: 7.50, category: 'Postres' },
  { id: 6, name: 'Limonata Natural', description: 'Limonada fresca con hierbabuena', price: 4.00, category: 'Bebidas' },
];

export default function MenuDigital() {
  const [items, setItems] = useState(initialItems);
  const [activeCategory, setActiveCategory] = useState('Entradas');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Entradas' });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category: activeCategory });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({ name: item.name, description: item.description, price: String(item.price), category: item.category });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name || !form.price) return;
    const newItem = { ...form, price: parseFloat(form.price), id: editing || Date.now() };
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing ? newItem : i)));
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = items.filter((i) => i.category === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menú Digital</h1>
          <p className="text-gray-500 mt-1">Gestiona los items de tu menú digital.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-md"
        >
          <Plus size={20} />
          Agregar Item
        </button>
      </div>

      {/* Vista pública */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <UtensilsCrossed size={28} />
            <h2 className="text-2xl font-bold">Nuestro Menú</h2>
          </div>
          <p className="text-white/70 text-sm">Descubre nuestra selección de platillos</p>
        </div>

        <div className="flex gap-1 p-4 border-b border-gray-100 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-navy text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                </div>
                <span className="text-lg font-bold text-navy ml-4">${item.price.toFixed(2)}</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-navy hover:border-navy transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Item' : 'Agregar Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                  placeholder="Ej: Pizza Margherita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all resize-none"
                  placeholder="Descripción del platillo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-navy text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-md"
            >
              {editing ? 'Guardar Cambios' : 'Agregar al Menú'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
