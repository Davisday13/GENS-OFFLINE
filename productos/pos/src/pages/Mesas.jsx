import React, { useState } from 'react';
import useStore from '../store';

const mesasSimuladas = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nombre: `Mesa ${i + 1}`,
  estado: ['libre', 'ocupada', 'reservada'][Math.floor(Math.random() * 3)],
  capacidad: [2, 4, 6][Math.floor(Math.random() * 3)],
}));

const badgeMap = {
  libre: 'badge-libre',
  ocupada: 'badge-ocupada',
  reservada: 'badge-reservada',
};

const borderMap = {
  libre: 'border-accent-green',
  ocupada: 'border-accent-red',
  reservada: 'border-accent-yellow',
};

export default function Mesas() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);

  function handleMesaClick(mesa) {
    setSelectedMesa(mesa);
    setShowModal(true);
  }

  function handleCrearPedido() {
    alert(`Pedido creado para ${selectedMesa.nombre}`);
    setShowModal(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Salón - Mapa de Mesas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesasSimuladas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => handleMesaClick(mesa)}
            className={`card flex flex-col items-center justify-center gap-2 border-l-4 ${borderMap[mesa.estado]} hover:shadow-xl transition-shadow cursor-pointer min-h-[120px]`}
          >
            <span className="text-lg font-bold text-brand-navy">{mesa.nombre}</span>
            <span className={badgeMap[mesa.estado]}>{mesa.estado}</span>
            <span className="text-xs text-gray-400">{mesa.capacidad} pers.</span>
          </button>
        ))}
      </div>

      {showModal && selectedMesa && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-brand-navy mb-2">{selectedMesa.nombre}</h2>
            <p className="text-gray-500 mb-1">Estado: <span className="font-semibold capitalize">{selectedMesa.estado}</span></p>
            <p className="text-gray-500 mb-6">Capacidad: {selectedMesa.capacidad} personas</p>
            <div className="flex gap-3">
              <button onClick={handleCrearPedido} className="btn-primary flex-1">
                Crear Pedido
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
