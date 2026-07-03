import { NavLink } from 'react-router-dom';
import { QrCode, UtensilsCrossed, BarChart3, LayoutDashboard } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/qrs', icon: QrCode, label: 'QRs' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menú Digital' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="text-xl font-bold">E</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Engage</h1>
            <p className="text-xs text-white/60">Marketing Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-white/50">admin@engage.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
