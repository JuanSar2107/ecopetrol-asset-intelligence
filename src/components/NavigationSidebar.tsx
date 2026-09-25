import React from 'react';
import { AppView, UserProfile } from '../types';
import { MettavLogo } from './MettavLogo';
import { 
  Boxes, 
  Package, 
  ArrowLeftRight, 
  ShieldCheck, 
  LogOut, 
  X, 
  FileText,
  User,
  Wrench,
  Sparkles
} from 'lucide-react';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentUser: UserProfile;
  onLogoutClick: () => void;
  onToggleRole: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  currentUser,
  onLogoutClick,
  onToggleRole,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Navigation items: Admin sees audit; Operators only see common shared sections
  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: <Boxes className="w-5 h-5" />,
    },
    {
      id: 'catalog',
      label: 'Catálogo de Inventario',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'transactions',
      label: 'Movimientos de Bodega',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      badge: 'Entrada/Salida',
    },
    ...(isAdmin
      ? [
          {
            id: 'admin-audit' as AppView,
            label: 'Auditoría Oficial',
            icon: <FileText className="w-5 h-5" />,
            badge: 'Admin / PDF',
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Navigation Panel */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-[#0a0f1d] border-r border-slate-800 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <MettavLogo size="md" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Status Banner */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              )}
              <span className="text-xs uppercase tracking-wider font-bold text-slate-200">
                {isAdmin ? 'Supervisor / Admin' : 'Operador / Logística'}
              </span>
            </div>
            <button
              onClick={onToggleRole}
              title="Cambiar entre Administrador y Operador normal para probar permisos"
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
            >
              Cambiar Rol
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {isAdmin
              ? 'Permisos de administrador: Auditoría completa de movimientos, reportes y alta de inventario.'
              : 'Vista de operador: Consulta de catálogo y registro ágil de entradas y despachos.'}
          </p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border-l-4 border-sky-400 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.badge.includes('Admin')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Guide box for simple usage */}
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <div className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Centro de Operaciones
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span>Base Operativa:</span>
                <span className="text-sky-300 font-semibold">Bodega Central</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Control de Calidad:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verificado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 truncate">Doc: {currentUser.documentId}</div>
            </div>
          </div>

          <button
            onClick={onLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/15 border border-rose-500/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
