import React from 'react';
import useStore from './store';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Cocina from './pages/Cocina';
import Caja from './pages/Caja';
import Facturas from './pages/Facturas';
import Reportes from './pages/Reportes';
import Config from './pages/Config';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'monitor' },
  { id: 'mesas', label: 'Mesas', icon: 'grid' },
  { id: 'pedidos', label: 'Pedidos', icon: 'shopping-cart' },
  { id: 'cocina', label: 'Cocina', icon: 'chef-hat' },
  { id: 'caja', label: 'Caja', icon: 'dollar-sign' },
  { id: 'facturas', label: 'Facturas', icon: 'file-text' },
  { id: 'reportes', label: 'Reportes', icon: 'bar-chart' },
  { id: 'config', label: 'Config', icon: 'settings' },
];

function Icon({ name, size = 24 }) {
  const icons = {
    monitor: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    'shopping-cart': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    'chef-hat': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A4 4 0 0 1 6 6.13C8 4 12 2 16 4.13a4 4 0 0 1 0 7.74" /><path d="M4 15h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
      </svg>
    ),
    'dollar-sign': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    'file-text': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    'bar-chart': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };

  return <span className="inline-flex items-center justify-center">{icons[name] || null}</span>;
}

const views = {
  dashboard: Dashboard,
  mesas: Mesas,
  pedidos: Pedidos,
  cocina: Cocina,
  caja: Caja,
  facturas: Facturas,
  reportes: Reportes,
  config: Config,
};

export default function App() {
  const vistaActual = useStore((s) => s.vistaActual);
  const setVistaActual = useStore((s) => s.setVistaActual);
  const Vista = views[vistaActual] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <aside className="w-20 bg-brand-navy flex flex-col items-center py-4 gap-2 shrink-0">
        <div className="text-white text-2xl font-brand mb-4 tracking-wider" style={{ fontSize: '1.1rem', lineHeight: 1 }}>
          G
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setVistaActual(item.id)}
            className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl text-xs gap-0.5 transition-all ${
              vistaActual === item.id
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title={item.label}
          >
            <Icon name={item.icon} size={22} />
            <span className="text-[10px] leading-tight">{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Vista />
      </main>
    </div>
  );
}
