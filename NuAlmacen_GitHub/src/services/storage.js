/**
 * SERVICIO DE ALMACENAMIENTO LOCAL Y GESTIÓN DE COLA OFFLINE
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nu_inventory_products_v1',
  MOVEMENTS: 'nu_inventory_movements_v1',
  USERS: 'nu_inventory_users_v1',
  OFFLINE_QUEUE: 'nu_inventory_offline_queue_v1',
  SHEETS_URL: 'nu_inventory_sheets_url_v1',
  ACTIVE_USER: 'nu_inventory_active_user_v1'
};

export const storage = {
  // Productos
  getProducts(fallback = []) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  },

  // Movimientos
  getMovements(fallback = []) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  saveMovements(movements) {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('Error saving movements to localStorage', e);
    }
  },

  // Usuarios
  getUsers(fallback = []) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage', e);
    }
  },

  // Cola de sincronización Offline
  getOfflineQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addToOfflineQueue(movement) {
    try {
      const queue = this.getOfflineQueue();
      const updatedQueue = [...queue, { ...movement, _queuedAt: new Date().toISOString() }];
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));
      return updatedQueue;
    } catch (e) {
      console.error('Error adding to offline queue', e);
      return [];
    }
  },
  clearOfflineQueue() {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (e) {
      console.error('Error clearing offline queue', e);
    }
  },

  // Google Sheets URL
  getSheetsUrl() {
    return localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || '';
  },
  setSheetsUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.SHEETS_URL);
    }
  },

  // Usuario Activo
  getActiveUser(fallback = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  setActiveUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      }
    } catch (e) {
      console.error('Error setting active user', e);
    }
  }
};
