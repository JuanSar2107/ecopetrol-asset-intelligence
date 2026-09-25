import React, { useState } from 'react';
import { ToolAsset, UserProfile, AssetCategory, CategoryOption } from '../types';
import { MettavLogo } from './MettavLogo';
import { EditAssetModal } from './EditAssetModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { 
  Filter, 
  Plus, 
  Search, 
  Eye, 
  Boxes,
  MapPin,
  Tag,
  Shield,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  AlertCircle
} from 'lucide-react';

interface CatalogViewProps {
  assets: ToolAsset[];
  currentUser: UserProfile;
  categories?: CategoryOption[];
  onAddCategory?: (newCategoryName: string) => CategoryOption | null;
  onSelectAsset: (asset: ToolAsset) => void;
  onOpenAddAsset: () => void;
  onEditAsset?: (updatedAsset: ToolAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  onOpenMovementForAsset?: (asset: ToolAsset, type?: 'IN' | 'OUT') => void;
  searchQuery: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const CatalogView: React.FC<CatalogViewProps> = ({
  assets,
  currentUser,
  categories,
  onAddCategory,
  onSelectAsset,
  onOpenAddAsset,
  onEditAsset,
  onDeleteAsset,
  onOpenMovementForAsset,
  searchQuery,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Admin panel state
  const [isAdminPanelExpanded, setIsAdminPanelExpanded] = useState<boolean>(true);
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');

  // Category creation state
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Modals for editing and deleting
  const [editingAsset, setEditingAsset] = useState<ToolAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<ToolAsset | null>(null);

  // Filter assets for general catalog
  const filteredAssets = assets.filter((asset) => {
    // text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        asset.name.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q) ||
        (asset.modelNumber && asset.modelNumber.toLowerCase().includes(q)) ||
        (asset.destinationProject && asset.destinationProject.toLowerCase().includes(q)) ||
        (asset.aircraftCompatibility && asset.aircraftCompatibility.toLowerCase().includes(q)) ||
        (asset.description && asset.description.toLowerCase().includes(q)) ||
        asset.location.toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    // category filter
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
      return false;
    }

    // status filter
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Filter for top admin management list
  const adminFilteredAssets = assets.filter((asset) => {
    if (!adminSearchTerm.trim()) return true;
    const q = adminSearchTerm.toLowerCase();
    return (
      asset.name.toLowerCase().includes(q) ||
      asset.id.toLowerCase().includes(q) ||
      (asset.modelNumber && asset.modelNumber.toLowerCase().includes(q)) ||
      asset.location.toLowerCase().includes(q) ||
      (asset.manufacturer && asset.manufacturer.toLowerCase().includes(q))
    );
  });

  // Category list without emojis for a clean, professional aesthetic
  const categoryList: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los Ítems' },
    ...(categories && categories.length > 0
      ? categories.map((c) => ({ id: c.id, label: c.label }))
      : [
          { id: 'heavy-machinery', label: 'Maquinaria Pesada' },
          { id: 'industrial-equipment', label: 'Equipos Industriales' },
          { id: 'tools-machining', label: 'Herramientas & CNC' },
          { id: 'spare-parts', label: 'Repuestos & Motores' },
          { id: 'safety-protection', label: 'Seguridad Industrial' },
          { id: 'supplies-hardware', label: 'Ferretería & Insumos' },
          { id: 'logistics-handling', label: 'Carga & Logística' },
        ]),
  ];

  const handleCreateNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    const trimmed = newCatInput.trim();
    if (!trimmed) {
      setCategoryError('Ingresa un nombre para la categoría.');
      return;
    }
    if (onAddCategory) {
      const created = onAddCategory(trimmed);
      if (created) {
        setSelectedCategory(created.id);
        setIsAddingCategory(false);
        setNewCatInput('');
        setCategoryError(null);
      }
    } else {
      setIsAddingCategory(false);
      setNewCatInput('');
    }
  };

  const handleSaveEdit = (updatedAsset: ToolAsset) => {
    if (onEditAsset) {
      onEditAsset(updatedAsset);
    }
  };

  const handleConfirmDelete = (assetId: string) => {
    if (onDeleteAsset) {
      onDeleteAsset(assetId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section with MettavLogo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MettavLogo size="sm" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Control de Suministros
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Catálogo de Maquinaria, Equipos y Repuestos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maquinaria pesada, equipos industriales, repuestos e insumos suministrados por METTAV GROUP SAS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              showFilters || selectedCategory !== 'all'
                ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros {selectedCategory !== 'all' && '•'}</span>
          </button>

          {/* Add Asset Button (Admin Exclusive) */}
          {isAdmin && (
            <button
              onClick={onOpenAddAsset}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Ítem</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO SUPERIOR EXCLUSIVO PARA ADMINISTRADORES: GESTIÓN Y EDICIÓN       */}
      {/* ========================================================================= */}
      {isAdmin && (
        <section className="bg-gradient-to-r from-slate-900/95 via-[#0c1527]/95 to-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-500/5 transition-all">
          {/* Cabecera del Apartado de Administrador */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Exclusivo Administrador
                  </span>
                  <span className="text-xs text-slate-400">
                    Control Total del Catálogo ({assets.length} ítems en sistema)
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                  Gestión y Edición Directa de Ítems
                </h2>
              </div>
            </div>

            {/* Acciones de la cabecera del panel admin */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={onOpenAddAsset}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Ítem</span>
              </button>
              <button
                onClick={() => setIsAdminPanelExpanded(!isAdminPanelExpanded)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title={isAdminPanelExpanded ? 'Plegar apartado' : 'Desplegar apartado'}
              >
                <span>{isAdminPanelExpanded ? 'Ocultar Panel' : 'Gestionar Ítems'}</span>
                {isAdminPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Contenido desplegable con la lista interactiva de edición y eliminación */}
          {isAdminPanelExpanded && (
            <div className="mt-4 space-y-3">
              {/* Barra de búsqueda rápida dentro del panel de administración */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="Buscar ítem para editar o eliminar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Mostrando <strong className="text-white">{adminFilteredAssets.length}</strong> de {assets.length} ítems
                  </span>
                </div>
              </div>

              {/* Lista horizontal / tarjetas compactas de gestión rápida */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {adminFilteredAssets.map((asset, idx) => (
                  <div
                    key={`admin-item-${asset.id}-${idx}`}
                    className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors group"
                  >
                    {/* Miniatura de la maquinaria con fallback */}
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      <img
                        src={asset.image || FALLBACK_IMAGE}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    {/* Información del Ítem */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="text-amber-400/90 font-medium">CÓD: {asset.modelNumber || asset.id}</span>
                        <span>•</span>
                        <span className="text-sky-400 font-bold">Stock: {asset.quantity}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{asset.location}</span>
                      </p>
                    </div>

                    {/* Botones de acción directa: Editar y Eliminar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-all cursor-pointer"
                        title={`Editar datos de ${asset.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingAsset(asset)}
                        className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                        title={`Eliminar ${asset.name} del inventario`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Category Pills Bar (Professional, no emojis, with admin category creation) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* Admin button to add category at end of list */}
        {isAdmin && !isAddingCategory && (
          <button
            type="button"
            onClick={() => {
              setIsAddingCategory(true);
              setCategoryError(null);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-900/80 hover:bg-sky-500/10 text-sky-400 border border-dashed border-sky-500/40 hover:border-sky-400 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Crear nueva categoría en el sistema (Solo Administrador)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Inline category creator in Catalog (Admin only) */}
      {isAdmin && isAddingCategory && (
        <form
          onSubmit={handleCreateNewCategory}
          className="p-3 bg-slate-900/95 border border-sky-500/50 rounded-xl flex flex-wrap items-center gap-2 shadow-xl animate-in fade-in duration-150"
        >
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Nueva Categoría:
          </span>
          <input
            type="text"
            value={newCatInput}
            onChange={(e) => {
              setNewCatInput(e.target.value);
              if (categoryError) setCategoryError(null);
            }}
            placeholder="Ej: Instrumentación & Sensores"
            className="flex-1 min-w-[220px] bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            autoFocus
          />
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Crear Categoría
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(false);
                setNewCatInput('');
                setCategoryError(null);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
          {categoryError && (
            <p className="w-full text-[11px] text-rose-400 font-medium">{categoryError}</p>
          )}
        </form>
      )}

      {/* Filter by Status (Visible if filters opened) */}
      {showFilters && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs uppercase font-semibold text-slate-400 whitespace-nowrap">Estado:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'In Stock', label: 'Disponibles' },
            { id: 'Deployed', label: 'En Proyecto / Obra' },
            { id: 'Maintenance', label: 'En Taller' },
            { id: 'Low Stock', label: 'Poco Stock' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      )}

      {/* Parts Count */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-white font-medium">{filteredAssets.length}</strong> ítems y maquinaria
          {searchQuery && ` para "${searchQuery}"`}
        </span>
        <span className="text-sky-400 font-medium">
          Bodegas & Operaciones Nacionales
        </span>
      </div>

      {/* Grid of Machinery & Supplies Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredAssets.map((asset, idx) => {
          const statusStyles = {
            'In Stock': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            'Low Stock': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            'Critical Stock': 'bg-rose-500/30 text-rose-300 border-rose-500/50',
            'Deployed': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
            'Maintenance': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            'In Transit': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          }[asset.status] || 'bg-slate-800 text-slate-300 border-slate-700';

          const statusLabels: Record<string, string> = {
            'In Stock': 'En Stock',
            'Low Stock': 'Poco Stock',
            'Critical Stock': 'Agotándose',
            'Deployed': 'En Proyecto',
            'Maintenance': 'En Taller',
            'In Transit': 'En Envío',
          };

          return (
            <article
              key={`catalog-asset-${asset.id}-${idx}`}
              className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col group h-full hover:border-sky-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Photo with status badge & optional admin controls */}
              <div 
                onClick={() => onSelectAsset(asset)}
                className="aspect-video relative border-b border-slate-800 overflow-hidden bg-slate-950 cursor-pointer"
              >
                <img
                  src={asset.image || FALLBACK_IMAGE}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                <div className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border backdrop-blur-md whitespace-nowrap shadow-md select-none ${statusStyles}`}>
                  {statusLabels[asset.status] || asset.status}
                </div>

                {/* Destination tag */}
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/85 border border-slate-700 text-[10px] font-semibold text-sky-300 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{asset.destinationProject || asset.aircraftCompatibility || 'Uso Industrial'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <div className="mb-2">
                    <h3 
                      onClick={() => onSelectAsset(asset)}
                      className="font-bold text-white text-base hover:text-sky-300 transition-colors cursor-pointer line-clamp-1"
                      title={asset.name}
                    >
                      {asset.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">CÓD: {asset.modelNumber || asset.id}</p>
                  </div>

                  {/* Simple Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {asset.description || 'Maquinaria y equipo industrial para proyectos y suministros generales.'}
                  </p>

                  {/* Location and Stock */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                    <div className="flex items-center gap-1 truncate max-w-[170px]" title={asset.location}>
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                    <div className="font-mono text-white font-bold whitespace-nowrap">
                      Stock: <span className="text-sky-400">{asset.quantity} un.</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer with View Info & Admin Quick Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-sky-500/10 border border-slate-700/90 hover:border-sky-500/60 rounded-xl text-white hover:text-sky-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.99]"
                    title="Ver ficha técnica, ubicación y movimientos del ítem"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ver Información</span>
                  </button>

                  {/* Quick Admin Actions directly on card */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="p-2 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
                        title="Editar ítem"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAsset(asset)}
                        className="p-2 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl transition-all cursor-pointer"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron ítems</h3>
          <p className="text-xs text-slate-400">
            Prueba buscando con otro nombre, código o ubicación de almacén.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Edit Asset Modal (Admin Only) */}
      {editingAsset && (
        <EditAssetModal
          isOpen={Boolean(editingAsset)}
          onClose={() => setEditingAsset(null)}
          asset={editingAsset}
          currentUser={currentUser}
          categories={categories}
          onAddCategory={onAddCategory}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Modal (Admin Only) */}
      {deletingAsset && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingAsset)}
          onClose={() => setDeletingAsset(null)}
          asset={deletingAsset}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};
