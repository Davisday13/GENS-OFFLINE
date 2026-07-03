import React from 'react';
import { ShoppingCart, Plus, XCircle, FileText } from 'lucide-react';

const pedidosSimulados = [
  { id: 1, mesa: 'Mesa 3', items: [{ nombre: 'Parrilla Mixta', cantidad: 2, precio: 45000 }, { nombre: 'Gaseosa 1.5L', cantidad: 3, precio: 5000 }], total: 105000, estado: 'activo' },
  { id: 2, mesa: 'Mesa 7', items: [{ nombre: 'Hamburguesa Clásica', cantidad: 1, precio: 22000 }, { nombre: 'Papas Fritas', cantidad: 2, precio: 8000 }], total: 38000, estado: 'activo' },
  { id: 3, mesa: 'Mesa 12', items: [{ nombre: 'Bandeja Paisa', cantidad: 1, precio: 32000 }, { nombre: 'Jugo Natural', cantidad: 1, precio: 7000 }], total: 39000, estado: 'activo' },
];

export default function Pedidos() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Pedidos Activos</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nuevo Pedido
        </button>
      </div>

      <div className="grid gap-4">
        {pedidosSimulados.map((pedido) => (
          <div key={pedido.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} className="text-accent-orange" />
                <span className="text-lg font-bold text-brand-navy">{pedido.mesa}</span>
                <span className="badge-pendiente">Activo</span>
              </div>
              <span className="text-xl font-bold text-accent-green">
                ${pedido.total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-4">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span>
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="font-medium">
                    ${(item.cantidad * item.precio).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                <Plus size={16} /> Agregar Item
              </button>
              <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                <XCircle size={16} /> Cerrar Pedido
              </button>
              <button className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <FileText size={16} /> Facturar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
