import React from 'react';
import useStore from '../store';

const kpiData = {
  mesasOcupadas: 8,
  pedidosActivos: 12,
  ventasHoy: 2450000,
  facturasPendientes: 5,
};

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex flex-col gap-1">
          <span className="text-sm text-gray-500 font-medium">Mesas Ocupadas</span>
          <span className="text-4xl font-bold text-brand-navy">{kpiData.mesasOcupadas}</span>
          <span className="text-xs text-gray-400">de 20 mesas</span>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="text-sm text-gray-500 font-medium">Pedidos Activos</span>
          <span className="text-4xl font-bold text-accent-orange">{kpiData.pedidosActivos}</span>
          <span className="text-xs text-gray-400">en preparación</span>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="text-sm text-gray-500 font-medium">Ventas Hoy</span>
          <span className="text-4xl font-bold text-accent-green">
            ${kpiData.ventasHoy.toLocaleString('es-CO')}
          </span>
          <span className="text-xs text-gray-400">total del día</span>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="text-sm text-gray-500 font-medium">Facturas Pendientes</span>
          <span className="text-4xl font-bold text-accent-red">{kpiData.facturasPendientes}</span>
          <span className="text-xs text-gray-400">por emitir</span>
        </div>
      </div>
    </div>
  );
}
