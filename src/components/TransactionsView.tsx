import React, { useState } from 'react';
import { MovementTransaction, UserProfile, ToolAsset } from '../types';
import { generateAuditPdf } from '../utils/generateAuditPdf';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  FileDown,
  MapPin,
  User,
  ExternalLink,
  ClipboardList,
  Filter
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: MovementTransaction[];
  assets: ToolAsset[];
  currentUser: UserProfile;
  onOpenMovement: (type?: 'IN' | 'OUT') => void;
  onSelectAsset: (asset: ToolAsset) => void;
  onNavigateToAudit?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  assets,
  currentUser,
  onOpenMovement,
  onSelectAsset,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const isAdmin = currentUser.role === 'admin';

  const inCount = transactions.filter((t) => t.type === 'IN').length;
  const outCount = transactions.filter((t) => t.type === 'OUT').length;

  const filtered = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.assetName.toLowerCase().includes(q) ||
        t.assetId.toLowerCase().includes(q) ||
        t.operatorName?.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.workOrder && t.workOrder.toLowerCase().includes(q)) ||
        (t.withdrawalReason && t.withdrawalReason.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportPdf = () => {
    generateAuditPdf({
      transactions: filtered,
      assets,
      currentUser,
      filterLabel: filterType === 'ALL' ? 'Todos los Movimientos' : filterType === 'IN' ? 'Entradas a Bodega' : 'Salidas y Despachos',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header simplificado y limpio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Movimientos de Inventario
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro de entradas a bodega y despachos a proyectos u obras.
          </p>
        </div>

        {/* Acciones principales claras y directas */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenMovement('IN')}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Registrar nuevo ingreso de ítem o maquinaria a bodega"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Registrar Entrada</span>
          </button>

          <button
            onClick={() => onOpenMovement('OUT')}
            className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Registrar salida o despacho a obra"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Registrar Salida</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleExportPdf}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Descargar reporte en PDF"
            >
              <FileDown className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros, Contadores y Búsqueda unificada (reemplaza las 3 tarjetas pesadas) */}
      <div className="bg-[#0b1220] border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Pestañas de filtro con contadores integrados */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'ALL'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Todos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
              filterType === 'ALL' ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('IN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'IN'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Entradas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
              filterType === 'IN' ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {inCount}
            </span>
          </button>

          <button
            onClick={() => setFilterType('OUT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'OUT'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Salidas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
              filterType === 'OUT' ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {outCount}
            </span>
          </button>
        </div>

        {/* Buscador + Selector de Modo */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md md:ml-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ítem, destino, responsable..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Toggle Vista Lista / Tabla */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Vista cómoda de lista"
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Vista en tabla"
            >
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Si no hay resultados */}
      {filtered.length === 0 && (
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-12 text-center">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-base">No se encontraron movimientos</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Intenta con otro término de búsqueda o cambia el filtro.
          </p>
        </div>
      )}

      {/* VISTA 1: Lista Cómoda y Visual (Recomendada y limpia) */}
      {viewMode === 'cards' && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isIN = item.type === 'IN';
            const assetObj = assets.find(
              (a) => a.id === item.assetId || a.name.toLowerCase() === item.assetName.toLowerCase()
            );
            const imageUrl = assetObj?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80';

            return (
              <div
                key={item.id}
                className="bg-[#0b1220] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 transition-all hover:bg-slate-900/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Izquierda: Imagen del objeto enfrente + Información del ítem */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Imagen pequeña del objeto enfrente con badge de tipo */}
                    <div
                      onClick={() => assetObj && onSelectAsset(assetObj)}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 border border-slate-700/80 p-0.5 shrink-0 overflow-hidden shadow-sm group cursor-pointer hover:border-sky-400 transition-colors"
                      title="Clic para ver ficha técnica del objeto"
                    >
                      <img
                        src={imageUrl}
                        alt={item.assetName}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {/* Mini indicador del tipo en la esquina */}
                      <div
                        className={`absolute bottom-0.5 right-0.5 w-5 h-5 rounded-md flex items-center justify-center shadow-md ${
                          isIN ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                        }`}
                        title={isIN ? 'Entrada a Bodega' : 'Salida / Despacho'}
                      >
                        {isIN ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </div>
                    </div>

                    {/* Datos principales */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isIN
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {isIN ? 'Entrada' : 'Salida'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.timestamp}
                        </span>
                        {item.workOrder && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400 font-mono">
                            OT: {item.workOrder}
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => assetObj && onSelectAsset(assetObj)}
                        className="text-sm sm:text-base font-semibold text-white mt-1 truncate hover:text-sky-300 cursor-pointer transition-colors"
                      >
                        {item.assetName}
                      </h3>

                      {/* Motivo en texto claro y legible */}
                      {(item.withdrawalReason || item.notes) && (
                        <p className="text-xs text-slate-300 mt-1 font-normal line-clamp-2">
                          <span className="text-slate-500 font-medium">Motivo:</span> {item.withdrawalReason || item.notes}
                        </p>
                      )}

                      {/* Ubicación y Operador */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.operatorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Derecha: Cantidad y Botón de Ficha Técnica */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                        Cantidad
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-bold font-mono ${
                          isIN ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isIN ? `+${item.quantity}` : `-${item.quantity}`} <span className="text-xs font-normal text-slate-400">unid.</span>
                      </span>
                    </div>

                    {assetObj && (
                      <button
                        onClick={() => onSelectAsset(assetObj)}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-sky-400 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Ver ficha técnica completa del ítem"
                      >
                        <span>Ver Ítem</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: Tabla Optimizada (sin cajas ruidosas, espaciada y limpia) */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="bg-[#0b1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 uppercase text-slate-400 font-semibold tracking-wider">
                  <th className="p-3.5 whitespace-nowrap">Fecha</th>
                  <th className="p-3.5 whitespace-nowrap">Tipo</th>
                  <th className="p-3.5 whitespace-nowrap">Ítem o Maquinaria</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Cant.</th>
                  <th className="p-3.5 whitespace-nowrap">Motivo</th>
                  <th className="p-3.5 whitespace-nowrap">Destino / Bodega</th>
                  <th className="p-3.5 whitespace-nowrap">Responsable</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((item) => {
                  const isIN = item.type === 'IN';
                  const assetObj = assets.find(
                    (a) => a.id === item.assetId || a.name.toLowerCase() === item.assetName.toLowerCase()
                  );
                  const imageUrl = assetObj?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="p-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {item.timestamp}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isIN
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isIN ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isIN ? 'ENTRADA' : 'SALIDA'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* Imagen pequeña del objeto enfrente */}
                          <div 
                            onClick={() => assetObj && onSelectAsset(assetObj)}
                            className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 p-0.5 shrink-0 overflow-hidden cursor-pointer hover:border-sky-400 transition-colors"
                            title="Ver ficha técnica"
                          >
                            <img
                              src={imageUrl}
                              alt={item.assetName}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="min-w-0">
                            <div 
                              onClick={() => assetObj && onSelectAsset(assetObj)}
                              className="font-semibold text-white truncate max-w-xs cursor-pointer hover:text-sky-300 transition-colors"
                            >
                              {item.assetName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ID: {item.assetId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-bold whitespace-nowrap font-mono">
                        <span className={isIN ? 'text-emerald-400' : 'text-amber-400'}>
                          {isIN ? `+${item.quantity}` : `-${item.quantity}`}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-slate-300 text-xs">
                        {item.withdrawalReason || item.notes || <span className="text-slate-500 italic">—</span>}
                      </td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-white font-medium">{item.operatorName}</div>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {assetObj && (
                          <button
                            onClick={() => onSelectAsset(assetObj)}
                            className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
