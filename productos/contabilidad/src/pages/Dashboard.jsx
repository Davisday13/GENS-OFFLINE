import React, { useState, useEffect } from 'react';
import { getCierresZ, getGastos, getCompras, getArqueos } from '../lib/api';
import { LayoutDashboard, Receipt, Wallet, ShoppingCart, Coins } from 'lucide-react';

function KpiCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-lg ${color || 'bg-brand-50 text-brand-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value != null ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '...'}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [k, setK] = useState({ ventas: 0, gastos: 0, compras: 0, arqueos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [zRes, gRes, cRes, aRes] = await Promise.all([
          getCierresZ(),
          getGastos(),
          getCompras(),
          getArqueos(),
        ]);
        if (!mounted) return;
        const sum = (data, field) => (data || []).reduce((a, r) => a + Number(r[field] || 0), 0);
        setK({
          ventas: sum(zRes.data, 'total'),
          gastos: sum(gRes.data, 'total'),
          compras: sum(cRes.data, 'total'),
          arqueos: sum(aRes.data, 'total'),
        });
      } catch {
        // ignore
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const resultado = k.ventas - k.gastos - k.compras;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general del periodo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Receipt} label="Cierres Z (ventas)" value={loading ? null : k.ventas} color="bg-emerald-50 text-emerald-700" />
        <KpiCard icon={Wallet} label="Gastos" value={loading ? null : k.gastos} color="bg-rose-50 text-rose-700" />
        <KpiCard icon={ShoppingCart} label="Compras" value={loading ? null : k.compras} color="bg-amber-50 text-amber-700" />
        <KpiCard icon={Coins} label="Arqueos" value={loading ? null : k.arqueos} color="bg-purple-50 text-purple-700" />
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-700">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-gray-500">Resultado aproximado</span>
        </div>
        <div className={`text-2xl font-bold ${resultado >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {loading ? '...' : `$${resultado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        </div>
        <div className="text-xs text-gray-400 mt-1">Ventas − Gastos − Compras</div>
      </div>
    </div>
  );
}
