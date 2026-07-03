import React from 'react';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

export default function Reportes() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={28} className="text-accent-purple" />
        <h1 className="text-2xl font-bold text-brand-navy">Reportes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="card hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={24} className="text-accent-green" />
            <h2 className="text-lg font-bold text-brand-navy">Ventas por Período</h2>
          </div>
          <p className="text-sm text-gray-500">Resumen de ventas diario, semanal, mensual</p>
        </button>

        <button className="card hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <Package size={24} className="text-accent-orange" />
            <h2 className="text-lg font-bold text-brand-navy">Ventas por Producto</h2>
          </div>
          <p className="text-sm text-gray-500">Productos más vendidos y rentabilidad</p>
        </button>

        <button className="card hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <Users size={24} className="text-accent-blue" />
            <h2 className="text-lg font-bold text-brand-navy">Ventas por Mesero</h2>
          </div>
          <p className="text-sm text-gray-500">Desempeño individual del equipo</p>
        </button>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-bold text-brand-navy mb-4">Resumen del Período</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">Ventas Totales</span>
            <p className="text-xl font-bold text-accent-green">$12,450,000</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Pedidos</span>
            <p className="text-xl font-bold">156</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Producto Estrella</span>
            <p className="text-xl font-bold text-accent-orange">Parrilla Mixta</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Mejor Mesero</span>
            <p className="text-xl font-bold text-accent-blue">Carlos M.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
