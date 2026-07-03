import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

const facturasSimuladas = [
  { id: 'FE-001', numero: 'FEP-1-2026-000001', cliente: 'Juan Pérez', total: 105000, cufe: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f', fecha: '2026-06-27' },
  { id: 'FE-002', numero: 'FEP-1-2026-000002', cliente: 'María Gómez', total: 38000, cufe: '2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g', fecha: '2026-06-27' },
  { id: 'FE-003', numero: 'FEP-1-2026-000003', cliente: 'Carlos López', total: 39000, cufe: '3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h', fecha: '2026-06-26' },
];

export default function Facturas() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText size={28} className="text-accent-blue" />
        <h1 className="text-2xl font-bold text-brand-navy">Facturas Electrónicas</h1>
      </div>

      <div className="space-y-3">
        {facturasSimuladas.map((factura) => (
          <div key={factura.id} className="card">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-bold text-brand-navy">{factura.numero}</span>
                  <span className="text-sm text-gray-400">{factura.fecha}</span>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Cliente:</span> {factura.cliente}
                </p>
                <p className="text-xl font-bold text-accent-green">
                  ${factura.total.toLocaleString('es-CO')}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 overflow-hidden">
                  <span className="shrink-0 font-semibold text-gray-500">CUFE:</span>
                  <span className="truncate">{factura.cufe}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-3" title="Descargar PDF">
                  <Download size={16} /> PDF
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-3" title="Ver en DIAN">
                  <ExternalLink size={16} /> XML
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
