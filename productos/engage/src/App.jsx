import { Routes, Route, NavLink } from 'react-router-dom';
import { QrCode, UtensilsCrossed, BarChart3, LayoutDashboard } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import QRs from './pages/QRs';
import MenuDigital from './pages/MenuDigital';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <span className="font-bold text-lg text-navy">Engage</span>
              <span className="text-xs text-gray-400 ml-2">Marketing Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
              { to: '/qrs', icon: QrCode, label: 'QRs' },
              { to: '/menu', icon: UtensilsCrossed, label: 'Menú' },
              { to: '/analytics', icon: BarChart3, label: 'Analytics' },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-navy text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/qrs" element={<QRs />} />
            <Route path="/menu" element={<MenuDigital />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
