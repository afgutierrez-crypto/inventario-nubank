import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { MovementModal } from './components/MovementModal';
import { MovementsHistory } from './components/MovementsHistory';
import { ChatbotNuBot } from './components/ChatbotNuBot';
import { LoginModal } from './components/LoginModal';
import { SheetsConfigModal } from './components/SheetsConfigModal';
import { AdminProductModal } from './components/AdminProductModal';
import { BottomNav } from './components/BottomNav';
import { storage } from './services/storage';
import { sheetsApi } from './services/sheetsApi';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS 
} from './data/initialData';
import { 
  Package, 
  History, 
  Database, 
  RefreshCw, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export function App() {
  // Estados principales de datos
  const [users, setUsers] = useState(() => storage.getUsers(INITIAL_USERS));
  const [products, setProducts] = useState(() => storage.getProducts(INITIAL_PRODUCTS));
  const [movements, setMovements] = useState(() => storage.getMovements(INITIAL_MOVEMENTS));
  const [activeUser, setActiveUser] = useState(() => storage.getActiveUser(INITIAL_USERS[0]));
  
  // Estado de sincronización y conectividad
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSheetsConnected, setIsSheetsConnected] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(() => storage.getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  // Navegación de vistas
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'history', 'config'

  // Modales
  const [selectedProductForMovement, setSelectedProductForMovement] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [adminProductModal, setAdminProductModal] = useState({ isOpen: false, product: null });

  // Manejo de eventos de red
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexión reestablecida. Sincronizando cola...', 'info');
      handleSyncOffline();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo sin conexión activado. Los movimientos se guardarán localmente.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar Notificación Flotante (Toast)
  const showToast = (message, type = 'success') => {
    setSyncToast({ message, type });
    setTimeout(() => {
      setSyncToast(null);
    }, 4000);
  };

  // Carga inicial y chequeo de Sheets
  const refreshFromSheets = useCallback(async () => {
    const sheetsUrl = storage.getSheetsUrl();
    if (!sheetsUrl) {
      setIsSheetsConnected(false);
      return;
    }

    setIsSyncing(true);
    const remoteData = await sheetsApi.fetchAll();
    setIsSyncing(false);

    if (remoteData) {
      setIsSheetsConnected(true);
      if (remoteData.products && remoteData.products.length > 0) {
        setProducts(remoteData.products);
        storage.saveProducts(remoteData.products);
      }
      if (remoteData.movements && remoteData.movements.length > 0) {
        setMovements(remoteData.movements);
        storage.saveMovements(remoteData.movements);
      }
      if (remoteData.users && remoteData.users.length > 0) {
        setUsers(remoteData.users);
        storage.saveUsers(remoteData.users);
      }
    } else {
      setIsSheetsConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshFromSheets();
  }, [refreshFromSheets]);

  // Sincronizar cola offline pendiente
  const handleSyncOffline = async () => {
    const queue = storage.getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    const result = await sheetsApi.syncPendingQueue();
    setIsSyncing(false);

    if (result.synced > 0) {
      setOfflineQueue([]);
      showToast(`¡${result.synced} movimientos sincronizados exitosamente con Google Sheets!`, 'success');
      refreshFromSheets();
    } else if (result.error) {
      showToast(`No se pudo sincronizar: ${result.error}`, 'warning');
    }
  };

  // Manejador del Registro de Movimiento (Optimista + Sincronización Remota)
  const handleRegisterMovement = async (movementData, fotoEvidencia) => {
    const qty = Number(movementData.Cantidad);
    const tipo = movementData.Tipo_Movimiento;
    const prodId = movementData.ID_Producto;

    // 1. Actualización de Stock Optimista en la UI
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        if (p.ID_Producto === prodId) {
          const current = Number(p.Stock_Actual) || 0;
          let newStock = current;
          if (tipo === 'Entrada') {
            newStock = current + qty;
          } else {
            newStock = Math.max(0, current - qty);
          }
          return { ...p, Stock_Actual: newStock };
        }
        return p;
      });
      storage.saveProducts(updated);
      return updated;
    });

    // 2. Registro de nuevo movimiento en la lista local
    const newMovementItem = {
      ...movementData,
      ID_Movimiento: 'MOV-' + Date.now().toString().slice(-6),
      URL_Foto_Evidencia: fotoEvidencia || ''
    };

    setMovements(prev => {
      const updated = [newMovementItem, ...prev];
      storage.saveMovements(updated);
      return updated;
    });

    // 3. Enviar a Google Apps Script
    const response = await sheetsApi.registerMovement(newMovementItem, fotoEvidencia);
    
    // Actualizar cola offline en estado
    setOfflineQueue(storage.getOfflineQueue());

    if (response.offline) {
      showToast('Guardado en cola local (Offline). Se sincronizará al conectar.', 'warning');
    } else {
      showToast('¡Movimiento sincronizado en tiempo real con Google Sheets!', 'success');
    }

    return response;
  };

  // Guardar Producto (Admin)
  const handleSaveProduct = async (productData) => {
    setProducts(prev => {
      const exists = prev.some(p => p.ID_Producto === productData.ID_Producto);
      let updated;
      if (exists) {
        updated = prev.map(p => p.ID_Producto === productData.ID_Producto ? productData : p);
      } else {
        updated = [productData, ...prev];
      }
      storage.saveProducts(updated);
      return updated;
    });

    sheetsApi.saveProduct(productData);
    showToast('Producto actualizado en catálogo.', 'success');
  };

  // Eliminar Producto (Admin)
  const handleDeleteProduct = async (idProducto) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.ID_Producto !== idProducto);
      storage.saveProducts(updated);
      return updated;
    });
    sheetsApi.deleteProduct(idProducto);
    showToast('Producto eliminado del catálogo.', 'info');
  };

  // Restaurar datos demo
  const handleResetData = () => {
    if (confirm('¿Restaurar todos los productos y movimientos a los datos iniciales de demostración?')) {
      storage.saveProducts(INITIAL_PRODUCTS);
      storage.saveMovements(INITIAL_MOVEMENTS);
      storage.saveUsers(INITIAL_USERS);
      storage.clearOfflineQueue();
      setProducts(INITIAL_PRODUCTS);
      setMovements(INITIAL_MOVEMENTS);
      setUsers(INITIAL_USERS);
      setOfflineQueue([]);
      showToast('Datos demo restaurados correctamente.', 'info');
      setIsSettingsModalOpen(false);
    }
  };

  // Conteo de bajo stock para badges
  const lowStockCount = products.filter(
    p => Number(p.Stock_Actual) <= Number(p.Stock_Minimo)
  ).length;

  return (
    <div className="min-h-screen bg-nu-offwhite flex flex-col font-sans text-nu-grey3 pb-24 sm:pb-12">
      
      {/* 1. HEADER PERSISTENTE NUBANK */}
      <Header
        activeUser={activeUser}
        onSwitchUser={() => setIsLoginModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOnline={isOnline}
        isSheetsConnected={isSheetsConnected}
        offlineCount={offlineQueue.length}
        onSyncOffline={handleSyncOffline}
        isSyncing={isSyncing}
      />

      {/* TOAST FLOTANTE DE NOTIFICACIONES */}
      {syncToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown">
          <div className={`px-4 py-3 rounded-2xl shadow-nu-lg border flex items-center space-x-2.5 text-xs font-bold ${
            syncToast.type === 'success' 
              ? 'bg-nu-master2 text-white border-nu-purple1 shadow-nu' 
              : syncToast.type === 'warning'
              ? 'bg-nu-mustard text-nu-black border-amber-400'
              : 'bg-nu-white text-nu-black border-nu-grey1'
          }`}>
            {syncToast.type === 'success' && <CheckCircle className="w-4 h-4 text-nu-lightblue flex-shrink-0" />}
            {syncToast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-nu-black flex-shrink-0" />}
            <span>{syncToast.message}</span>
          </div>
        </div>
      )}

      {/* 2. BARRA DE NAVEGACIÓN EN PANTALLAS GRANDES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6">
        <div className="hidden sm:flex items-center justify-between border-b border-nu-grey1 pb-4">
          
          {/* Pestañas Principales */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === 'catalog'
                  ? 'bg-nu-master1 text-white shadow-sm'
                  : 'bg-nu-white text-nu-grey3 hover:bg-nu-grey1 border border-nu-grey1'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo de Productos</span>
              {lowStockCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-nu-mustard text-nu-black font-extrabold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-nu-master1 text-white shadow-sm'
                  : 'bg-nu-white text-nu-grey3 hover:bg-nu-grey1 border border-nu-grey1'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial de Movimientos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-nu-offwhite text-nu-grey2 border border-nu-grey1">
                {movements.length}
              </span>
            </button>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-2">
            {activeUser?.Rol === 'Administrador' && (
              <button
                onClick={() => setAdminProductModal({ isOpen: true, product: null })}
                className="py-2.5 px-4 rounded-xl bg-nu-purple3 hover:bg-nu-purple2 text-white text-xs font-bold transition flex items-center space-x-1.5 border border-nu-purple1/40"
              >
                <Plus className="w-4 h-4 text-nu-lightblue" />
                <span>Agregar Producto</span>
              </button>
            )}

            <button
              onClick={refreshFromSheets}
              disabled={isSyncing}
              className="py-2.5 px-3 rounded-xl bg-nu-white hover:bg-nu-grey1 border border-nu-grey1 text-nu-grey3 text-xs font-semibold transition flex items-center space-x-1.5"
              title="Refrescar datos desde Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-nu-master1' : ''}`} />
              <span className="hidden md:inline">Actualizar</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 flex-1">
        
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onSelectProductForMovement={(prod) => setSelectedProductForMovement(prod)}
            userRole={activeUser?.Rol}
            onOpenAddProduct={() => setAdminProductModal({ isOpen: true, product: null })}
            onOpenEditProduct={(prod) => setAdminProductModal({ isOpen: true, product: prod })}
          />
        )}

        {activeTab === 'history' && (
          <MovementsHistory movements={movements} />
        )}

        {activeTab === 'config' && (
          <div className="bg-nu-white p-6 rounded-3xl border border-nu-grey1 shadow-nu-card max-w-xl mx-auto">
            <h3 className="font-bold text-base text-nu-black mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-nu-master1" />
              <span>Configuración y Conexión</span>
            </h3>
            <p className="text-xs text-nu-grey2 mb-4">
              Administra la sincronización bidireccional con tu hoja de cálculo Google Sheets.
            </p>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-nu-master1 text-white font-bold text-xs shadow hover:bg-nu-purple2 transition"
            >
              Abrir Panel de Conexión Google Sheets
            </button>
          </div>
        )}

      </main>

      {/* 4. CHATBOT ASISTENTE DE ALMACÉN (NUBOT) */}
      <ChatbotNuBot
        products={products}
        movements={movements}
        onSelectProductForMovement={(prod) => setSelectedProductForMovement(prod)}
      />

      {/* 5. NAVEGACIÓN MÓVIL INFERIOR FIJA */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        offlineCount={offlineQueue.length}
      />

      {/* MODAL REGISTRAR MOVIMIENTO */}
      {selectedProductForMovement && (
        <MovementModal
          product={selectedProductForMovement}
          activeUser={activeUser}
          onClose={() => setSelectedProductForMovement(null)}
          onSubmitMovement={handleRegisterMovement}
        />
      )}

      {/* MODAL DE CAMBIO DE USUARIO / LOGIN */}
      {isLoginModalOpen && (
        <LoginModal
          users={users}
          activeUser={activeUser}
          onSelectUser={(u) => {
            setActiveUser(u);
            storage.setActiveUser(u);
            showToast(`Registrando como ${u.Nombre_Completo} (${u.Rol})`, 'info');
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* MODAL DE CONFIGURACIÓN GOOGLE SHEETS */}
      {isSettingsModalOpen && (
        <SheetsConfigModal
          currentUrl={storage.getSheetsUrl()}
          onSaveUrl={(newUrl) => {
            storage.setSheetsUrl(newUrl);
            showToast('URL de Google Sheets guardada', 'success');
            refreshFromSheets();
          }}
          offlineCount={offlineQueue.length}
          onSyncOffline={handleSyncOffline}
          onResetData={handleResetData}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* MODAL AGREGAR / EDITAR PRODUCTO (ADMIN) */}
      {adminProductModal.isOpen && (
        <AdminProductModal
          productToEdit={adminProductModal.product}
          onClose={() => setAdminProductModal({ isOpen: false, product: null })}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

    </div>
  );
}
