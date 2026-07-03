import React, { useState } from 'react';
import {
  LayoutDashboard, Receipt, Wallet, ShoppingCart, BookOpen,
  Coins, Landmark, LogOut, User,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CierresZ from './pages/CierresZ';
import Arqueos from './pages/Arqueos';
import Gastos from './pages/Gastos';
import Compras from './pages/Compras';
import Conciliacion from './pages/Conciliacion';
import Contabilidad from './pages/Contabilidad';

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'cierres_z',    label: 'Cierres Z',    icon: Receipt },
  { id: 'arqueos',       label: 'Arqueos',      icon: Coins },
  { id: 'gastos',        label: 'Gastos',       icon: Wallet },
  { id: 'compras',       label: 'Compras',      icon: ShoppingCart },
  { id: 'conciliacion',  label: 'Conciliación', icon: Landmark },
  { id: 'contabilidad',  label: 'Contabilidad', icon: BookOpen },
];

const COMPONENTS = {
  dashboard:   Dashboard,
  cierres_z:  CierresZ,
  arqueos:     Arqueos,
  gastos:      Gastos,
  compras:     Compras,
  conciliacion: Conciliacion,
  contabilidad: Contabilidad,
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const ActivePage = COMPONENTS[view] || Dashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 shrink-0 gems-hero text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
            <span className="font-brand text-xl text-navy-800">G</span>
          </div>
          <div className="leading-none">
            <div className="font-brand text-2xl tracking-[0.02em]">GENS</div>
            <div className="text-[8.5px] uppercase tracking-[0.16em] text-white/50 mt-1 leading-tight">Contabilidad</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.id === view;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white text-brand-700 font-medium'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 pb-2 text-xs text-white/60 truncate flex items-center gap-2">
            <User className="h-3 w-3" /> Usuario offline
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <ActivePage />
        </div>
      </main>
    </div>
  );
}
