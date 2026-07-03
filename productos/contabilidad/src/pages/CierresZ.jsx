import React, { useState, useEffect } from 'react';
import { getCierresZ, createCierreZ } from '../lib/api';
import { Receipt, Plus, X } from 'lucide-react';

const hoy = () => new Date().toISOString().split('T')[0];

export default function CierresZ() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha: hoy(), venta_gravada: '', itbms: '', total: '', numero_z: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getCierresZ();
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
      await createCierreZ({
        fecha: form.fecha,
        venta_gravada: Number(form.venta_gravada) || 0,
        itbms: Number(form.itbms) || 0,
        total: Number(form.total) || 0,
        numero_z: form.numero_z || null,
      });
      setModal(false);
      setForm({ fecha: hoy(), venta_gravada: '', itbms: '', total: '', numero_z: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Cierres Z</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} cierres · ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo cierre Z
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : lista.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin cierres Z registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">N° Z</th>
                <th className="text-right px-4 py-3">Gravada</th>
                <th className="text-right px-4 py-3">ITBMS</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.fecha || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.numero_z || '—'}</td>
                  <td className="px-4 py-3 text-right">${Number(r.venta_gravada || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right">${Number(r.itbms || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Receipt className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nuevo cierre Z</h2>
                  <p className="text-xs text-gray-500">Registrar ventas del día</p>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">N° Z</label>
                  <input type="text" value={form.numero_z} onChange={(e) => setForm({ ...form, numero_z: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Venta gravada</label>
                  <input type="number" step="0.01" value={form.venta_gravada} onChange={(e) => setForm({ ...form, venta_gravada: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ITBMS</label>
                  <input type="number" step="0.01" value={form.itbms} onChange={(e) => setForm({ ...form, itbms: e.target.value })}
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
