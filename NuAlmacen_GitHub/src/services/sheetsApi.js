/**
 * CLIENTE API BIDIRECCIONAL GOOGLE APPS SCRIPT & MANEJO OFFLINE
 */
import { storage } from './storage';

export const sheetsApi = {
  /**
   * Verificar conectividad con Google Apps Script
   */
  async testConnection(url) {
    const targetUrl = url || storage.getSheetsUrl();
    if (!targetUrl) {
      return { success: false, message: 'No hay URL de Google Apps Script configurada' };
    }

    try {
      const endpoint = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      // Intentar modo no-cors o reporte
      return { success: false, error: err.message || 'No se pudo conectar al endpoint' };
    }
  },

  /**
   * Obtener todos los datos remotos de Google Sheets
   */
  async fetchAll() {
    const targetUrl = storage.getSheetsUrl();
    if (!targetUrl || !navigator.onLine) {
      return null;
    }

    try {
      const endpoint = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=getAll`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result && result.status === 'success' && result.data) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.warn('Fallo al obtener datos de Google Sheets, usando caché local', err);
      return null;
    }
  },

  /**
   * Registrar movimiento con sincronización remota + fallback offline
   */
  async registerMovement(movement, fotoBase64 = null) {
    const targetUrl = storage.getSheetsUrl();
    const payloadMovement = {
      ...movement,
      fotoBase64: fotoBase64 || null
    };

    // Si no hay internet o no hay URL configurada, registrar en cola offline
    if (!navigator.onLine || !targetUrl) {
      storage.addToOfflineQueue(payloadMovement);
      return {
        status: 'queued',
        offline: true,
        message: 'Registrado localmente (Modo Offline o sin URL conectada). Se sincronizará al conectar.'
      };
    }

    try {
      // Usamos POST. En Apps Script, enviar como text/plain previene bloqueo CORS preflight de navegadores
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'registerMovement',
          movement: payloadMovement
        })
      });

      const data = await res.json();
      if (data && data.status === 'success') {
        return {
          status: 'success',
          offline: false,
          data: data.data,
          message: 'Sincronizado en tiempo real con Google Sheets'
        };
      } else {
        throw new Error(data.message || 'Error en Google Sheets');
      }
    } catch (err) {
      console.warn('Error al enviar a Google Sheets. Guardando en cola local.', err);
      storage.addToOfflineQueue(payloadMovement);
      return {
        status: 'queued',
        offline: true,
        error: err.message,
        message: 'Conexión inestable. Movimiento guardado en cola local y se reintentará.'
      };
    }
  },

  /**
   * Sincronizar cola de movimientos pendientes offline
   */
  async syncPendingQueue() {
    const queue = storage.getOfflineQueue();
    if (!queue || queue.length === 0) return { synced: 0, total: 0 };

    const targetUrl = storage.getSheetsUrl();
    if (!targetUrl || !navigator.onLine) return { synced: 0, total: queue.length, error: 'Sin conexión' };

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'syncOfflineQueue',
          movements: queue
        })
      });

      const data = await res.json();
      if (data && data.status === 'success') {
        storage.clearOfflineQueue();
        return { synced: data.syncedCount || queue.length, total: queue.length };
      }
      return { synced: 0, total: queue.length, error: 'Respuesta inválida' };
    } catch (err) {
      return { synced: 0, total: queue.length, error: err.message };
    }
  },

  /**
   * Guardar o actualizar producto en Google Sheets
   */
  async saveProduct(product) {
    const targetUrl = storage.getSheetsUrl();
    if (!targetUrl || !navigator.onLine) {
      return { offline: true };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveProduct',
          product
        })
      });
      return await res.json();
    } catch (err) {
      console.error('Error guardando producto en Google Sheets', err);
      return { offline: true, error: err.message };
    }
  },

  /**
   * Eliminar producto en Google Sheets
   */
  async deleteProduct(idProducto) {
    const targetUrl = storage.getSheetsUrl();
    if (!targetUrl || !navigator.onLine) return { offline: true };

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteProduct',
          idProducto
        })
      });
      return await res.json();
    } catch (err) {
      return { offline: true, error: err.message };
    }
  }
};
