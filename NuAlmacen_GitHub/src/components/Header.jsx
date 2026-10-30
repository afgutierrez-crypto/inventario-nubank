import React from 'react';
import { 
  User, 
  Shield, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  LogOut,
  Layers,
  Database
} from 'lucide-react';

export function Header({ 
  activeUser, 
  onSwitchUser, 
  onOpenSettings, 
  isOnline, 
  isSheetsConnected, 
  offlineCount,
  onSyncOffline,
  isSyncing
}) {
  return (
    <header className="sticky top-0 z-40 bg-nu-master2 text-nu-white shadow-nu border-b border-nu-purple3">
      {/* Barra superior con branding y estado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo NuBank & Título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-nu-master1 flex items-center justify-center font-extrabold text-white text-xl sm:text-2xl shadow-md border border-nu-purple1/40">
              nu
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">Almacén</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-nu-purple3 text-nu-lightblue border border-nu-lightblue/30">
                  En Tiempo Real
                </span>
              </div>
              <p className="text-xs text-nu-grey2 hidden sm:block">
                Gestión de Inventario & Sincronización Google Sheets
              </p>
            </div>
          </div>

          {/* Estado de Conexión & Sincronización */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Pill de Sincronización Sheets / Offline */}
            {isSheetsConnected ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline">Google Sheets</span>
                <span>En Vivo</span>
              </div>
            ) : (
              <button 
                onClick={onOpenSettings}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-nu-purple3 text-nu-lightblue hover:bg-nu-purple2 transition border border-nu-lightblue/40"
                title="Configurar conexión con Google Sheets"
              >
                <Database className="w-3 h-3 text-nu-lightblue" />
                <span>Modo Local</span>
              </button>
            )}

            {/* Offline Queue Badge si hay items pendientes */}
            {offlineCount > 0 && (
              <button
                onClick={onSyncOffline}
                disabled={isSyncing}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-nu-mustard text-nu-black hover:brightness-105 transition shadow-sm animate-bounce"
                title={`${offlineCount} movimientos pendientes en cola local`}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{offlineCount} en cola</span>
              </button>
            )}

            {/* Botón de Ajustes / Conexión */}
            <button
              onClick={onOpenSettings}
              className="touch-target p-2 rounded-xl text-nu-grey1 hover:text-white hover:bg-nu-purple3/70 transition"
              aria-label="Configuración de Google Sheets"
              title="Ajustes de Google Sheets"
            >
              <Settings className="w-5 h-5 text-nu-lightblue" />
            </button>

            {/* Separador vertical */}
            <div className="h-7 w-[1px] bg-nu-purple3 hidden sm:block"></div>

            {/* Usuario Activo: Registrando como [Nombre] */}
            {activeUser ? (
              <button
                onClick={onSwitchUser}
                className="flex items-center space-x-2.5 py-1.5 px-3 rounded-xl bg-nu-purple3/80 hover:bg-nu-purple2/90 border border-nu-purple1/30 transition text-left group"
                title="Haga clic para cambiar de usuario"
              >
                <div className="relative">
                  <img
                    src={activeUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={activeUser.Nombre_Completo}
                    className="w-8 h-8 rounded-full object-cover border border-nu-purple1 group-hover:border-nu-lightblue transition"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-nu-master2 ${activeUser.Rol === 'Administrador' ? 'bg-nu-purple1' : 'bg-nu-lightblue'}`}></span>
                </div>
                
                <div className="hidden lg:block text-xs">
                  <div className="text-nu-grey2 flex items-center space-x-1">
                    <span>Registrando como:</span>
                  </div>
                  <div className="font-semibold text-white flex items-center space-x-1.5">
                    <span className="truncate max-w-[130px]">{activeUser.Nombre_Completo}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      activeUser.Rol === 'Administrador' 
                        ? 'bg-nu-purple1/30 text-nu-purple1 border border-nu-purple1/50' 
                        : 'bg-nu-lightblue/20 text-nu-lightblue border border-nu-lightblue/40'
                    }`}>
                      {activeUser.Rol}
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onSwitchUser}
                className="touch-target px-3 py-1.5 rounded-xl bg-nu-master1 hover:bg-nu-purple2 text-xs font-semibold text-white transition flex items-center space-x-1.5 shadow"
              >
                <User className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Sub-banner persistente móvil "Registrando como: ..." */}
      {activeUser && (
        <div className="block lg:hidden bg-nu-purple3/90 px-4 py-1.5 border-t border-nu-purple2/40 text-xs">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <span className="text-nu-grey2">Registrando como:</span>
              <span className="font-bold text-white truncate max-w-[170px]">{activeUser.Nombre_Completo}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                activeUser.Rol === 'Administrador' ? 'bg-nu-purple1 text-white' : 'bg-nu-lightblue text-nu-black'
              }`}>
                {activeUser.Rol}
              </span>
            </div>
            <button 
              onClick={onSwitchUser}
              className="text-nu-lightblue font-medium text-[11px] underline hover:text-white"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
