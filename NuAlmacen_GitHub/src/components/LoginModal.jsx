import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Shield, 
  UserCheck, 
  Sparkles, 
  ArrowRight,
  Key
} from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';

export function LoginModal({ 
  users, 
  activeUser, 
  onSelectUser, 
  onClose 
}) {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const query = emailOrId.trim().toLowerCase();
    const foundUser = users.find(u => 
      u.ID_Usuario.toLowerCase() === query || 
      u.Email.toLowerCase() === query ||
      u.Nombre_Completo.toLowerCase().includes(query)
    );

    if (!foundUser) {
      setErrorMsg('Usuario no encontrado. Prueba seleccionando uno de los accesos directos.');
      return;
    }

    onSelectUser(foundUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-nu-master2/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-nu-white max-w-md w-full rounded-3xl shadow-2xl border border-nu-grey1 overflow-hidden animate-fadeIn">
        
        {/* Cabecera NuBank */}
        <div className="bg-nu-master2 text-white p-6 border-b border-nu-purple3 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-nu-grey1 hover:text-white hover:bg-nu-purple3 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-nu-master1 flex items-center justify-center text-white font-black text-2xl shadow-md border border-nu-purple1/40 mb-3">
            nu
          </div>
          <h3 className="text-xl font-bold text-white">Autenticación de Colaborador</h3>
          <p className="text-xs text-nu-lightblue mt-0.5">Control de acceso y auditoría de almacén</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Accesos Rápidos para Demo / Cambio Inmediato */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-nu-grey2 uppercase tracking-wider block">
              Seleccionar Colaborador Activo
            </span>
            <div className="space-y-2">
              {users.map(u => {
                const isCurrent = activeUser?.ID_Usuario === u.ID_Usuario;
                return (
                  <button
                    key={u.ID_Usuario}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-nu-master1/10 border-nu-master1 ring-1 ring-nu-master1'
                        : 'bg-nu-offwhite border-nu-grey1 hover:border-nu-purple1 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={u.Nombre_Completo}
                        className="w-10 h-10 rounded-full object-cover border border-nu-purple1/40"
                      />
                      <div>
                        <div className="font-bold text-nu-black text-sm flex items-center space-x-1.5">
                          <span>{u.Nombre_Completo}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-nu-master1 text-white px-1.5 py-0.2 rounded font-bold">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-nu-grey2">{u.Email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        u.Rol === 'Administrador' 
                          ? 'bg-nu-purple1/20 text-nu-purple2 border border-nu-purple1/30' 
                          : 'bg-nu-lightblue/30 text-nu-master1 border border-nu-lightblue/50'
                      }`}>
                        {u.Rol}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Separador */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-nu-grey1"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-nu-grey2 uppercase">O ingresa manualmente</span>
            <div className="flex-grow border-t border-nu-grey1"></div>
          </div>

          {/* Formulario Manual */}
          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-nu-grey3 mb-1">
                ID Colaborador o Correo NuBank
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-nu-grey2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="ej. USR-001 o sofia.rivas@nubank.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-medium focus:outline-none focus:border-nu-master1 focus:ring-1 focus:ring-nu-master1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nu-grey3 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-nu-grey2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-medium focus:outline-none focus:border-nu-master1 focus:ring-1 focus:ring-nu-master1"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full touch-target py-3 px-4 rounded-xl bg-nu-master1 hover:bg-nu-purple2 text-white font-bold text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4 text-nu-lightblue" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
