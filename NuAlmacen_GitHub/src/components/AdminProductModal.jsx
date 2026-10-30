import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Plus, 
  Save, 
  Image as ImageIcon, 
  Tag, 
  Layers,
  Trash2
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';

export function AdminProductModal({ 
  productToEdit, 
  onClose, 
  onSaveProduct,
  onDeleteProduct 
}) {
  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    ID_Producto: '',
    Nombre: '',
    Categoria: 'Hardware',
    Stock_Actual: 10,
    Stock_Minimo: 5,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: '',
    SKU: ''
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit
      });
    } else {
      setFormData({
        ID_Producto: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
        Nombre: '',
        Categoria: 'Hardware',
        Stock_Actual: 10,
        Stock_Minimo: 5,
        Unidad_Medida: 'Unidades',
        URL_Foto_Catalogo: '',
        SKU: 'NU-' + Math.floor(100 + Math.random() * 900)
      });
    }
  }, [productToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Nombre.trim()) return;

    onSaveProduct({
      ...formData,
      Stock_Actual: Number(formData.Stock_Actual) || 0,
      Stock_Minimo: Number(formData.Stock_Minimo) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-nu-master2/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-nu-white max-w-lg w-full rounded-3xl shadow-2xl border border-nu-grey1 overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="bg-nu-master2 text-white p-5 border-b border-nu-purple3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-nu-purple1 flex items-center justify-center text-white">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto en Catálogo'}
              </h3>
              <p className="text-xs text-nu-lightblue">Pestaña: Catalogo_Productos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-nu-grey1 hover:text-white hover:bg-nu-purple3 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">ID Producto</label>
              <input
                type="text"
                disabled={isEditing}
                value={formData.ID_Producto}
                onChange={(e) => setFormData({ ...formData, ID_Producto: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">SKU Interno</label>
              <input
                type="text"
                value={formData.SKU}
                onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                placeholder="ej. NU-POS-03"
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nu-grey3 mb-1">Nombre Oficial del Producto</label>
            <input
              type="text"
              value={formData.Nombre}
              onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
              placeholder="ej. Terminal POS Nu Tap & Pay v3"
              className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-medium focus:outline-none focus:border-nu-master1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">Categoría</label>
              <select
                value={formData.Categoria}
                onChange={(e) => setFormData({ ...formData, Categoria: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-medium focus:outline-none focus:border-nu-master1"
              >
                {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">Unidad de Medida</label>
              <select
                value={formData.Unidad_Medida}
                onChange={(e) => setFormData({ ...formData, Unidad_Medida: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-medium focus:outline-none focus:border-nu-master1"
              >
                <option value="Unidades">Unidades</option>
                <option value="Cajas">Cajas</option>
                <option value="Rollos">Rollos</option>
                <option value="Packs">Packs</option>
                <option value="Kilos">Kilos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">Stock Actual Inicial</label>
              <input
                type="number"
                min="0"
                value={formData.Stock_Actual}
                onChange={(e) => setFormData({ ...formData, Stock_Actual: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-bold text-nu-master1"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-nu-grey3 mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min="0"
                value={formData.Stock_Minimo}
                onChange={(e) => setFormData({ ...formData, Stock_Minimo: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-bold text-amber-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nu-grey3 mb-1">URL Foto del Catálogo</label>
            <input
              type="url"
              value={formData.URL_Foto_Catalogo}
              onChange={(e) => setFormData({ ...formData, URL_Foto_Catalogo: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs font-mono"
            />
            {formData.URL_Foto_Catalogo && (
              <div className="mt-2 w-16 h-16 rounded-xl border border-nu-grey1 overflow-hidden">
                <img src={formData.URL_Foto_Catalogo} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-4 flex items-center justify-between space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Seguro que deseas eliminar este producto del catálogo?')) {
                    onDeleteProduct(formData.ID_Producto);
                    onClose();
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-50 text-nu-coral hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            )}

            <div className="flex-1 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-nu-offwhite hover:bg-nu-grey1 border border-nu-grey1 text-xs font-semibold text-nu-grey3 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-nu-master1 hover:bg-nu-purple2 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Producto</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
