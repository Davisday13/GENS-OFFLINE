import { useNavigate } from 'react-router-dom';
import { QrCode, Scan, UtensilsCrossed, Plus } from 'lucide-react';

const stats = [
  { label: 'QRs Creados', value: 24, icon: QrCode, color: 'from-blue-500 to-blue-600' },
  { label: 'Escaneos Totales', value: '3,482', icon: Scan, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Items de Menú', value: 48, icon: UtensilsCrossed, color: 'from-amber-500 to-amber-600' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido a Engage. Gestiona tus QRs y menú digital.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-navy to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">¿Listo para crear un QR?</h2>
            <p className="text-white/70 mt-2 max-w-md">
              Genera códigos QR personalizados para tu negocio y empieza a medir su impacto.
            </p>
          </div>
          <button
            onClick={() => navigate('/qrs')}
            className="flex items-center gap-2 bg-white text-navy px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Crear QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Escaneos Recientes</h3>
          <div className="space-y-3">
            {[
              { url: 'menu.example.com/carta', scans: 12, time: 'Hace 5 min' },
              { url: 'menu.example.com/promos', scans: 8, time: 'Hace 15 min' },
              { url: 'tienda.example.com/verano', scans: 5, time: 'Hace 1 hora' },
            ].map((item) => (
              <div key={item.url} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.url}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <span className="text-sm font-bold text-navy">{item.scans}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">QRs Más Populares</h3>
          <div className="space-y-4">
            {[
              { name: 'Menú Principal', pct: 85 },
              { name: 'Promoción Verano', pct: 62 },
              { name: 'Carta Vinos', pct: 41 },
            ].map(({ name, pct }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{name}</span>
                  <span className="font-semibold text-navy">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-navy to-blue-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
