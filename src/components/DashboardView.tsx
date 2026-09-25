import React, { useState } from 'react';
import { ToolAsset, MovementTransaction, UserProfile } from '../types';
import { MettavLogo } from './MettavLogo';
import { 
  Boxes, 
  Wrench, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  ChevronRight, 
  AlertTriangle,
  FileText,
  Truck,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  assets: ToolAsset[];
  transactions: MovementTransaction[];
  currentUser: UserProfile;
  onOpenScanner?: () => void;
  onOpenAddAsset: () => void;
  onOpenMovement: (type?: 'IN' | 'OUT') => void;
  onSelectAsset: (asset: ToolAsset) => void;
  onViewAllTransactions: () => void;
  onViewCatalog: () => void;
  onNavigateToAudit?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  transactions,
  currentUser,
  onOpenAddAsset,
  onOpenMovement,
  onSelectAsset,
  onViewAllTransactions,
  onViewCatalog,
  onNavigateToAudit,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IN_STOCK' | 'DEPLOYED' | 'ALERTS'>('ALL');

  // Key live metrics
  const totalQuantity = assets.reduce((sum, a) => sum + a.quantity, 0);
  const deployedCount = assets.filter((a) => a.status === 'Deployed').length;
  const inMaintenanceCount = assets.filter((a) => a.status === 'Maintenance').length;
  const lowStockCount = assets.filter((a) => a.quantity <= a.minQuantity).length;
  const alertsTotal = lowStockCount + inMaintenanceCount;

  // Filtered asset preview list (up to 5 items to keep it clean and fast)
  const filteredAssets = assets.filter((asset) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchModel = asset.modelNumber?.toLowerCase().includes(q);
      const matchLoc = asset.location.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchLoc) return false;
    }

    // Filter pill
    if (activeFilter === 'IN_STOCK') return asset.status === 'In Stock';
    if (activeFilter === 'DEPLOYED') return asset.status === 'Deployed';
    if (activeFilter === 'ALERTS') return asset.quantity <= asset.minQuantity || asset.status === 'Maintenance';
    return true;
  });

  const previewAssets = filteredAssets.slice(0, 5);
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      {/* 1. Header: Clean, welcoming and uncluttered */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MettavLogo size="md" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Panel de Inventario
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                {currentUser.shift}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Bienvenido, <span className="text-white font-medium">{currentUser.name}</span> • {currentUser.roleTitle}
            </p>
          </div>
        </div>

        {/* Primary Header Action */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {isAdmin && (
            <button
              onClick={onOpenAddAsset}
              id="btn-dashboard-add-asset"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Ítem</span>
            </button>
          )}

          {isAdmin && onNavigateToAudit && (
            <button
              onClick={onNavigateToAudit}
              id="btn-dashboard-audit"
              className="hidden lg:flex px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-amber-300 text-xs font-semibold items-center gap-1.5 cursor-pointer"
              title="Auditoría de Movimientos y Actas"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Auditoría</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Core Actions: Big, clear, unmistakable for any operator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Salida / Despacho */}
        <button
          onClick={() => onOpenMovement('OUT')}
          id="btn-quick-movement-out"
          className="group text-left p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-950/20 hover:from-amber-500/20 hover:to-amber-900/30 border border-amber-500/30 hover:border-amber-400/50 transition-all flex items-center justify-between cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold text-white block group-hover:text-amber-300 transition-colors">
                Registrar Salida / Despacho
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Enviar maquinaria o insumos a obra, cliente o proyecto
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

        {/* Entrada / Devolución */}
        <button
          onClick={() => onOpenMovement('IN')}
          id="btn-quick-movement-in"
          className="group text-left p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-950/20 hover:from-emerald-500/20 hover:to-emerald-900/30 border border-emerald-500/30 hover:border-emerald-400/50 transition-all flex items-center justify-between cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold text-white block group-hover:text-emerald-300 transition-colors">
                Registrar Entrada / Devolución
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Reingreso de obra o recepción de nuevo pedido en bodega
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>
      </div>

      {/* 3. Essential Metrics: 4 clean, focused cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: En Bodega */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              En Bodega
            </span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalQuantity}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Unidades listas para uso</p>
          </div>
        </div>

        {/* Metric 2: En Obra / Proyecto */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              En Obra / Proyecto
            </span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{deployedCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Equipos asignados fuera</p>
          </div>
        </div>

        {/* Metric 3: Alertas / Stock Bajo */}
        <div 
          onClick={() => setActiveFilter(alertsTotal > 0 ? 'ALERTS' : 'ALL')}
          className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            alertsTotal > 0 
              ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400/60' 
              : 'bg-[#0f172a]/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              alertsTotal > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}>
              Alertas / Revisión
            </span>
            {alertsTotal > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold font-mono ${
              alertsTotal > 0 ? 'text-amber-300' : 'text-slate-200'
            }`}>
              {alertsTotal}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {alertsTotal > 0 ? `${lowStockCount} stock bajo • ${inMaintenanceCount} en taller` : 'Inventario al día'}
            </p>
          </div>
        </div>

        {/* Metric 4: Total Movimientos */}
        <div 
          onClick={onViewAllTransactions}
          className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Historial
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{transactions.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Movimientos registrados</p>
          </div>
        </div>
      </div>

      {/* 4. Main Two-Section Grid: Simplified Inventory (Left) & Recent Movements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Quick Inventory View */}
        <div className="lg:col-span-2 bg-[#0f172a]/85 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title & Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Resumen de Inventario
                </h2>
                <p className="text-xs text-slate-400">
                  Consulta rápida de disponibilidad y estado
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ítem o código..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  activeFilter === 'ALL'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos ({assets.length})
              </button>
              <button
                onClick={() => setActiveFilter('IN_STOCK')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  activeFilter === 'IN_STOCK'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                En Bodega
              </button>
              <button
                onClick={() => setActiveFilter('DEPLOYED')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  activeFilter === 'DEPLOYED'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                En Obra ({deployedCount})
              </button>
              <button
                onClick={() => setActiveFilter('ALERTS')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeFilter === 'ALERTS'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <span>Alertas</span>
                {alertsTotal > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {alertsTotal}
                  </span>
                )}
              </button>
            </div>

            {/* Asset List (Clean, high legibility cards/rows) */}
            <div className="divide-y divide-slate-800/80">
              {previewAssets.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No se encontraron ítems con los filtros aplicados.
                </div>
              ) : (
                previewAssets.map((asset, idx) => {
                  const isLow = asset.quantity <= asset.minQuantity;
                  return (
                    <div
                      key={`dash-asset-${asset.id}-${idx}`}
                      onClick={() => onSelectAsset(asset)}
                      className="py-3 px-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      {/* Asset Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors truncate">
                            {asset.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-slate-300 text-[11px]">
                              {asset.modelNumber || asset.id}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              {asset.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock & Status */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white font-mono">
                            {asset.quantity} <span className="text-xs font-normal text-slate-400">un.</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            asset.status === 'In Stock'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : asset.status === 'Deployed'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                              : isLow
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          }`}>
                            {asset.status === 'In Stock' ? 'Disponible' : asset.status === 'Deployed' ? 'En Obra' : isLow ? 'Stock Bajo' : 'En Taller'}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Mostrando {previewAssets.length} de {filteredAssets.length} ítems
            </span>
            <button
              onClick={onViewCatalog}
              id="btn-dashboard-view-catalog"
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right (1 Col): Recent Movements (Clear & Scannable Feed) */}
        <div className="bg-[#0f172a]/85 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-bold text-white">Actividad Reciente</h2>
              </div>
              <button
                onClick={onViewAllTransactions}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                Ver todo
              </button>
            </div>

            {/* List of recent transactions */}
            <div className="divide-y divide-slate-800/80 mt-2">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No hay movimientos recientes registrados.
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isIN = tx.type === 'IN';
                  return (
                    <div key={tx.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isIN 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isIN ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isIN ? 'Entrada' : 'Salida'}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {tx.timestamp}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white truncate">
                        {tx.assetName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {isIN ? 'A bodega' : tx.destinationProject || tx.location || 'Obra'} • {tx.quantity} un.
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {tx.operatorName || tx.operator}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom helper badge */}
          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sistema en línea</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              v2.4 • METTAV
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
