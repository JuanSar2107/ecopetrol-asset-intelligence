import React, { useState, useMemo } from 'react';
import { MovementTransaction, ToolAsset, UserProfile } from '../types';
import { MettavLogo } from './MettavLogo';
import { generateAuditPdf } from '../utils/generateAuditPdf';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileDown, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  FileText, 
  CheckCircle2, 
  Eye,
  Hash,
  Boxes,
  Truck,
  Wrench
} from 'lucide-react';

interface AdminAuditViewProps {
  transactions: MovementTransaction[];
  assets: ToolAsset[];
  currentUser: UserProfile;
  onSwitchToAdmin?: () => void;
  onSelectAsset?: (asset: ToolAsset) => void;
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({
  transactions,
  assets,
  currentUser,
  onSwitchToAdmin,
  onSelectAsset,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Filters state
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'quantity'>('newest');
  const [selectedTrxForModal, setSelectedTrxForModal] = useState<MovementTransaction | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // Type filter
      if (typeFilter !== 'ALL' && trx.type !== typeFilter) {
        return false;
      }

      // Asset filter
      if (selectedAssetFilter !== 'ALL' && trx.assetId !== selectedAssetFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = trx.assetName.toLowerCase().includes(q);
        const matchesId = trx.id.toLowerCase().includes(q);
        const matchesAssetId = trx.assetId.toLowerCase().includes(q);
        const matchesOperator = (trx.operatorName || trx.operator || '').toLowerCase().includes(q);
        const matchesDocument = (trx.operatorDocument || trx.operatorId || '').toLowerCase().includes(q);
        const matchesLocation = trx.location.toLowerCase().includes(q);
        const matchesOt = (trx.workOrder || '').toLowerCase().includes(q);
        const matchesReason = (trx.withdrawalReason || trx.notes || '').toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesId &&
          !matchesAssetId &&
          !matchesOperator &&
          !matchesDocument &&
          !matchesLocation &&
          !matchesOt &&
          !matchesReason
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'quantity') {
        return (b.quantity || 0) - (a.quantity || 0);
      }
      return sortBy === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
  }, [transactions, typeFilter, selectedAssetFilter, searchQuery, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalMovements = transactions.length;
    const totalOut = transactions.filter((t) => t.type === 'OUT').length;
    const totalIn = transactions.filter((t) => t.type === 'IN').length;
    const totalUnitsMoved = transactions.reduce((acc, t) => acc + (t.quantity || 0), 0);
    
    const uniqueOperators = new Set(
      transactions.map((t) => t.operatorDocument || t.operator || t.operatorName).filter(Boolean)
    ).size;

    return {
      totalMovements,
      totalOut,
      totalIn,
      totalUnitsMoved,
      uniqueOperators,
    };
  }, [transactions]);

  // Trigger PDF generation
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const filterDesc = typeFilter === 'ALL' 
        ? (selectedAssetFilter === 'ALL' ? 'Historial Completo de Movimientos' : `Ítem: ${selectedAssetFilter}`)
        : (typeFilter === 'OUT' ? 'Solo Despachos a Obra/Proyecto (OUT)' : 'Solo Devoluciones a Bodega (IN)');

      generateAuditPdf({
        transactions: filteredTransactions,
        assets,
        currentUser,
        filterLabel: filterDesc,
      });

