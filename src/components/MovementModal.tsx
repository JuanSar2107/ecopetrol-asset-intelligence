import React, { useState, useEffect } from 'react';
import { ToolAsset, UserProfile } from '../types';
import { MettavLogo } from './MettavLogo';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Save, 
  AlertCircle,
  MapPin,
  FileText
} from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'IN' | 'OUT';
  preSelectedAsset?: ToolAsset | null;
  assets: ToolAsset[];
  currentUser: UserProfile;
  onSubmitMovement: (data: {
    type: 'IN' | 'OUT';
    assetId: string;
    quantity: number;
    location: string;
    workOrder?: string;
    notes?: string;
    withdrawalReason?: string;
  }) => void;
  onOpenScanner?: () => void;
}

const COMMON_INDUSTRIAL_OUT_REASONS = [
  'Despacho a obra o cliente final',
  'Envío a proyecto de construcción / minería',
  'Traslado a taller para mantenimiento',
  'Uso en línea de montaje o mecanizado',
];

const COMMON_INDUSTRIAL_IN_REASONS = [
  'Recepción de nuevo lote de proveedor',
  'Devolución tras finalización de obra',
  'Retorno de herramienta o equipo a bodega',
  'Reingreso tras mantenimiento preventivo',
];

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'IN',
  preSelectedAsset = null,
  assets,
  currentUser,
  onSubmitMovement,
  onOpenScanner,
}) => {
  const [type, setType] = useState<'IN' | 'OUT'>(defaultType);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(preSelectedAsset?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [location, setLocation] = useState<string>('Obra Proyecto Industrial');
  const [workOrder, setWorkOrder] = useState<string>('OT-IND-8820');
  const [withdrawalReason, setWithdrawalReason] = useState<string>('Despacho a obra o cliente final');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      if (defaultType === 'OUT') {
        setWithdrawalReason(COMMON_INDUSTRIAL_OUT_REASONS[0]);
        setLocation(preSelectedAsset ? `Despacho a ${preSelectedAsset.destinationProject || 'Obra / Cliente'}` : 'Obra Autopista Norte');
      } else {
        setWithdrawalReason(COMMON_INDUSTRIAL_IN_REASONS[0]);
        setLocation(preSelectedAsset?.location || 'Bodega Central Bogotá');
      }
      if (preSelectedAsset) {
        setSelectedAssetId(preSelectedAsset.id);
      } else if (assets.length > 0 && !selectedAssetId) {
        setSelectedAssetId(assets[0].id);
      }
      setQuantity(1);
      setErrorMsg(null);
      setSuccessMsg(false);
    }
  }, [isOpen, defaultType, preSelectedAsset]);

  const currentAsset = assets.find((a) => a.id === selectedAssetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentAsset) {
      setErrorMsg('Por favor selecciona una pieza o herramienta');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('La cantidad debe ser mínimo 1');
      return;
    }

    // If OUT, verify available stock
    if (type === 'OUT' && currentAsset.quantity < quantity) {
      setErrorMsg(`Solo hay ${currentAsset.quantity} unidades disponibles en bodega.`);
      return;
    }

    setSuccessMsg(true);
    setTimeout(() => {
      onSubmitMovement({
        type,
        assetId: currentAsset.id,
        quantity,
        location,
        workOrder,
        notes: notes.trim() || undefined,
        withdrawalReason: withdrawalReason.trim(),
      });
      setSuccessMsg(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-sky-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <MettavLogo size="sm" />
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>{type === 'IN' ? 'Devolver / Guardar en Bodega' : 'Sacar / Despachar para Obra o Cliente'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  type === 'IN' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {type === 'IN' ? '↓ Entrada' : '↑ Despacho'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Control ágil para operadores y encargados de logística
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setType('IN');
                setWithdrawalReason(COMMON_INDUSTRIAL_IN_REASONS[0]);
                setLocation(currentAsset?.location || 'Bodega Central Bogotá');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm cursor-pointer ${
                type === 'IN'
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Guardar / Devolver</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('OUT');
                setWithdrawalReason(COMMON_INDUSTRIAL_OUT_REASONS[0]);
                setLocation('Obra Proyecto Industrial');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm cursor-pointer ${
                type === 'OUT'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Sacar / Despachar</span>
            </button>
          </div>

          {/* Piece selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Ítem de Inventario / Maquinaria
              </label>
            </div>

            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {assets.map((asset, idx) => (
                <option key={`mov-opt-${asset.id}-${idx}`} value={asset.id} className="bg-slate-900 text-white">
                  {asset.name} (Stock: {asset.quantity} un.)
                </option>
              ))}
            </select>

            {/* Selected asset pill */}
            {currentAsset && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <img
                  src={currentAsset.image}
                  alt={currentAsset.name}
                  className="w-11 h-11 object-cover rounded-lg border border-slate-700"
                />
                <div className="flex-1 text-xs min-w-0">
                  <div className="font-semibold text-white truncate">{currentAsset.name}</div>
                  <div className="flex gap-2 text-slate-400 mt-0.5">
                    <span>Destino: {currentAsset.destinationProject || currentAsset.aircraftCompatibility || 'General'}</span>
                    <span>•</span>
                    <span className="text-sky-400 font-medium">Hay: {currentAsset.quantity} un.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Worker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Cantidad a {type === 'IN' ? 'Guardar' : 'Sacar'}
              </label>
              <input
                type="number"
                min="1"
                max={type === 'OUT' && currentAsset ? currentAsset.quantity : 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Operador que Registra
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name}`}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-400 cursor-not-allowed truncate"
              />
            </div>
          </div>

          {/* Destination / Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{type === 'OUT' ? '¿A qué Proyecto, Obra o Cliente va destinado?' : '¿En qué Bodega o Pasillo se guardará?'}</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Obra Autopista Norte o Bodega Central Bogotá"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {/* Simple reasons buttons */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Motivo del Movimiento</span>
            </label>
            
            <div className="flex flex-wrap gap-1.5">
              {(type === 'OUT' ? COMMON_INDUSTRIAL_OUT_REASONS : COMMON_INDUSTRIAL_IN_REASONS).map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWithdrawalReason(reason)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    withdrawalReason === reason
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={withdrawalReason}
              onChange={(e) => setWithdrawalReason(e.target.value)}
              placeholder="Escribe brevemente por qué se mueve o algún detalle útil..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
              required
            />
          </div>

          {/* Work order and notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Orden de Trabajo / Remisión
              </label>
              <input
                type="text"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                placeholder="Ej: OT-8820 o REM-5510"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Nota Opcional
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Con precinto aprobado"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Errors or Feedback */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>¡Movimiento guardado con éxito! Actualizando inventario...</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={successMsg}
              className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                type === 'IN'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Confirmar {type === 'IN' ? 'Entrada' : 'Salida'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
