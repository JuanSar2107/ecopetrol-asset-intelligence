import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { 
  CreditCard, 
  ArrowRight, 
  Shield, 
  RefreshCw, 
  CheckCircle2, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserCheck,
  Boxes,
  Wrench
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('1098765432');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedProfile, setDetectedProfile] = useState<UserProfile | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDetectedProfile(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setErrorMsg('Por favor ingresa tu número de documento o correo.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const matchedUser = INITIAL_USERS.find(
        (u) =>
          u.documentId.toLowerCase() === cleanId ||
          u.email?.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId
      );

      if (!matchedUser) {
        setLoading(false);
        setErrorMsg(
          'Usuario no encontrado. Puedes hacer clic en cualquiera de las cuentas de prueba abajo para ingresar fácilmente.'
        );
        return;
      }

      setDetectedProfile(matchedUser);

      setTimeout(() => {
        setLoading(false);
        onLogin(matchedUser);
      }, 600);
    }, 600);
  };

  const handleQuickFill = (user: UserProfile) => {
    setIdentifier(user.documentId);
    setPassword(user.password || '123');
    setErrorMsg(null);
    setDetectedProfile(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 text-slate-100 bg-[#060b13] overflow-y-auto">
      {/* Aviation backdrop subtle lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="w-full max-w-md relative z-10 flex flex-col items-center my-6">
        {/* METTAV GROUP SAS Official Brand Presentation */}
        <div className="mb-6 flex flex-col items-center justify-center text-center w-full">
          <div className="w-full max-w-[280px] sm:max-w-[310px] bg-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/90 hover:border-sky-300 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(2,132,199,0.22)] flex items-center justify-center">
            <img
              src="/mettav-logo.svg"
              alt="METTAV GROUP SAS"
              className="w-full h-auto max-h-36 sm:max-h-44 object-contain drop-shadow-sm select-none block"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="mt-3.5 flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
              Suministro de Maquinaria, Equipos & Repuestos
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#0d1524]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">
              Ingreso al Sistema de Inventarios
            </h2>
            <p className="text-xs text-slate-400">
              Identifícate con tu documento o correo institucional para registrar movimientos o supervisar inventarios.
            </p>
          </div>

          {detectedProfile && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">¡Bienvenido!</div>
                <div className="text-[11px] text-emerald-300">
                  {detectedProfile.name} • {detectedProfile.role === 'admin' ? 'Administrador' : 'Mecánico / Operador'}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-semibold text-slate-300 tracking-wider">
                Documento de Identidad o Correo
              </label>
              <div className="relative flex items-center">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej. 1098765432"
                  required
                  disabled={loading}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-semibold text-slate-300 tracking-wider">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer mt-5"
            >
              <span>{loading ? 'Ingresando...' : 'Entrar a la Plataforma'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Access Account buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-2">
              Haz clic para probar cualquier perfil:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_USERS.slice(0, 4).map((user) => {
                const isAdmin = user.role === 'admin';
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickFill(user)}
                    className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-bold text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {user.roleTitle}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                        isAdmin
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {isAdmin ? 'ADMIN' : 'OPERADOR'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Boxes className="w-3.5 h-3.5 text-sky-400" />
          <span>METTAV GROUP SAS • Sistema Integral de Inventarios y Maquinaria</span>
        </div>
      </main>
    </div>
  );
};
