import React, { useState } from 'react';
import { ToolAsset, UserProfile, CategoryOption } from '../types';
import { EditAssetModal } from './EditAssetModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2,
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Timer, 
  MapPin, 
  Lock, 
  Tag,
  Boxes,
  FileCheck,
  Wrench,
  ShieldCheck
} from 'lucide-react';

interface DetailViewProps {
  asset: ToolAsset;
  currentUser: UserProfile;
  onBack: () => void;
  onOpenMovement: (asset: ToolAsset, type?: 'IN' | 'OUT') => void;
  onEditAsset?: (asset: ToolAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  onOpenScanner?: () => void;
  categories?: CategoryOption[];
  onAddCategory?: (newCategoryName: string) => CategoryOption | null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const DetailView: React.FC<DetailViewProps> = ({
  asset,
  currentUser,
  onBack,
  onOpenMovement,
  onEditAsset,
  onDeleteAsset,
  categories,
  onAddCategory,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Flight/operating hours
  const flightHours = asset.operatingHours || 420;
  const maxHours = asset.maxOperatingHours || 1200;
  const percentHours = Math.min(100, Math.round((flightHours / maxHours) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors text-xs font-semibold uppercase tracking-wider mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Catálogo</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {asset.name}
            </h1>
            {(() => {
              const statusConfig = {
                'In Stock': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'Disponible en Bodega' },
                'Low Stock': { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'Stock Mínimo' },
                'Critical Stock': { color: 'bg-rose-500/30 text-rose-300 border-rose-500/50', label: 'Agotándose' },
                'Deployed': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', label: 'En Operación / Obra' },
                'Maintenance': { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'En Taller / Mantenimiento' },
                'In Transit': { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'En Envío' },
              }[asset.status] || { color: 'bg-slate-800 text-slate-300 border-slate-700', label: asset.status };

              return (
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${statusConfig.color}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{statusConfig.label}</span>
                </span>
              );
            })()}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 tracking-wide font-mono">
            Código: <span className="text-white">{asset.id}</span> | Modelo/Ref: <span className="text-sky-400">{asset.modelNumber || 'REF-8820'}</span> | Serie/Lote: <span className="text-white">{asset.batch || 'SN-7721'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Management Actions */}
          {isAdmin && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs sm:text-sm border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Editar especificaciones, stock y datos del ítem"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Ítem</span>
              </button>

              <button
                onClick={() => setIsDeleting(true)}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs sm:text-sm border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Dar de baja este ítem del catálogo"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </>
          )}

          {/* Movement Buttons for any operator */}
          <button
            onClick={() => onOpenMovement(asset, 'OUT')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Sacar / Despachar</span>
          </button>

          <button
            onClick={() => onOpenMovement(asset, 'IN')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Guardar en Bodega</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Big Visual Image & Part Specs */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-sky-500/40 transition-all">
            {/* Image Container with high visibility */}
            <div className="aspect-video sm:aspect-square bg-slate-950 rounded-xl overflow-hidden mb-5 relative border border-slate-800 flex items-center justify-center">
              <img
                src={asset.image || FALLBACK_IMAGE}
                alt={asset.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />

              {/* Tag for destination project */}
              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>{asset.destinationProject || asset.aircraftCompatibility || 'Uso Industrial'}</span>
              </div>

              {/* Stock in corner */}
              <div className="absolute top-3 right-3 bg-slate-950/90 border border-sky-500/30 px-3 py-1 rounded-lg text-xs font-bold text-sky-300">
                Stock: {asset.quantity} un.
              </div>
            </div>

            {/* Primary Specs List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Datos Técnicos del Ítem
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Fabricante / Marca</p>
                  <p className="text-white font-medium mt-0.5">{asset.manufacturer || 'METTAV / OEM Certificado'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Categoría</p>
                  <p className="text-sky-300 font-medium mt-0.5">{asset.category}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Horas de Uso</p>
                  <p className="text-white font-mono mt-0.5">{asset.operatingHours || 0} hrs</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Peso Estimado</p>
                  <p className="text-white font-mono mt-0.5">{asset.weight || 'Estándar'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Ubicación en Bodega / Pasillo</p>
                  <p className="text-white mt-0.5 font-medium flex items-center gap-1 text-sky-300">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{asset.location}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Description & Movement History */}
        <div className="xl:col-span-7 space-y-6 flex flex-col">
          {/* Description Card (clear, readable for any worker) */}
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              <span>Descripción y Aplicación Industrial</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {asset.description || 'Maquinaria o insumo industrial para proyectos de construcción, manufactura y suministros.'}
            </p>
            <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Control de Calidad METTAV GROUP SAS</span>
              </span>
              <span>Destino: <strong className="text-white">{asset.destinationProject || asset.aircraftCompatibility || 'Operación General'}</strong></span>
            </div>
          </div>

          {/* Horas de Uso & Estado de Vida Útil */}
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Horas de Operación / Ciclos Acumulados
                </span>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {flightHours} <span className="text-xs text-slate-400">/ {maxHours} hrs límite overhaul o mantenimiento</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-sky-400">{percentHours}% utilizado</span>
                <p className="text-[11px] text-slate-400">Mantenimiento preventivo programado</p>
              </div>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  percentHours > 80 ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${percentHours}%` }}
              />
            </div>
          </div>

          {/* Movement History Table */}
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Historial de Movimientos de este Ítem</span>
              </h3>
              <button
                onClick={() => onOpenMovement(asset)}
                className="text-sky-400 hover:text-sky-300 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>+ Registrar Movimiento</span>
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Acción</th>
                    <th className="py-2.5 px-3">Destino / Cliente</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(asset.history && asset.history.length > 0
                    ? asset.history
                    : [
                        {
                          id: 'def-1',
                          date: '2026-08-25 08:30',
                          action: 'Ingreso inicial a Bodega',
                          location: asset.location,
                          operator: currentUser.name,
                          status: 'Available' as const,
                        },
                      ]
                  ).map((entry, index) => (
                    <tr key={entry.id || index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{entry.date}</td>
                      <td className="py-2.5 px-3 text-white font-medium">{entry.action}</td>
                      <td className="py-2.5 px-3 text-slate-300">{entry.location}</td>
                      <td className="py-2.5 px-3 text-slate-300">{entry.operator}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {entry.status === 'Available' ? 'Disponible' : entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Admin Only) */}
      {isEditing && (
        <EditAssetModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          asset={asset}
          currentUser={currentUser}
          categories={categories}
          onAddCategory={onAddCategory}
          onSave={(updated) => {
            if (onEditAsset) onEditAsset(updated);
            setIsEditing(false);
          }}
        />
      )}

      {/* Delete Modal (Admin Only) */}
      {isDeleting && (
        <DeleteConfirmModal
          isOpen={isDeleting}
          onClose={() => setIsDeleting(false)}
          asset={asset}
          onConfirmDelete={(id) => {
            if (onDeleteAsset) onDeleteAsset(id);
            setIsDeleting(false);
          }}
        />
      )}
    </div>
  );
};