      setPdfSuccessMessage(`Reporte PDF generado exitosamente con ${filteredTransactions.length} registros de inventario.`);
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // If user is NOT an admin, show strict RBAC view (as requested to hide admin features from operators)
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-[#0f172a]/95 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs uppercase font-bold tracking-wider">
              Acceso Restringido a Administradores
            </div>
            <h2 className="text-2xl font-bold text-white">
              Libro Maestro de Auditoría de Inventarios
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Este apartado está reservado para administradores y coordinadores autorizados para la revisión oficial, trazabilidad y descarga de informes de maquinaria y suministros.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Usuario actual:</span>
              <strong className="text-white">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between">
              <span>Rol asignado:</span>
              <span className="text-sky-400 font-bold uppercase">{currentUser.roleTitle}</span>
            </div>
          </div>

          {onSwitchToAdmin && (
            <div className="pt-2">
              <button
                onClick={onSwitchToAdmin}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cambiar a Rol Administrador (Sofía Ramírez)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {pdfSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{pdfSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPdfSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-white underline font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Official Corporate Audit Header */}
      <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-sky-500/20 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MettavLogo size="sm" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              Supervisión de Administrador
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Auditoría de Movimientos de Maquinaria e Inventario</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Supervisa despachos a obras, proyectos y talleres, quién los autorizó o retiró, motivos y órdenes de servicio. Exporta informes oficiales en PDF.
          </p>
        </div>

        {/* Primary PDF Download Action */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || filteredTransactions.length === 0}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-5 h-5" />
            <div className="text-left leading-tight">
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Informe en PDF'}</span>
              <span className="block text-[10px] text-slate-900 font-normal">
                {filteredTransactions.length} registros filtrados
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Movimientos</span>
            <Hash className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {stats.totalMovements}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Operaciones registradas</span>
          </div>
        </div>

        <div className="bg-[#0f172a]/90 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Despachos / Salidas (OUT)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-300 font-mono">
              {stats.totalOut}
            </span>
            <span className="text-[11px] text-amber-400/80 block mt-0.5">En obra, cliente o proyecto</span>
          </div>
        </div>

        <div className="bg-[#0f172a]/90 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Entradas a Bodega (IN)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-300 font-mono">
              {stats.totalIn}
            </span>
            <span className="text-[11px] text-emerald-400/80 block mt-0.5">Reingresos a bodega central</span>
          </div>
        </div>

        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Unidades Movilizadas</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              {stats.totalUnitsMoved}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Unidades registradas</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#0f172a]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Técnicos Auditados</span>
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-300 font-mono">
              {stats.uniqueOperators}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Operadores con registro</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por OT, equipo, obra/cliente, ítem, operador o motivo..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('OUT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'OUT'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Salidas ({stats.totalOut})</span>
            </button>
            <button
              onClick={() => setTypeFilter('IN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === 'IN'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Entradas ({stats.totalIn})</span>
            </button>
          </div>
        </div>

        {/* Secondary dropdown filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por Ítem:
            </span>
            <select
              value={selectedAssetFilter}
              onChange={(e) => setSelectedAssetFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">Todos los ítems ({assets.length})</option>
              {assets.map((a, idx) => (
                <option key={`audit-opt-${a.id}-${idx}`} value={a.id}>
                  {a.name} ({a.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="quantity">Mayor cantidad movilizada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit History Table */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-white text-base sm:text-lg">
              Registro Detallado de Movimientos
            </h2>
            <span className="text-xs text-slate-400">
              ({filteredTransactions.length} encontrados)
            </span>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold text-base">
              No hay movimientos que coincidan con la búsqueda
            </h3>
            <p className="text-xs text-slate-400">
              Prueba cambiando o limpiando los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4 font-semibold">OT / Registro</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">Ítem o Máquina</th>
                  <th className="py-3 px-4 font-semibold text-center">Cant.</th>
                  <th className="py-3 px-4 font-semibold">Responsable / Operador</th>
                  <th className="py-3 px-4 font-semibold">Destino / Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Motivo Declarado</th>
                  <th className="py-3 px-4 font-semibold">Fecha</th>
                  <th className="py-3 px-4 font-semibold text-right">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTransactions.map((trx) => {
                  const isOut = trx.type === 'OUT';
                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTrxForModal(trx)}
                    >
                      {/* ID / OT */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white">
                          {trx.id}
                        </div>
                        {trx.workOrder && (
                          <span className="text-[10px] text-sky-400 font-semibold block">
                            {trx.workOrder}
                          </span>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOut
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isOut ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-amber-400" />
                              <span>Salida</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                              <span>Entrada</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Pieza */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {trx.assetName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {trx.assetId}
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            isOut
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          {isOut ? `-${trx.quantity}` : `+${trx.quantity}`}
                        </span>
                      </td>

                      {/* Mecánico */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {trx.operatorName || trx.operator || 'Técnico Asignado'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          CC: {trx.operatorDocument || trx.operatorId || '—'}
                        </div>
                      </td>

                      {/* Ubicación / Destino */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{trx.location}</span>
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed" title={trx.withdrawalReason || trx.notes}>
                          {trx.withdrawalReason || trx.notes || 'Operación estándar de inventario y logística.'}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {trx.timestamp}
                      </td>

                      {/* Acción Ver */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrxForModal(trx);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedTrxForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedTrxForModal(null)}
          />
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <MettavLogo size="sm" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Acta de Movimiento de Inventario
                  </h3>
                  <span className="text-xs text-sky-400 font-mono">
                    {selectedTrxForModal.id} • {selectedTrxForModal.workOrder || 'Sin OT'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrxForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Ítem / Maquinaria:</span>
                <strong className="text-white">{selectedTrxForModal.assetName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipo de Movimiento:</span>
                <strong className={selectedTrxForModal.type === 'OUT' ? 'text-amber-400' : 'text-emerald-400'}>
                  {selectedTrxForModal.type === 'OUT' ? 'Salida a Obra / Taller' : 'Entrada a Bodega'} ({selectedTrxForModal.quantity} un.)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destino / Ubicación:</span>
                <span className="text-white">{selectedTrxForModal.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Responsable:</span>
                <span className="text-white">{selectedTrxForModal.operatorName || selectedTrxForModal.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha y Hora:</span>
                <span className="text-slate-300 font-mono">{selectedTrxForModal.timestamp}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-sky-400 uppercase tracking-wider block text-[11px]">
                Motivo Declarado por el Operador:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedTrxForModal.withdrawalReason || selectedTrxForModal.notes || 'Operación habitual de inventario.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedTrxForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  generateAuditPdf({
                    transactions: [selectedTrxForModal],
                    assets,
                    currentUser,
                    filterLabel: `Acta: ${selectedTrxForModal.id}`,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Descargar Acta en PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
