import React from 'react';
import { UserProfile } from '../types';
import { MettavLogo } from './MettavLogo';
import { 
  Menu, 
  Search, 
  ShieldCheck, 
  User, 
  ArrowRightLeft, 
  FileText 
} from 'lucide-react';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  currentUser: UserProfile;
  onOpenScanner?: () => void;
  onToggleRole: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onNavigateToAudit?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  currentUser,
  onToggleRole,
  searchQuery,
  onSearchChange,
  onNavigateToAudit,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="h-16 w-full sticky top-0 z-30 bg-[#090e17]/90 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center px-4 sm:px-6">
      {/* Left side: Hamburger + METTAV Brand */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-slate-300 hover:text-sky-400 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <MettavLogo size="sm" />
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full focus-within:ring-2 focus-within:ring-sky-500/50 rounded-xl transition-all">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, código de modelo, destino o bodega..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-1.5 pl-10 pr-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Right side: Role Switcher, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin only button: Auditoría & PDF - completely hidden for operator! */}
        {isAdmin && onNavigateToAudit && (
          <button
            onClick={onNavigateToAudit}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
            title="Ir al apartado de auditoría e historial de movimientos"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Auditoría & PDF</span>
          </button>
        )}

        {/* Role Switcher Pill */}
        <button
          onClick={onToggleRole}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            isAdmin
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
          }`}
          title="Clic para alternar entre Administrador y Operador normal"
        >
          {isAdmin ? (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <User className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="hidden sm:inline font-bold">
            {isAdmin ? 'Admin' : 'Operador'}
          </span>
          <ArrowRightLeft className="w-3 h-3 ml-0.5 opacity-60" />
        </button>

        {/* User Profile avatar */}
        <div
          onClick={onToggleRole}
          className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group"
          title={`Conectado como ${currentUser.name}. Clic para alternar rol.`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full border border-slate-700 object-cover group-hover:border-sky-400 transition-colors"
          />
          <div className="hidden xl:block text-left text-xs">
            <div className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate max-w-[110px]">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {isAdmin ? 'Supervisor Admin' : 'Operador Logístico'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
