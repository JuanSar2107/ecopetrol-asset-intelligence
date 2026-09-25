import React, { useState, useRef } from 'react';
import { ToolAsset, UserProfile, AssetCategory, CategoryOption } from '../types';
import { 
  X, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Wrench,
  AlertCircle,
  Upload,
  Sparkles,
  Camera,
  Trash2,
  Boxes,
  FileText
} from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAddAsset: (newAsset: Omit<ToolAsset, 'history'>) => void;
  onSwitchToAdmin?: () => void;
  categories?: CategoryOption[];
  onAddCategory?: (newCategoryName: string) => CategoryOption | null;
}

// Preset machinery and equipment photos for quick selection
const PRESET_MACHINERY_IMAGES = [
  {
    name: 'Centro de Mecanizado CNC 4 Ejes',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    category: 'tools-machining' as AssetCategory,
  },
  {
    name: 'Excavadora Hidráulica 22 Toneladas',
    url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
    category: 'heavy-machinery' as AssetCategory,
  },
  {
    name: 'Generador Diésel Industrial 150 kVA',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    category: 'industrial-equipment' as AssetCategory,
  },
  {
    name: 'Montacargas Eléctrico de Carga 3.5T',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    category: 'logistics-handling' as AssetCategory,
  },
  {
    name: 'Compresor de Tornillo Rotativo 50 HP',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    category: 'industrial-equipment' as AssetCategory,
  },
  {
    name: 'Soldadora Industrial Multiproceso MIG/TIG',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    category: 'tools-machining' as AssetCategory,
  },
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddAsset,
  onSwitchToAdmin,
  categories,
  onAddCategory,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Form states - clean and simple
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [category, setCategory] = useState<AssetCategory>('heavy-machinery');
  const [destinationProject, setDestinationProject] = useState('Construcción & Obras Civiles');
  const [location, setLocation] = useState('Bodega Central Bogotá - Bahía A');
  const [quantity, setQuantity] = useState(2);
  const [minQuantity, setMinQuantity] = useState(1);
  const [manufacturer, setManufacturer] = useState('Caterpillar / Komatsu');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');

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
      setErrorMsg('Solo los administradores pueden crear nuevas categorías.');
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

  // Image states
  const [image, setImage] = useState(PRESET_MACHINERY_IMAGES[0].url);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'presets'>('upload');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File to base64 reader
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor sube un archivo de foto válido (JPG o PNG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La imagen supera los 8 MB.');
      return;
    }

    setImageFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImage(result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer la foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isAdmin) {
      setErrorMsg('Solo los Administradores pueden registrar nuevos ítems.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Escribe el nombre de la maquinaria o equipo.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Por favor escribe una breve descripción de para qué se usa.');
      return;
    }

    setIsSubmitting(true);
    const cleanModel = modelNumber.trim() || `IND-${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `METTAV-${cleanModel.replace(/\s+/g, '-').toUpperCase()}-${randomSuffix}`;
    const finalBarcode = barcode.trim() || `BAR-${generatedId}`;

    const newAsset: Omit<ToolAsset, 'history'> = {
      id: generatedId,
      name: name.trim(),
      modelNumber: cleanModel,
      category,
      aircraftCompatibility: destinationProject.trim() || 'Industria General',
      destinationProject: destinationProject.trim() || 'Industria General',
      quantity,
      minQuantity,
      location: location.trim() || 'Bodega Central Bogotá',
      status: quantity > minQuantity ? 'In Stock' : 'Low Stock',
      image: image || PRESET_MACHINERY_IMAGES[0].url,
      barcode: finalBarcode,
      manufacturer: manufacturer.trim() || 'Fabricante Industrial Certificado',
      weight: 'Variable',
      description: description.trim(),
    };

    setSuccessMsg(true);
    setTimeout(() => {
      onAddAsset(newAsset);
      setSuccessMsg(false);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-sky-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Registrar Maquinaria o Ítem de Inventario</span>
                {isAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                    Modo Admin
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    Solo Lectura
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Ingresa los datos sencillos y la foto para el catálogo central' : 'Función restringida para operadores'}
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

        {/* If user is NOT admin, show polite explanation */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-white">Función Exclusiva del Administrador</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hola, <strong className="text-sky-300">{currentUser.name}</strong>. Como operador puedes consultar las máquinas y registrar salidas o ingresos de bodega. Dar de alta nuevos ítems requiere rol de Administrador.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Volver al Inventario
              </button>
              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToAdmin();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Probar como Administrador</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Simple Admin Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* 1. SECCIÓN DE FOTOGRAFÍA (Petición clave del usuario: debe incluir imagen) */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  1. Foto de la Pieza o Maquinaria (Obligatoria)
                </label>
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 rounded-md transition-all font-medium ${
                      imageMode === 'upload'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Subir mi Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('presets')}
                    className={`px-3 py-1 rounded-md transition-all font-medium ${
                      imageMode === 'presets'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Elegir de Catálogo
                  </button>
                </div>
              </div>

              {/* Subir archivo / arrastrar foto */}
              {imageMode === 'upload' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDraggingFile
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-950/40 hover:border-sky-500/60 hover:bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Toca aquí para seleccionar una foto o arrástrala
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Puedes usar la cámara de tu teléfono o cualquier imagen de la pieza
                    </p>
                  </div>
                </div>
              )}

              {/* Presets rápidos */}
              {imageMode === 'presets' && (
                <div>
                  <p className="text-[11px] text-slate-400 mb-2">Toca una foto para asignarla de inmediato:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_MACHINERY_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImage(preset.url);
                          setImageFileName(preset.name);
                          setCategory(preset.category);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border p-1 bg-slate-950 transition-all ${
                          image === preset.url
                            ? 'border-sky-500 ring-2 ring-sky-500/40'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover rounded"
                        />
                        {image === preset.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista previa seleccionada */}
              {image && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <img
                    src={image}
                    alt="Foto del equipo"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-white truncate">
                      {imageFileName || 'Foto seleccionada para este ítem'}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      ✓ Lista para mostrar en el catálogo y órdenes de movimiento
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. SECCIÓN DE DATOS BÁSICOS */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                2. Información Básica del Ítem / Maquinaria
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre del equipo o maquinaria *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Centro de Mecanizado CNC 4 Ejes"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código, Modelo o Referencia
                  </label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="Ej: CNC-VMC-850"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Categoría
                    </label>
                    {isAdmin && !isCreatingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(true)}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
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
                          setErrorMsg('Solo los administradores pueden registrar nuevas categorías.');
                        }
                      } else {
                        setCategory(e.target.value as AssetCategory);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                    <option disabled className="text-slate-600">────────────────</option>
                    {isAdmin ? (
                      <option value="__NEW_CATEGORY__" className="text-sky-400 font-bold bg-slate-950">
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
                    <div className="mt-2 p-2.5 bg-slate-950 border border-sky-500/50 rounded-xl shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
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
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Proyecto / Destino
                  </label>
                  <input
                    type="text"
                    value={destinationProject}
                    onChange={(e) => setDestinationProject(e.target.value)}
                    placeholder="Ej: Obras Civiles / Minería"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ¿Dónde se guarda? (Ubicación)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Bodega Central Bogotá - Bahía A"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cantidad disponible
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Alerta cuando baje de
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fabricante / Marca
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Ej: Caterpillar, Haas, Siemens"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. SECCIÓN DE DESCRIPCIÓN SENCILLA */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                3. Breve Descripción (Sencilla para cualquier operador) *
              </label>
              <p className="text-[11px] text-slate-400">
                Escribe en 1 o 2 líneas sencillas para qué sirve y sus características clave:
              </p>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ejemplo: Centro de mecanizado vertical de 4 ejes con husillo de 12.000 RPM, ideal para fabricación de moldes y partes de precisión."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>¡Ítem guardado exitosamente en el catálogo con su fotografía!</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={successMsg || isSubmitting}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Ítem en Catálogo</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
