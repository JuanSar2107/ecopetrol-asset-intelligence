import React, { useState, useEffect, useRef } from 'react';
import { ToolAsset, UserProfile, AssetCategory, AssetStatus, CategoryOption } from '../types';
import { 
  X, 
  Save, 
  Upload, 
  Camera, 
  Trash2, 
  Boxes, 
  MapPin, 
  Tag, 
  AlertCircle,
  Building2,
  Layers,
  Plus
} from 'lucide-react';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ToolAsset | null;
  currentUser: UserProfile;
  onSave: (updatedAsset: ToolAsset) => void;
  categories?: CategoryOption[];
  onAddCategory?: (newCategoryName: string) => CategoryOption | null;
}

const PRESET_MACHINERY_IMAGES = [
  {
    name: 'Centro de Mecanizado CNC',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Excavadora Hidráulica',
    url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Generador Diésel Industrial',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Montacargas Eléctrico',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bomba & Motor Trifásico',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Herramientas de Precisión',
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
  },
];

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  currentUser,
  onSave,
  categories,
  onAddCategory,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Form states initialized safely with current asset values or fallbacks
  const [name, setName] = useState(asset?.name || '');
  const [modelNumber, setModelNumber] = useState(asset?.modelNumber || '');
  const [category, setCategory] = useState<AssetCategory>(asset?.category || 'heavy-machinery');
  const [destinationProject, setDestinationProject] = useState(
    asset?.destinationProject || asset?.aircraftCompatibility || ''
  );
  const [location, setLocation] = useState(asset?.location || '');
  const [quantity, setQuantity] = useState(asset?.quantity ?? 1);
  const [minQuantity, setMinQuantity] = useState(asset?.minQuantity || 1);
  const [manufacturer, setManufacturer] = useState(asset?.manufacturer || '');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || 'In Stock');
  const [description, setDescription] = useState(asset?.description || '');
  const [image, setImage] = useState(asset?.image || PRESET_MACHINERY_IMAGES[0].url);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'current' | 'upload' | 'presets'>('current');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category creation states
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const activeCategories = categories && categories.length > 0 ? categories : [
    { id: 'heavy-machinery', label: 'Maquinaria Pesada' },
    { id: 'industrial-equipment', label: 'Equipos Industriales' },
    { id: 'tools-machining', label: 'Herramientas & CNC' },
    { id: 'spare-parts', label: 'Repuestos & Motores' },
    { id: 'safety-protection', label: 'Seguridad Industrial' },
    { id: 'supplies-hardware', label: 'Ferretería & Insumos' },
    { id: 'logistics-handling', label: 'Carga & Logística' },
  ];

  const handleAddNewCategory = () => {
    if (!isAdmin) {
      setErrorMsg('Solo los administradores pueden registrar nuevas categorías.');
      return;
    }
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setErrorMsg('Escribe el nombre de la nueva categoría.');
      return;
    }
    if (onAddCategory) {
      const created = onAddCategory(trimmed);
      if (created) {
        setCategory(created.id);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setErrorMsg(null);
      }
    } else {
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if selected asset changes
  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setModelNumber(asset.modelNumber || '');
      setCategory(asset.category);
      setDestinationProject(asset.destinationProject || asset.aircraftCompatibility || '');
      setLocation(asset.location);
      setQuantity(asset.quantity);
      setMinQuantity(asset.minQuantity || 1);
      setManufacturer(asset.manufacturer || '');
      setStatus(asset.status);
      setDescription(asset.description || '');
      setImage(asset.image);
      setImageFileName(null);
      setImageMode('current');
      setErrorMsg(null);
    }
  }, [asset]);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor sube un archivo de foto válido (JPG o PNG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La imagen supera los 8 MB de tamaño.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImage(result);
        setImageFileName(file.name);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setErrorMsg('Permiso Denegado: Solo administradores pueden editar ítems.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('El nombre de la maquinaria o ítem es obligatorio.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('La ubicación en bodega es obligatoria.');
      return;
    }

    const updatedAsset: ToolAsset = {
      ...asset,
      name: name.trim(),
      modelNumber: modelNumber.trim() || asset.id,
      category,
      destinationProject: destinationProject.trim() || 'Operaciones & Suministro Industrial',
      aircraftCompatibility: destinationProject.trim() || 'Operaciones & Suministro Industrial',
      location: location.trim(),
      quantity: Math.max(0, quantity),
      minQuantity: Math.max(0, minQuantity),
      manufacturer: manufacturer.trim() || 'METTAV INDUSTRIAL',
      status,
      description: description.trim(),
      image,
    };

    onSave(updatedAsset);
    onClose();
  };

  // Only render modal if open and valid asset is provided (after all hooks have run)
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090e1a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Panel Administrador
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {asset.id}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Editar Ítem o Maquinaria
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Nombre y Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Maquinaria / Herramienta *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código / Nro. Parte
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Categoría y Fabricante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Categoría *
                </label>
                {isAdmin && !isCreatingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    title="Crear nueva categoría en el sistema"
                  >
                    + Nueva
                  </button>
                )}
              </div>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__NEW_CATEGORY__') {
                    if (isAdmin) {
                      setIsCreatingCategory(true);
                    } else {
                      setErrorMsg('Solo los administradores pueden crear nuevas categorías.');
                    }
                  } else {
                    setCategory(e.target.value as AssetCategory);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:border-amber-500 focus:outline-none cursor-pointer text-sm"
              >
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
                <option disabled className="text-slate-600">────────────────</option>
                {isAdmin ? (
                  <option value="__NEW_CATEGORY__" className="text-amber-400 font-bold bg-slate-950">
                    + Agregar nueva categoría...
                  </option>
                ) : (
                  <option disabled value="__NO_ADMIN__" className="text-slate-500">
                    + Agregar nueva categoría (Solo Admin)
                  </option>
                )}
              </select>

              {/* Creador inline de nueva categoría (Exclusivo Administrador) */}
              {isCreatingCategory && (
                <div className="mt-2 p-2.5 bg-slate-950 border border-amber-500/50 rounded-xl shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Nueva Categoría (Admin)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej: Instrumentación & Sensores"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fabricante / Marca
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ubicación y Proyecto / Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ubicación en Bodega *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proyecto / Aplicación Destino
              </label>
              <input
                type="text"
                value={destinationProject}
                onChange={(e) => setDestinationProject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stock, Stock Mínimo y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estado Operativo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="In Stock">En Stock (Disponible)</option>
                <option value="Low Stock">Poco Stock</option>
                <option value="Deployed">En Proyecto / Obra</option>
                <option value="Maintenance">En Mantenimiento (Taller)</option>
                <option value="In Transit">En Envío / Tránsito</option>
              </select>
            </div>
          </div>

          {/* Imagen de Maquinaria */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Fotografía del Ítem
              </label>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('current')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    imageMode === 'current' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Actual
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    imageMode === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Subir Foto
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('presets')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    imageMode === 'presets' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Galería
                </button>
              </div>
            </div>

            {/* Vista previa y carga */}
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0">
                <img
                  src={image}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {imageMode === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 p-3 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDraggingFile ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs text-slate-300">
                    {imageFileName || 'Haz clic o arrastra una nueva imagen'}
                  </span>
                </div>
              )}

              {imageMode === 'presets' && (
                <div className="flex-1 grid grid-cols-3 gap-1.5 max-h-20 overflow-y-auto">
                  {PRESET_MACHINERY_IMAGES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`h-9 rounded-lg overflow-hidden border relative cursor-pointer ${
                        image === p.url ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {imageMode === 'current' && (
                <div className="flex-1 text-xs text-slate-400">
                  Foto actualmente asignada al ítem. Puedes mantenerla o cambiarla seleccionando "Subir Foto".
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción y Especificaciones Técnicas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla potencia, capacidad, especificaciones o recomendaciones..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
