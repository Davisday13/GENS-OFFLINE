import React from 'react';
import { DollarSign, Printer, X } from 'lucide-react';

export default function Caja() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <DollarSign size={28} className="text-accent-green" />
        <h1 className="text-2xl font-bold text-brand-navy">Caja</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-brand-navy mb-4">Resumen de Ventas</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Total Ventas</span>
              <span className="font-bold text-accent-green">$2,450,000</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Número de Pedidos</span>
              <span className="font-bold">32</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Ticket Promedio</span>
              <span className="font-bold">$76,563</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Pedidos Cancelados</span>
              <span className="font-bold text-accent-red">2</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-brand-navy mb-4">Formas de Pago</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Efectivo</span>
              <span className="font-bold">$1,200,000</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Tarjeta Débito</span>
              <span className="font-bold">$850,000</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-500">Tarjeta Crédito</span>
              <span className="font-bold">$400,000</span>
            </div>
            <div className="flex justify-between text-lg border-t border-gray-200 pt-3">
              <span className="text-gray-700 font-bold">Total</span>
              <span className="font-bold text-accent-green">$2,450,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="btn-primary flex items-center gap-2">
          <Printer size={20} /> Cerrar X (Informe Parcial)
        </button>
        <button className="btn-danger flex items-center gap-2">
          <X size={20} /> Cerrar Z (Cierre Total)
        </button>
      </div>
    </div>
  );
}
