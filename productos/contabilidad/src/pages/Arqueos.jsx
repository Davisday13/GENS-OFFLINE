import React, { useState, useEffect } from 'react';
import { getArqueos, createArqueo } from '../lib/api';
import { Coins, Plus, X } from 'lucide-react';

const hoy = () => new Date().toISOString().split('T')[0];

export default function Arqueos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha: hoy(), caja: '', efectivo: '', tarjeta: '', total: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getArqueos();
      setLista(res.data || []);
    } catch {
      setLista([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const total = lista.reduce((a, r) => a + Number(r.total || 0), 0);

  const guardar = async () => {
    setGuardando(true);
    try {
      await createArqueo({
        fecha: form.fecha,
        caja: form.caja,
        efectivo: Number(form.efectivo) || 0,
        tarjeta: Number(form.tarjeta) || 0,
        total: Number(form.total) || 0,
      });
      setModal(false);
      setForm({ fecha: hoy(), caja: '', efectivo: '', tarjeta: '', total: '' });
      await cargar();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    }
    setGuardando(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arqueos</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} arqueos · ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo arqueo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : lista.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin arqueos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Caja</th>
                <th className="text-right px-4 py-3">Efectivo</th>
                <th className="text-right px-4 py-3">Tarjeta</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.fecha || '—'}</td>
                  <td className="px-4 py-3">{r.caja || '—'}</td>
                  <td className="px-4 py-3 text-right">${Number(r.efectivo || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right">${Number(r.tarjeta || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-semibold">${Number(r.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Coins className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nuevo arqueo</h2>
                  <p className="text-xs text-gray-500">Registrar conteo de caja</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Caja</label>
                  <input type="text" value={form.caja} onChange={(e) => setForm({ ...form, caja: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Nombre de caja" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Efectivo</label>
                  <input type="number" step="0.01" value={form.efectivo} onChange={(e) => setForm({ ...form, efectivo: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tarjeta</label>
                  <input type="number" step="0.01" value={form.tarjeta} onChange={(e) => setForm({ ...form, tarjeta: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total</label>
                  <input type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={guardar} disabled={guardando}
                className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
