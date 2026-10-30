import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Repeat, 
  Camera, 
  Upload, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Package, 
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { MOTIVOS } from '../data/initialData';

export function MovementModal({ 
  product, 
  activeUser, 
  onClose, 
  onSubmitMovement 
}) {
  const [tipoMovimiento, setTipoMovimiento] = useState('Entrada'); // 'Entrada', 'Salida', 'Uso interno'
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState(MOTIVOS['Entrada'][0]);
  const [observaciones, setObservaciones] = useState('');
  const [fotoEvidencia, setFotoEvidencia] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!product) return null;

  const currentStock = Number(product.Stock_Actual) || 0;
  const isExitOrUsage = tipoMovimiento === 'Salida' || tipoMovimiento === 'Uso interno';
  
  // Validación de cantidad
  const isQuantityExceeded = isExitOrUsage && cantidad > currentStock;

  // Cálculo proyectado del nuevo stock
  let projectedStock = currentStock;
  if (tipoMovimiento === 'Entrada') {
    projectedStock = currentStock + (Number(cantidad) || 0);
  } else {
    projectedStock = Math.max(0, currentStock - (Number(cantidad) || 0));
  }

  // Manejador del cambio de tipo de movimiento
  const handleTypeChange = (type) => {
    setTipoMovimiento(type);
    setErrorMsg('');
    // Actualizar motivo predeterminado
    const availableMotivos = MOTIVOS[type] || [];
    setMotivo(availableMotivos[0] || '');
  };

  // Manejo de foto desde cámara o archivo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('La imagen supera los 5MB. Por favor selecciona una más ligera.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        setFotoEvidencia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFotoPreview('');
    setFotoEvidencia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cantidad <= 0) {
      setErrorMsg('La cantidad debe ser mayor a 0');
      return;
    }

    if (isQuantityExceeded) {
      setErrorMsg(`No puedes registrar una ${tipoMovimiento} mayor al stock actual (${currentStock} unidades).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const movementPayload = {
        ID_Producto: product.ID_Producto,
        Nombre_Producto: product.Nombre,
        Tipo_Movimiento: tipoMovimiento,
        Cantidad: Number(cantidad),
        ID_Usuario_Responsable: activeUser?.ID_Usuario || 'USR-001',
        Nombre_Usuario: activeUser?.Nombre_Completo || 'Operador',
        Motivo_Destino: motivo,
        Observaciones: observaciones.trim(),
        Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      const result = await onSubmitMovement(movementPayload, fotoEvidencia);
      setIsSubmitting(false);
      setSuccessData({
        ...movementPayload,
        nuevoStock: projectedStock,
        status: result?.status || 'success',
        offline: result?.offline || false
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error al procesar el movimiento');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-nu-master2/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Contenedor Modal */}
      <div className="bg-nu-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-nu-grey1 overflow-hidden transition-all duration-300 max-h-[92vh] flex flex-col">
        
        {/* Encabezado con Paleta NuBank Master Purple */}
        <div className="bg-nu-master2 text-white px-5 py-4 flex items-center justify-between border-b border-nu-purple3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-nu-master1 flex items-center justify-center font-bold text-white text-sm">
              nu
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Registrar Movimiento</h3>
              <p className="text-xs text-nu-lightblue">Almacén & Inventario Central</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-xl text-nu-grey1 hover:text-white hover:bg-nu-purple3 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        {successData ? (
          /* PANTALLA DE ÉXITO ESTILO NUBANK */
          <div className="p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-nu-master1/15 border-4 border-nu-master1 flex items-center justify-center mx-auto text-nu-master1 shadow-nu">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-nu-master1">¡Movimiento Exitoso!</h4>
              <p className="text-xs text-nu-grey2">
                {successData.offline ? 'Guardado en cola local (Modo Offline)' : 'Sincronizado en tiempo real con Google Sheets'}
              </p>
            </div>

            {/* Tarjeta Resumen */}
            <div className="bg-nu-offwhite p-4 rounded-2xl border border-nu-grey1 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-nu-grey1">
                <span className="text-nu-grey2">Tipo de Operación:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  successData.Tipo_Movimiento === 'Entrada' ? 'bg-nu-lightblue/30 text-nu-master1' :
                  successData.Tipo_Movimiento === 'Salida' ? 'bg-nu-coral/20 text-rose-700' : 'bg-nu-purple1/20 text-nu-purple2'
                }`}>
                  {successData.Tipo_Movimiento}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-nu-grey2">Producto:</span>
                <span className="font-bold text-nu-black text-right max-w-[200px] truncate">{successData.Nombre_Producto}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-nu-grey2">Cantidad Registrada:</span>
                <span className="font-extrabold text-nu-master1 text-sm">{successData.Cantidad} unidades</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-nu-grey2">Nuevo Stock en Almacén:</span>
                <span className="font-extrabold text-nu-black bg-nu-grey1/60 px-2 py-0.5 rounded">
                  {successData.nuevoStock} unidades
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-nu-grey1">
                <span className="text-nu-grey2">Responsable:</span>
                <span className="font-medium text-nu-grey3">{successData.Nombre_Usuario}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full touch-target py-3.5 px-4 rounded-xl bg-nu-master1 hover:bg-nu-purple2 text-white font-bold text-sm shadow-md transition"
            >
              Completado / Regresar al Catálogo
            </button>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO PASO A PASO */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            
            {/* 1. SELECTOR SEGMENTADO DE OPERACIÓN */}
            <div>
              <label className="block text-xs font-bold text-nu-grey3 uppercase tracking-wider mb-2">
                1. Tipo de Operación
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-nu-offwhite rounded-2xl border border-nu-grey1">
                
                {/* Entrada (Light Blue Highlight) */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Entrada')}
                  className={`touch-target py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
                    tipoMovimiento === 'Entrada'
                      ? 'bg-nu-master1 text-white shadow-md ring-2 ring-nu-lightblue/50'
                      : 'text-nu-grey3 hover:bg-nu-grey1/70'
                  }`}
                >
                  <ArrowDownLeft className={`w-4 h-4 ${tipoMovimiento === 'Entrada' ? 'text-nu-lightblue' : 'text-emerald-600'}`} />
                  <span>Entrada</span>
                </button>

                {/* Salida (Coral Highlight) */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Salida')}
                  className={`touch-target py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
                    tipoMovimiento === 'Salida'
                      ? 'bg-nu-coral text-white shadow-md ring-2 ring-rose-300'
                      : 'text-nu-grey3 hover:bg-nu-grey1/70'
                  }`}
                >
                  <ArrowUpRight className={`w-4 h-4 ${tipoMovimiento === 'Salida' ? 'text-white' : 'text-nu-coral'}`} />
                  <span>Salida</span>
                </button>

                {/* Uso Interno (Purple 1 Highlight) */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Uso interno')}
                  className={`touch-target py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
                    tipoMovimiento === 'Uso interno'
                      ? 'bg-nu-purple1 text-white shadow-md ring-2 ring-nu-purple2'
                      : 'text-nu-grey3 hover:bg-nu-grey1/70'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  <span>Uso Interno</span>
                </button>

              </div>
            </div>

            {/* 2. RESUMEN DEL PRODUCTO SELECCIONADO */}
            <div className="bg-nu-offwhite p-3.5 rounded-2xl border border-nu-grey1 flex items-center space-x-3.5">
              <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-nu-grey1 flex-shrink-0">
                {product.URL_Foto_Catalogo ? (
                  <img
                    src={product.URL_Foto_Catalogo}
                    alt={product.Nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-nu-grey2">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono bg-nu-master2 text-nu-lightblue px-1.5 py-0.2 rounded font-bold">
                    {product.ID_Producto}
                  </span>
                  <span className="text-xs text-nu-grey2 truncate">{product.Categoria}</span>
                </div>
                <h4 className="font-bold text-nu-black text-sm truncate mt-0.5">
                  {product.Nombre}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-nu-grey3">
                    Stock actual: <strong className="text-nu-master1">{currentStock} {product.Unidad_Medida}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. CANTIDAD CON STEPPER Y PROYECCIÓN */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-nu-grey3 uppercase tracking-wider">
                  2. Cantidad ({product.Unidad_Medida || 'unidades'})
                </label>
                <span className={`text-xs font-semibold ${isQuantityExceeded ? 'text-rose-600' : 'text-nu-purple2'}`}>
                  Resultado: {currentStock} → <strong className="text-sm">{projectedStock}</strong> {product.Unidad_Medida}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Botón Menos */}
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="touch-target w-12 h-12 rounded-xl bg-nu-offwhite border border-nu-grey1 hover:bg-nu-grey1 text-nu-grey3 font-bold text-xl flex items-center justify-center transition active:scale-95"
                >
                  -
                </button>

                {/* Input numérico */}
                <input
                  type="number"
                  min="1"
                  max={isExitOrUsage ? currentStock : 999999}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`flex-1 py-3 text-center rounded-xl bg-white border font-extrabold text-xl focus:outline-none focus:ring-2 transition ${
                    isQuantityExceeded 
                      ? 'border-nu-coral text-nu-coral ring-nu-coral/30' 
                      : 'border-nu-grey1 text-nu-black focus:border-nu-master1 focus:ring-nu-master1/20'
                  }`}
                />

                {/* Botón Más */}
                <button
                  type="button"
                  onClick={() => {
                    if (isExitOrUsage && cantidad >= currentStock) return;
                    setCantidad(cantidad + 1);
                  }}
                  className="touch-target w-12 h-12 rounded-xl bg-nu-offwhite border border-nu-grey1 hover:bg-nu-grey1 text-nu-grey3 font-bold text-xl flex items-center justify-center transition active:scale-95"
                >
                  +
                </button>
              </div>

              {/* Chips rápidos de cantidad */}
              <div className="flex items-center space-x-2 pt-1">
                {[1, 5, 10, 25].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      if (isExitOrUsage && val > currentStock) {
                        setCantidad(currentStock);
                      } else {
                        setCantidad(val);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-nu-offwhite hover:bg-nu-grey1 border border-nu-grey1 text-nu-grey3 transition"
                  >
                    +{val}
                  </button>
                ))}
                {isExitOrUsage && currentStock > 0 && (
                  <button
                    type="button"
                    onClick={() => setCantidad(currentStock)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-nu-purple3/10 text-nu-purple2 hover:bg-nu-purple3/20 transition"
                  >
                    Todo el Stock ({currentStock})
                  </button>
                )}
              </div>

              {/* Alerta si supera el stock */}
              {isQuantityExceeded && (
                <div className="p-3 rounded-xl bg-rose-50 border border-nu-coral/50 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-nu-coral" />
                  <span>
                    No puedes retirar <strong>{cantidad}</strong> unidades. El inventario actual es de únicamente <strong>{currentStock}</strong> unidades.
                  </span>
                </div>
              )}
            </div>

            {/* 4. MOTIVO Y DESTINO SEGÚN TIPO */}
            <div>
              <label className="block text-xs font-bold text-nu-grey3 uppercase tracking-wider mb-1.5">
                3. Motivo / Destino
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-nu-grey3 text-sm font-medium focus:outline-none focus:border-nu-master1 focus:ring-2 focus:ring-nu-master1/20 transition"
              >
                {(MOTIVOS[tipoMovimiento] || []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 5. CAPTURA DE FOTO / EVIDENCIA */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-nu-grey3 uppercase tracking-wider">
                4. Foto de Evidencia / Guía (Opcional)
              </label>

              {fotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-nu-master1 bg-nu-offwhite aspect-video max-h-48 flex items-center justify-center">
                  <img
                    src={fotoPreview}
                    alt="Evidencia"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 touch-target p-2 rounded-xl bg-nu-coral text-white shadow-md hover:brightness-110 transition"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Cámara Móvil */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="touch-target py-3 px-3 rounded-xl bg-nu-offwhite hover:bg-nu-grey1 border border-dashed border-nu-grey2/60 text-nu-grey3 text-xs font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <Camera className="w-4 h-4 text-nu-master1" />
                    <span>Usar Cámara</span>
                  </button>

                  {/* Subir Archivo */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="touch-target py-3 px-3 rounded-xl bg-nu-offwhite hover:bg-nu-grey1 border border-dashed border-nu-grey2/60 text-nu-grey3 text-xs font-bold flex items-center justify-center space-x-2 transition"
                  >
                    <Upload className="w-4 h-4 text-nu-purple2" />
                    <span>Subir Imagen</span>
                  </button>
                </div>
              )}

              {/* Inputs ocultos de archivo */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* 6. OBSERVACIONES ADICIONALES */}
            <div>
              <label className="block text-xs font-bold text-nu-grey3 uppercase tracking-wider mb-1.5">
                5. Observaciones / Nota
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Despacho a sucursal Medellín, Factura #10492, daño en empaque..."
                rows={2}
                className="w-full py-2.5 px-3.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-nu-grey3 placeholder-nu-grey2 text-xs font-medium focus:outline-none focus:border-nu-master1 focus:ring-2 focus:ring-nu-master1/20 transition"
              />
            </div>

            {/* RESPONSABLE ASIGNADO */}
            <div className="py-2 px-3 rounded-xl bg-nu-master2/5 border border-nu-purple3/20 flex items-center justify-between text-xs text-nu-grey3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-nu-master1" />
                <span>Responsable: <strong>{activeUser?.Nombre_Completo || 'Colaborador Nu'}</strong></span>
              </div>
              <span className="text-[10px] bg-nu-purple1/20 text-nu-purple2 px-2 py-0.5 rounded font-bold">
                {activeUser?.Rol || 'Operador'}
              </span>
            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* BOTÓN DE CONFIRMACIÓN */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isQuantityExceeded}
                className={`w-full touch-target py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting || isQuantityExceeded
                    ? 'bg-nu-grey2 cursor-not-allowed'
                    : tipoMovimiento === 'Salida'
                    ? 'bg-nu-coral hover:brightness-105 shadow-nu'
                    : 'bg-nu-master1 hover:bg-nu-purple2 shadow-nu'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Registrando en Google Sheets...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-nu-lightblue" />
                    <span>Confirmar {tipoMovimiento}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
