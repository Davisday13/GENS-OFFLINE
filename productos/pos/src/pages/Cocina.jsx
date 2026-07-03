import React from 'react';
import { ChefHat, CheckCircle } from 'lucide-react';

const pedidosCocina = [
  { id: 1, mesa: 'Mesa 3', items: [{ nombre: 'Parrilla Mixta', cantidad: 2 }, { nombre: 'Arepa Queso', cantidad: 1 }], tiempo: '10:25', estado: 'preparando' },
  { id: 2, mesa: 'Mesa 7', items: [{ nombre: 'Hamburguesa Clásica', cantidad: 1 }, { nombre: 'Papas Fritas', cantidad: 2 }], tiempo: '10:30', estado: 'preparando' },
  { id: 3, mesa: 'Mesa 5', items: [{ nombre: 'Bandeja Paisa', cantidad: 1 }], tiempo: '10:32', estado: 'preparando' },
  { id: 4, mesa: 'Mesa 12', items: [{ nombre: 'Limonada Natural', cantidad: 2 }, { nombre: 'Tacos', cantidad: 3 }], tiempo: '10:15', estado: 'listo' },
];

export default function Cocina() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ChefHat size={28} className="text-accent-orange" />
        <h1 className="text-2xl font-bold text-brand-navy">Cocina - KDS</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosCocina.map((pedido) => (
          <div
            key={pedido.id}
            className={`card border-l-4 ${pedido.estado === 'listo' ? 'border-accent-green' : 'border-accent-orange'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-brand-navy">{pedido.mesa}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${pedido.estado === 'listo' ? 'badge-completado' : 'badge-pendiente'}`}>
                {pedido.estado === 'listo' ? 'Listo' : 'Preparando'}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-2">Recibido: {pedido.tiempo}</div>

            <div className="border-t border-gray-100 pt-2 mb-4">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  <span className="bg-gray-100 text-brand-navy font-bold text-xs w-7 h-7 flex items-center justify-center rounded-full">
                    {item.cantidad}
                  </span>
                  <span className="text-base font-medium">{item.nombre}</span>
                </div>
              ))}
            </div>

            {pedido.estado !== 'listo' && (
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Listo
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
