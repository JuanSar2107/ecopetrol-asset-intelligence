import React, { useState, useEffect } from 'react';
import { AppView, ToolAsset, MovementTransaction, UserProfile, CategoryOption } from './types';
import { INITIAL_USERS, INITIAL_ASSETS, INITIAL_TRANSACTIONS, INITIAL_CATEGORIES } from './data/initialData';
import { playScanSound } from './utils/audio';

import { TopHeader } from './components/TopHeader';
import { NavigationSidebar } from './components/NavigationSidebar';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { DetailView } from './components/DetailView';
import { TransactionsView } from './components/TransactionsView';
import { AdminAuditView } from './components/AdminAuditView';
import { LoginView } from './components/LoginView';
import { MovementModal } from './components/MovementModal';
import { AddAssetModal } from './components/AddAssetModal';
import { MettavLogo } from './components/MettavLogo';

import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Boxes
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Application navigation & view
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<ToolAsset | null>(INITIAL_ASSETS[0]);

  // Inventory & logs state
  const [assets, setAssets] = useState<ToolAsset[]>(() => {
    const seen = new Set<string>();
    return INITIAL_ASSETS.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });
  const [transactions, setTransactions] = useState<MovementTransaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<CategoryOption[]>(INITIAL_CATEGORIES);

  // UI Modals & controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementDefaultType, setMovementDefaultType] = useState<'IN' | 'OUT'>('IN');
  const [movementPreSelectedAsset, setMovementPreSelectedAsset] = useState<ToolAsset | null>(null);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Search & Toast notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Switch role between Operator and Admin
  const handleToggleRole = () => {
    if (currentUser.role === 'operator') {
      const adminUser = INITIAL_USERS[1]; // Sofia Ramírez (Supervisor Admin)
      setCurrentUser(adminUser);
      showToast(
        `Rol cambiado a: ${adminUser.name} (Supervisor / Admin) — Auditoría y alta de piezas habilitados.`,
        'success'
      );
    } else {
      const operatorUser = INITIAL_USERS[0]; // Juan Pérez (Mecánico / Operador)
      setCurrentUser(operatorUser);
      if (currentView === 'admin-audit') {
        setCurrentView('dashboard');
      }
      showToast(
        `Rol cambiado a: ${operatorUser.name} (Mecánico / Operador) — Modo simplificado común.`,
        'info'
      );
    }
  };

  // Guard against non-admin accessing admin-only views
  useEffect(() => {
    if (currentUser.role !== 'admin' && currentView === 'admin-audit') {
      setCurrentView('dashboard');
    }
  }, [currentUser.role, currentView]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    showToast(`Bienvenido a METTAV GROUP SAS, ${user.name} (${user.roleTitle})`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLogoutModalOpen(false);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  // Open movement modal
  const handleOpenMovementModal = (type: 'IN' | 'OUT' = 'IN', preSelect?: ToolAsset | null) => {
    setMovementDefaultType(type);
    setMovementPreSelectedAsset(preSelect || selectedAsset || (assets.length > 0 ? assets[0] : null));
    setIsMovementModalOpen(true);
  };

  // Handle asset movement submission
  const handleSubmitMovement = (data: {
    type: 'IN' | 'OUT';
    assetId: string;
    quantity: number;
    location: string;
    workOrder?: string;
    notes?: string;
    withdrawalReason?: string;
  }) => {
    const assetToUpdate = assets.find((a) => a.id === data.assetId);
    if (!assetToUpdate) return;

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newQuantity =
      data.type === 'IN'
        ? assetToUpdate.quantity + data.quantity
        : Math.max(0, assetToUpdate.quantity - data.quantity);

    const newStatus =
      newQuantity <= 0
        ? 'Critical Stock'
        : newQuantity <= assetToUpdate.minQuantity
        ? 'Low Stock'
        : 'In Stock';

    const reasonText = data.withdrawalReason || data.notes || '';

    // Create new transaction
    const newTx: MovementTransaction = {
      id: `TX-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type,
      assetId: assetToUpdate.id,
      assetName: assetToUpdate.name,
      quantity: data.quantity,
      operator: currentUser.name,
      operatorName: currentUser.name,
      operatorDocument: currentUser.documentId,
      operatorId: currentUser.documentId,
      timestamp: formattedDate,
      location: data.location,
      status: 'Completed',
      workOrder: data.workOrder,
      notes: data.notes,
      withdrawalReason: reasonText,
    };

    // Update asset history
    const updatedHistory = [
      {
        id: `hist-${Date.now()}`,
        date: formattedDate,
        action: data.type === 'IN'
          ? `Entrada a Bodega (+${data.quantity})${reasonText ? ` — ${reasonText}` : ''}`
          : `Salida / Despacho (-${data.quantity})${reasonText ? ` — ${reasonText}` : ''}`,
        location: data.location,
        operator: currentUser.name,
        status: (data.type === 'IN' ? 'Available' : 'In Transit') as any,
        reason: reasonText,
      },
      ...(assetToUpdate.history || []),
    ];

    // Update assets state
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetToUpdate.id
          ? {
              ...a,
              quantity: newQuantity,
              status: newStatus,
              location: data.type === 'IN' ? data.location : a.location,
              history: updatedHistory,
            }
          : a
      )
    );

    if (selectedAsset && selectedAsset.id === assetToUpdate.id) {
      setSelectedAsset({
        ...selectedAsset,
        quantity: newQuantity,
        status: newStatus,
        history: updatedHistory,
      });
    }

    setTransactions((prev) => [newTx, ...prev]);

    playScanSound(true);
    showToast(
      `¡Movimiento guardado! ${data.type === 'IN' ? 'Entrada (+)' : 'Salida (-)'} de ${data.quantity} un. para ${assetToUpdate.name}. Stock disponible: ${newQuantity}`,
      'success'
    );
  };

  // Add new asset (Admin only)
  const handleAddAsset = (newAssetData: Omit<ToolAsset, 'history'>) => {
    if (currentUser.role !== 'admin') {
      showToast('Permiso Denegado: Solo el Administrador / Supervisor puede dar de alta maquinaria y equipos.', 'error');
      return;
    }

    // Ensure ID is strictly unique in the collection
    let uniqueId = newAssetData.id;
    let counter = 1;
    while (assets.some((a) => a.id === uniqueId)) {
      uniqueId = `${newAssetData.id}-${counter}`;
      counter++;
    }

    const fullAsset: ToolAsset = {
      ...newAssetData,
      id: uniqueId,
      history: [
        {
          id: `hist-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          action: 'Alta en Catálogo de Inventario',
          location: newAssetData.location,
          operator: currentUser.name,
          status: 'Available',
        },
      ],
    };

    setAssets((prev) => {
      const withoutDup = prev.filter((a) => a.id !== uniqueId);
      return [fullAsset, ...withoutDup];
    });
    setSelectedAsset(fullAsset);
    showToast(`Ítem "${fullAsset.name}" registrado exitosamente en el inventario.`, 'success');
  };

  // Edit existing asset (Admin only)
  const handleEditAsset = (updatedAsset: ToolAsset) => {
    if (currentUser.role !== 'admin') {
      showToast('Permiso Denegado: Solo el Administrador puede editar maquinaria o ítems.', 'error');
      return;
    }

    setAssets((prev) =>
      prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
    );

    if (selectedAsset && selectedAsset.id === updatedAsset.id) {
      setSelectedAsset(updatedAsset);
    }

    showToast(`Ítem "${updatedAsset.name}" actualizado exitosamente.`, 'success');
  };

  // Delete asset (Admin only)
  const handleDeleteAsset = (assetId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Permiso Denegado: Solo el Administrador puede dar de baja ítems.', 'error');
      return;
    }

    const assetToDelete = assets.find((a) => a.id === assetId);
    const assetName = assetToDelete ? assetToDelete.name : assetId;

    setAssets((prev) => prev.filter((a) => a.id !== assetId));

    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(null);
      setCurrentView('catalog');
    }

    showToast(`Ítem "${assetName}" eliminado permanentemente del catálogo.`, 'info');
  };

  // Add new Category (Admin only)
  const handleAddCategory = (newCategoryName: string): CategoryOption | null => {
    if (currentUser.role !== 'admin') {
      showToast('Permiso Denegado: Solo el Administrador puede dar de alta nuevas categorías.', 'error');
      return null;
    }
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showToast('Por favor escribe un nombre válido para la categoría.', 'error');
      return null;
    }
    const id = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = categories.find(
      (c) => c.id === id || c.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      showToast(`La categoría "${existing.label}" ya existe en el catálogo.`, 'info');
      return existing;
    }

    const newCat: CategoryOption = {
      id: id || `cat-${Date.now()}`,
      label: trimmed,
      isCustom: true,
    };

    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoría "${trimmed}" creada exitosamente.`, 'success');
    return newCat;
  };

  // Navigate to asset detail
  const handleSelectAsset = (asset: ToolAsset) => {
    setSelectedAsset(asset);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not logged in, render the Login View
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <TopHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={currentUser}
        onToggleRole={handleToggleRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToAudit={() => setCurrentView('admin-audit')}
      />

      {/* Navigation Sidebar Drawer */}
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'detail') setSelectedAsset(null);
        }}
        currentUser={currentUser}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        onToggleRole={handleToggleRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && (
          <DashboardView
            assets={assets}
            transactions={transactions}
            currentUser={currentUser}
            onOpenAddAsset={() => setIsAddAssetModalOpen(true)}
            onOpenMovement={(type) => handleOpenMovementModal(type || 'IN')}
            onSelectAsset={handleSelectAsset}
            onViewAllTransactions={() => setCurrentView('transactions')}
            onViewCatalog={() => setCurrentView('catalog')}
            onNavigateToAudit={() => setCurrentView('admin-audit')}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            assets={assets}
            currentUser={currentUser}
            categories={categories}
            onAddCategory={handleAddCategory}
            onSelectAsset={handleSelectAsset}
            onOpenAddAsset={() => setIsAddAssetModalOpen(true)}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
            onOpenMovementForAsset={(asset, type) => handleOpenMovementModal(type || 'IN', asset)}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'detail' && selectedAsset && (
          <DetailView
            asset={selectedAsset}
            currentUser={currentUser}
            categories={categories}
            onAddCategory={handleAddCategory}
            onBack={() => setCurrentView('catalog')}
            onOpenMovement={(asset, type) => handleOpenMovementModal(type || 'IN', asset)}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}

        {currentView === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            assets={assets}
            currentUser={currentUser}
            onOpenMovement={(type) => handleOpenMovementModal(type || 'IN')}
            onSelectAsset={handleSelectAsset}
            onNavigateToAudit={() => setCurrentView('admin-audit')}
          />
        )}

        {currentView === 'admin-audit' && (
          <AdminAuditView
            transactions={transactions}
            assets={assets}
            currentUser={currentUser}
            onSwitchToAdmin={() => {
              setCurrentUser(INITIAL_USERS[1]);
              showToast('Sesión cambiada a Administrador: Sofia Ramírez', 'success');
            }}
            onSelectAsset={handleSelectAsset}
          />
        )}
      </main>

      {/* METTAV GROUP SAS App Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#090e1a]/90 backdrop-blur-md py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <MettavLogo size="sm" />
          <span className="text-slate-300 font-medium">
            METTAV GROUP SAS • Sistema Integral de Inventarios y Maquinaria
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Boxes className="w-3.5 h-3.5 text-sky-400" />
          <span>Bodega Central & Suministro Industrial • Control Operativo</span>
        </div>
      </footer>

      {/* Movement Check-in / Check-out Modal */}
      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        defaultType={movementDefaultType}
        preSelectedAsset={movementPreSelectedAsset}
        assets={assets}
        currentUser={currentUser}
        onSubmitMovement={handleSubmitMovement}
      />

      {/* Add Asset Modal (With RBAC security check) */}
      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        currentUser={currentUser}
        categories={categories}
        onAddCategory={handleAddCategory}
        onAddAsset={handleAddAsset}
        onSwitchToAdmin={handleToggleRole}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#0d1524] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-center">
              <MettavLogo size="md" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">¿Cerrar Sesión?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Saldrás de la cuenta de {currentUser.name}. Podrás volver a ingresar en cualquier momento.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="py-2 px-3 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-fade-in">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/90 border-sky-500/40 text-slate-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
