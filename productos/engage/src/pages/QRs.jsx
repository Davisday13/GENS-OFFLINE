import { useState } from 'react';
import { QrCode, Plus, Trash2, Edit3, X, ExternalLink } from 'lucide-react';

const initialQRs = [
  { id: 1, name: 'Menú Principal', url: 'https://menu.example.com/carta', scans: 342, color: '#003153' },
  { id: 2, name: 'Promoción Verano', url: 'https://menu.example.com/verano', scans: 187, color: '#059669' },
  { id: 3, name: 'Carta Vinos', url: 'https://menu.example.com/vinos', scans: 98, color: '#7c3aed' },
];

function QRPreview({ url, color }) {
  const size = 120;
  const cellSize = size / 9;
  const pattern = [
    [1,1,1,1,1,0,0,1,0],
    [1,0,0,0,1,0,1,0,1],
    [1,0,1,1,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0],
    [1,1,1,1,1,0,0,0,1],
    [0,0,0,0,0,0,1,0,0],
    [1,0,0,1,0,1,0,0,1],
    [0,1,0,0,0,1,1,1,0],
    [1,0,1,0,1,0,0,1,1],
  ];

  return (
    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-200" style={{ width: size + 16, height: size + 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" rx="4" />
        {pattern.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize + 1}
                y={y * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={color}
                rx="1"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

export default function QRs() {
  const [qrs, setQRs] = useState(initialQRs);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', color: '#003153' });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', url: '', color: '#003153' });
    setShowModal(true);
  }

  function openEdit(qr) {
    setEditing(qr.id);
    setForm({ name: qr.name, url: qr.url, color: qr.color });
    setShowModal(true);
  }

  function handleSave() {
    if (editing) {
      setQRs((prev) =>
        prev.map((q) => (q.id === editing ? { ...q, ...form } : q))
      );
    } else {
      setQRs((prev) => [
        ...prev,
        { id: Date.now(), ...form, scans: 0 },
      ]);
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    setQRs((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de QRs</h1>
          <p className="text-gray-500 mt-1">Crea y administra tus códigos QR personalizados.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-md"
        >
          <Plus size={20} />
          Crear QR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {qrs.map((qr) => (
          <div
            key={qr.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: qr.color + '20' }}
                >
                  <QrCode size={22} style={{ color: qr.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{qr.name}</h3>
                  <p className="text-xs text-gray-400 truncate max-w-[160px]">{qr.url}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <QRPreview url={qr.url} color={qr.color} />
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-gray-500">Escaneos</span>
              <span className="font-bold text-navy text-lg">{qr.scans}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(qr)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Edit3 size={15} />
                Editar
              </button>
              <button
                onClick={() => window.open(qr.url, '_blank')}
                className="flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={15} />
              </button>
              <button
                onClick={() => handleDelete(qr.id)}
                className="flex items-center justify-center px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar QR' : 'Crear QR'}
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
                  placeholder="Ej: Menú Principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Destino</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">{form.color}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <QRPreview url={form.url} color={form.color} />
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-navy text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-md"
            >
              {editing ? 'Guardar Cambios' : 'Crear QR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
