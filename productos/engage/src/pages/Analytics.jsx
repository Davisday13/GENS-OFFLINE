import { BarChart3, TrendingUp, Scan } from 'lucide-react';

const qrScans = [
  { name: 'Menú Principal', scans: 342, color: '#003153' },
  { name: 'Promoción Verano', scans: 187, color: '#059669' },
  { name: 'Carta Vinos', scans: 98, color: '#7c3aed' },
  { name: 'Evento Gala', scans: 64, color: '#d97706' },
  { name: 'Happy Hour', scans: 45, color: '#dc2626' },
];

const recentScans = [
  { qr: 'Menú Principal', device: 'iPhone 16', location: 'Mesa 5', time: 'Hace 2 min' },
  { qr: 'Promoción Verano', device: 'Samsung S25', location: 'Terraza', time: 'Hace 8 min' },
  { qr: 'Carta Vinos', device: 'Pixel 10', location: 'Barra', time: 'Hace 15 min' },
  { qr: 'Menú Principal', device: 'iPhone 15', location: 'Mesa 12', time: 'Hace 22 min' },
  { qr: 'Happy Hour', device: 'Xiaomi 15', location: 'Jardín', time: 'Hace 31 min' },
  { qr: 'Evento Gala', device: 'Huawei P70', location: 'Salón VIP', time: 'Hace 45 min' },
];

const maxScans = Math.max(...qrScans.map((q) => q.scans));

export default function Analytics() {
  const totalScans = qrScans.reduce((a, b) => a + b.scans, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Mide el rendimiento de tus QRs y menú digital.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Scan size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Escaneos</p>
              <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp size={16} />
            <span>+12.5% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">QRs Activos</p>
              <p className="text-2xl font-bold text-gray-900">{qrScans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Promedio / QR</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(totalScans / qrScans.length)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-6">Escaneos por QR</h3>
          <div className="space-y-5">
            {qrScans.map((qr) => (
              <div key={qr.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{qr.name}</span>
                  <span className="font-bold" style={{ color: qr.color }}>{qr.scans}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(qr.scans / maxScans) * 100}%`,
                      backgroundColor: qr.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Escaneos Recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">QR</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Dispositivo</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Ubicación</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-medium text-gray-900">{s.qr}</td>
                    <td className="py-3 px-2 text-gray-600">{s.device}</td>
                    <td className="py-3 px-2 text-gray-600">{s.location}</td>
                    <td className="py-3 px-2 text-right text-gray-400">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-navy to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-4">Resumen Semanal</h3>
        <div className="grid grid-cols-7 gap-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => {
            const h = [40, 55, 35, 70, 90, 100, 60][i];
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-end justify-end" style={{ height: 100 }}>
                  <div
                    className="w-full bg-white/20 rounded-t-lg transition-all duration-500 hover:bg-white/30"
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="text-xs text-white/60">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
