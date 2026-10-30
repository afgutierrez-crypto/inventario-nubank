import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Trash2,
  Code2
} from 'lucide-react';
import { sheetsApi } from '../services/sheetsApi';
import { storage } from '../services/storage';

export function SheetsConfigModal({ 
  onClose, 
  currentUrl, 
  onSaveUrl, 
  offlineCount, 
  onSyncOffline,
  onResetData 
}) {
  const [url, setUrl] = useState(currentUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'guide'

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Por favor ingresa una URL válida de Apps Script' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await sheetsApi.testConnection(url.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    onSaveUrl(url.trim());
    onClose();
  };

  const copyAppsScriptCode = () => {
    const code = `// Google Apps Script para NuBank Almacén disponible en google-apps-script/Code.gs`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-nu-master2/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-nu-white max-w-xl w-full rounded-3xl shadow-2xl border border-nu-grey1 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="bg-nu-master2 text-white p-5 border-b border-nu-purple3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Conexión con Google Sheets</h3>
              <p className="text-xs text-nu-lightblue">Sincronización Bidireccional en Tiempo Real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-nu-grey1 hover:text-white hover:bg-nu-purple3 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="flex border-b border-nu-grey1 bg-nu-offwhite px-5 pt-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'config'
                ? 'border-nu-master1 text-nu-master1'
                : 'border-transparent text-nu-grey2 hover:text-nu-grey3'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Configuración de Enlace</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'guide'
                ? 'border-nu-master1 text-nu-master1'
                : 'border-transparent text-nu-grey2 hover:text-nu-grey3'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Instrucciones Apps Script</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {activeTab === 'config' ? (
            <>
              {/* Input URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-nu-grey3 uppercase tracking-wider">
                  URL de la Web App (Google Apps Script)
                </label>
                <p className="text-xs text-nu-grey2">
                  Pega la URL terminada en <code>/exec</code> obtenida al implementar tu Apps Script como aplicación web.
                </p>
                <div className="relative mt-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full p-3 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-mono text-nu-black focus:outline-none focus:border-nu-master1 focus:ring-1 focus:ring-nu-master1"
                  />
                </div>
              </div>

              {/* Botones Probar y Guardar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="touch-target py-2.5 px-4 rounded-xl bg-nu-offwhite hover:bg-nu-grey1 border border-nu-grey1 text-nu-grey3 text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="touch-target py-2.5 px-5 rounded-xl bg-nu-master1 hover:bg-nu-purple2 text-white text-xs font-bold transition flex-1 shadow"
                >
                  Guardar y Activar
                </button>
              </div>

              {/* Resultado de prueba */}
              {testResult && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {testResult.success ? '¡Conexión Exitosa!' : 'Error de Conexión'}
                    </span>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {testResult.message || (testResult.success ? 'Respuesta recibida correctamente de Google Sheets.' : testResult.error)}
                    </p>
                  </div>
                </div>
              )}

              {/* Sincronización Cola Offline */}
              <div className="bg-nu-offwhite p-4 rounded-2xl border border-nu-grey1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-nu-black uppercase tracking-wider">
                      Cola Offline / Caché Local
                    </h4>
                    <p className="text-xs text-nu-grey2">
                      Movimientos guardados en el navegador cuando no hay conexión.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    offlineCount > 0 ? 'bg-nu-mustard text-nu-black' : 'bg-nu-grey1 text-nu-grey2'
                  }`}>
                    {offlineCount} pendientes
                  </span>
                </div>

                {offlineCount > 0 && (
                  <button
                    onClick={onSyncOffline}
                    className="w-full py-2.5 px-4 rounded-xl bg-nu-purple2 hover:bg-nu-master1 text-white text-xs font-bold transition flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar {offlineCount} movimientos ahora</span>
                  </button>
                )}
              </div>

              {/* Resetear a Demo */}
              <div className="pt-2 flex justify-between items-center text-xs text-nu-grey2 border-t border-nu-grey1">
                <span>¿Deseas restaurar los datos de prueba?</span>
                <button
                  onClick={onResetData}
                  className="text-nu-coral font-bold hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Restaurar Datos Demo</span>
                </button>
              </div>
            </>
          ) : (
            /* GUÍA PASO A PASO PARA EL USUARIO */
            <div className="space-y-4 text-xs text-nu-grey3 leading-relaxed">
              <div className="bg-nu-purple1/10 p-3.5 rounded-2xl border border-nu-purple1/30 text-nu-purple2 font-medium">
                Sigue estos 5 pasos para conectar tu propia hoja de cálculo en 2 minutos:
              </div>

              <ol className="list-decimal pl-4 space-y-3 font-medium">
                <li>
                  Abre tu Google Drive y crea una hoja de cálculo nueva (Google Sheets).
                </li>
                <li>
                  En la barra superior, haz clic en <strong>Extensiones</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li>
                  Abre el archivo que creamos en tu proyecto en la ruta:
                  <div className="my-1.5 p-2 bg-nu-offwhite rounded-lg font-mono text-[11px] text-nu-master1 font-bold border border-nu-grey1">
                    nu-inventario/google-apps-script/Code.gs
                  </div>
                  Copia todo su contenido y pégalo en el editor de Apps Script reemplazando el código por defecto.
                </li>
                <li>
                  Haz clic en <strong>Implementar</strong> (Deploy) &gt; <strong>Nueva implementación</strong>.
                  <ul className="list-disc pl-4 mt-1 text-nu-grey2 space-y-1">
                    <li>Tipo: <strong>Aplicación web</strong></li>
                    <li>Ejecutar como: <strong>Yo</strong> (tu cuenta de Google)</li>
                    <li>Quién tiene acceso: <strong className="text-nu-master1">Cualquiera (Anyone)</strong></li>
                  </ul>
                </li>
                <li>
                  Copia la URL que te proporciona Google y pégala en la pestaña <strong>Configuración de Enlace</strong> de esta ventana.
                </li>
              </ol>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                💡 <strong>Creación Automática:</strong> Al recibir la primera petición, el script creará automáticamente las 3 pestañas requeridas (<code>Usuarios</code>, <code>Catalogo_Productos</code>, <code>Movimientos</code>) con el formato y estilo oficial NuBank.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
