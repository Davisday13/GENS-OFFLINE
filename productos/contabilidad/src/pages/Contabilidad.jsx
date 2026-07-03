import React, { useState, useEffect } from 'react';
import { getAsientos, createAsiento } from '../lib/api';
import { BookOpen, Plus, X } from 'lucide-react';

const hoy = () => new Date().toISOString().split('T')[0];

export default function Contabilidad() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha: hoy(), descripcion: '', cuenta_debe: '', cuenta_haber: '', monto: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getAsientos();
      setLista(res.data || []);
    } catch {
      setLista([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const total = lista.reduce((a, r) => a + Number(r.monto || 0), 0);

  const guardar = async () => {
    setGuardando(true);
    try {
      await createAsiento({
        fecha: form.fecha,
        descripcion: form.descripcion,
        cuenta_debe: form.cuenta_debe,
        cuenta_haber: form.cuenta_haber,
        monto: Number(form.monto) || 0,
      });
      setModal(false);
      setForm({ fecha: hoy(), descripcion: '', cuenta_debe: '', cuenta_haber: '', monto: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} asientos · ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo asiento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : lista.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin asientos contables.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Cuenta debe</th>
                <th className="text-left px-4 py-3">Cuenta haber</th>
                <th className="text-right px-4 py-3">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.fecha || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.descripcion || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm">{r.cuenta_debe || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm">{r.cuenta_haber || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">${Number(r.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nuevo asiento</h2>
                  <p className="text-xs text-gray-500">Registrar asiento contable</p>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Monto</label>
                  <input type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Cuenta Debe</label>
                  <input type="text" value={form.cuenta_debe} onChange={(e) => setForm({ ...form, cuenta_debe: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Ej: 1101" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Cuenta Haber</label>
                  <input type="text" value={form.cuenta_haber} onChange={(e) => setForm({ ...form, cuenta_haber: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Ej: 4101" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                  <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Concepto del asiento" />
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
