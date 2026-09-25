import React from 'react';

interface MettavLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'plain' | 'glass' | 'image-only' | 'icon-only';
  showSubtitle?: boolean;
}

export const MettavLogo: React.FC<MettavLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
  showSubtitle = false,
}) => {
  const imgSizes = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  if (variant === 'image-only') {
    return (
      <div className={`inline-flex items-center justify-center bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 ${className}`}>
        <img
          src="/mettav-logo.svg"
          alt="METTAV GROUP SAS"
          className={`${imgSizes[size]} object-contain rounded-lg`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon / Logo Emblem with white container for high contrast */}
      <div className="bg-white px-2 py-1 rounded-xl shadow-md border border-white/40 flex items-center justify-center shrink-0">
        <img
          src="/mettav-logo.svg"
          alt="METTAV GROUP SAS"
          className={`${imgSizes[size]} object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} font-extrabold tracking-tight text-white font-sans flex items-center gap-1`}>
            METTAV <span className="text-sky-400 font-semibold text-[0.85em]">GROUP</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider">
            SAS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-medium leading-tight">
            Maquinaria, Equipos & Repuestos
          </span>
        )}
      </div>
    </div>
  );
};

// Aliases for backwards compatibility
export const AeroLogo = MettavLogo;
export const EcopetrolLogo = MettavLogo;
