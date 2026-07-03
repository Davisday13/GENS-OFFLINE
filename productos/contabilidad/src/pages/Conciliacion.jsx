import React, { useState, useEffect } from 'react';
import { getConciliacion, createConciliacion } from '../lib/api';
import { Landmark, Plus, X } from 'lucide-react';

const hoy = () => new Date().toISOString().split('T')[0];

export default function Conciliacion() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha: hoy(), banco: '', saldo_libros: '', saldo_banco: '', diferencia: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getConciliacion();
      setLista(res.data || []);
    } catch {
      setLista([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    setGuardando(true);
    try {
      const sl = Number(form.saldo_libros) || 0;
      const sb = Number(form.saldo_banco) || 0;
      await createConciliacion({
        fecha: form.fecha,
        banco: form.banco,
        saldo_libros: sl,
        saldo_banco: sb,
        diferencia: sb - sl,
      });
      setModal(false);
      setForm({ fecha: hoy(), banco: '', saldo_libros: '', saldo_banco: '', diferencia: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Conciliación</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} registros</p>
        </div>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nueva conciliación
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : lista.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin conciliaciones registradas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Banco</th>
                <th className="text-right px-4 py-3">Saldo libros</th>
                <th className="text-right px-4 py-3">Saldo banco</th>
                <th className="text-right px-4 py-3">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((r, i) => {
                const diff = Number(r.diferencia || 0);
                return (
                  <tr key={r.id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.fecha || '—'}</td>
                    <td className="px-4 py-3">{r.banco || '—'}</td>
                    <td className="px-4 py-3 text-right">${Number(r.saldo_libros || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right">${Number(r.saldo_banco || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${diff === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ${diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Landmark className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nueva conciliación</h2>
                  <p className="text-xs text-gray-500">Conciliar saldos bancarios</p>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Banco</label>
                  <input type="text" value={form.banco} onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Nombre del banco" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Saldo según libros</label>
                  <input type="number" step="0.01" value={form.saldo_libros} onChange={(e) => setForm({ ...form, saldo_libros: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Saldo según banco</label>
                  <input type="number" step="0.01" value={form.saldo_banco} onChange={(e) => setForm({ ...form, saldo_banco: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="text-xs text-gray-400">
                La diferencia se calcula automáticamente: saldo banco − saldo libros
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
