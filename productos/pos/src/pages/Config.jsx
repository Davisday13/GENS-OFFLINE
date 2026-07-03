import React, { useState } from 'react';
import { Settings, Save, Printer, Users } from 'lucide-react';

export default function Config() {
  const [nombre, setNombre] = useState('Mi Restaurante');
  const [ruc, setRuc] = useState('123456789-0');
  const [ipImp, setIpImp] = useState('192.168.1.100:8090');
  const [modoMesero, setModoMesero] = useState(true);

  function handleSave(e) {
    e.preventDefault();
    alert('Configuración guardada');
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings size={28} className="text-gray-500" />
        <h1 className="text-2xl font-bold text-brand-navy">Configuración</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <div className="card">
          <h2 className="text-lg font-bold text-brand-navy mb-4">Información del Negocio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Negocio</label>
              <input
                type="text"
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RUC</label>
              <input
                type="text"
                className="input font-mono"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
            <Printer size={20} /> Impresora Térmica
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">IP del Agente de Impresión</label>
            <input
              type="text"
              className="input font-mono"
              placeholder="192.168.1.100:8090"
              value={ipImp}
              onChange={(e) => setIpImp(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Dirección del agente POS-Proxy para impresión remota</p>
          </div>
        </div>

        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
            <Users size={20} /> Modo Operación
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modoMesero}
                onChange={() => setModoMesero(!modoMesero)}
              />
              <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-brand-verde transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
            <div>
              <span className="font-medium text-gray-800">Modo Mesero</span>
              <p className="text-xs text-gray-400">Los meseros pueden gestionar pedidos desde sus dispositivos</p>
            </div>
          </label>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={20} /> Guardar Configuración
        </button>
      </form>
    </div>
  );
}
