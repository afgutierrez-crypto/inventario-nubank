import React from 'react';
import { 
  Package, 
  ListFilter, 
  Bot, 
  Settings, 
  History,
  AlertTriangle
} from 'lucide-react';

export function BottomNav({ 
  activeTab, 
  setActiveTab, 
  lowStockCount, 
  offlineCount 
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-nu-white/95 backdrop-blur-md border-t border-nu-grey1 sm:hidden">
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto">
        
        {/* Catálogo de Productos */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center space-y-1 transition touch-target ${
            activeTab === 'catalog'
              ? 'text-nu-master1 font-bold'
              : 'text-nu-grey2 hover:text-nu-grey3'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-nu-mustard border border-white"></span>
            )}
          </div>
          <span className="text-[11px]">Catálogo</span>
        </button>

        {/* Historial de Movimientos */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center space-y-1 transition touch-target ${
            activeTab === 'history'
              ? 'text-nu-master1 font-bold'
              : 'text-nu-grey2 hover:text-nu-grey3'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5" />
            {offlineCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-nu-coral animate-ping"></span>
            )}
          </div>
          <span className="text-[11px]">Movimientos</span>
        </button>

        {/* Ajustes & Sheets */}
        <button
          onClick={() => setActiveTab('config')}
          className={`flex flex-col items-center justify-center space-y-1 transition touch-target ${
            activeTab === 'config'
              ? 'text-nu-master1 font-bold'
              : 'text-nu-grey2 hover:text-nu-grey3'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">Ajustes</span>
        </button>

      </div>
    </nav>
  );
}
