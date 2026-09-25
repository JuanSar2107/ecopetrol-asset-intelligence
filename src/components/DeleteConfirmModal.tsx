import React from 'react';
import { ToolAsset } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ToolAsset | null;
  onConfirmDelete: (assetId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  asset,
  onConfirmDelete,
}) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#090e1a] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            Confirmación de Baja de Activo
          </span>
          <h3 className="text-lg font-bold text-white mt-2">
            ¿Eliminar este ítem del catálogo?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Estás a punto de dar de baja permanentemente:
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{asset.name}</h4>
              <p className="text-xs text-slate-400 font-mono">CÓD: {asset.modelNumber || asset.id}</p>
              <p className="text-[11px] text-sky-400">Stock actual: {asset.quantity} unidades</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Esta acción eliminará el ítem del catálogo general de METTAV GROUP SAS.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(asset.id);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Ítem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
