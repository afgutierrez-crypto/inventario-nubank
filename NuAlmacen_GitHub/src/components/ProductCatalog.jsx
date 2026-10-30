import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PlusCircle, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  Filter, 
  SlidersHorizontal,
  X,
  Plus,
  Edit2
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';

export function ProductCatalog({ 
  products, 
  onSelectProductForMovement, 
  userRole, 
  onOpenAddProduct,
  onOpenEditProduct 
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('todos'); // 'todos', 'bajo', 'agotado'

  // Métricas rápidas de inventario
  const stats = useMemo(() => {
    const totalItems = products.length;
    const lowStockCount = products.filter(p => Number(p.Stock_Actual) > 0 && Number(p.Stock_Actual) <= Number(p.Stock_Minimo)).length;
    const outOfStockCount = products.filter(p => Number(p.Stock_Actual) === 0).length;
    const totalUnits = products.reduce((acc, p) => acc + (Number(p.Stock_Actual) || 0), 0);
    return { totalItems, lowStockCount, outOfStockCount, totalUnits };
  }, [products]);

  // Filtrado reactivo en tiempo real
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Categoría
      const matchesCategory = selectedCategory === 'Todos' || product.Categoria === selectedCategory;
      
      // Búsqueda
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        product.Nombre.toLowerCase().includes(query) ||
        product.ID_Producto.toLowerCase().includes(query) ||
        (product.SKU && product.SKU.toLowerCase().includes(query)) ||
        product.Categoria.toLowerCase().includes(query);

      // Filtro de stock
      const stock = Number(product.Stock_Actual) || 0;
      const minStock = Number(product.Stock_Minimo) || 0;
      
      let matchesStock = true;
      if (stockFilter === 'bajo') {
        matchesStock = stock > 0 && stock <= minStock;
      } else if (stockFilter === 'agotado') {
        matchesStock = stock === 0;
      }

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Estilo NuBank */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Productos */}
        <div className="bg-nu-white p-4 rounded-2xl border border-nu-grey1/70 shadow-nu-card">
          <div className="flex items-center justify-between text-nu-grey2 text-xs font-medium">
            <span>Catálogo Total</span>
            <Package className="w-4 h-4 text-nu-master1" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-nu-black">{stats.totalItems}</span>
            <span className="text-xs text-nu-grey2">referencias</span>
          </div>
          <div className="mt-1 text-xs text-nu-purple2 font-medium">
            {stats.totalUnits.toLocaleString()} unidades totales
          </div>
        </div>

        {/* Bajo Stock (Mustard Alert) */}
        <div 
          onClick={() => setStockFilter(stockFilter === 'bajo' ? 'todos' : 'bajo')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-nu-card ${
            stockFilter === 'bajo' 
              ? 'bg-nu-mustard/20 border-nu-mustard ring-2 ring-nu-mustard' 
              : 'bg-nu-white border-nu-grey1/70 hover:border-nu-mustard/60'
          }`}
        >
          <div className="flex items-center justify-between text-nu-grey3 text-xs font-semibold">
            <span>Stock Crítico / Bajo</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-nu-black">{stats.lowStockCount}</span>
            <span className="text-xs font-medium text-amber-700">requieren pedido</span>
          </div>
          <div className="mt-1 text-xs text-amber-700 font-semibold">
            ≤ Stock Mínimo
          </div>
        </div>

        {/* Agotados (Coral Alert) */}
        <div 
          onClick={() => setStockFilter(stockFilter === 'agotado' ? 'todos' : 'agotado')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-nu-card ${
            stockFilter === 'agotado' 
              ? 'bg-nu-coral/20 border-nu-coral ring-2 ring-nu-coral' 
              : 'bg-nu-white border-nu-grey1/70 hover:border-nu-coral/60'
          }`}
        >
          <div className="flex items-center justify-between text-nu-grey3 text-xs font-semibold">
            <span>Agotados (Stock 0)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-nu-coral animate-ping"></span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-nu-coral">{stats.outOfStockCount}</span>
            <span className="text-xs text-nu-grey2">sin existencias</span>
          </div>
          <div className="mt-1 text-xs text-rose-600 font-semibold">
            Alerta inmediata
          </div>
        </div>

        {/* Acceso Rápido Administrador */}
        <div className="bg-gradient-to-br from-nu-master2 to-nu-purple3 p-4 rounded-2xl text-nu-white shadow-nu flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-nu-lightblue">
            <span>Acción Rápida</span>
            <Package className="w-4 h-4 text-nu-lightblue" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {userRole === 'Administrador' ? 'Gestión de Catálogo' : 'Registro Operativo'}
            </div>
            <p className="text-xs text-nu-grey1/80 mt-0.5">
              {userRole === 'Administrador' ? 'Crea y edita ítems oficiales' : 'Entradas, salidas y uso de stock'}
            </p>
          </div>
          {userRole === 'Administrador' && (
            <button
              onClick={onOpenAddProduct}
              className="mt-2 py-1.5 px-3 rounded-xl bg-nu-master1 hover:bg-nu-purple1 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>

      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-nu-white p-4 rounded-2xl border border-nu-grey1/80 shadow-nu-card space-y-4">
        
        {/* Input de Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-nu-grey2" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU (ej. NU-POS), o código PRD..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-nu-offwhite border border-nu-grey1 text-nu-grey3 placeholder-nu-grey2 text-sm font-medium focus:outline-none focus:border-nu-master1 focus:ring-2 focus:ring-nu-master1/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-nu-grey2 hover:text-nu-grey3"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Píldoras de Filtrado por Categoría estilo NuBank */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 touch-target ${
                  isSelected
                    ? 'bg-nu-master1 text-white shadow-sm ring-2 ring-nu-purple1/40 scale-102'
                    : 'bg-nu-offwhite text-nu-grey3 hover:bg-nu-grey1 border border-nu-grey1'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Filtros de estado activos (si aplican) */}
        {stockFilter !== 'todos' && (
          <div className="flex items-center space-x-2 pt-1 border-t border-nu-grey1">
            <span className="text-xs text-nu-grey2">Filtro activo:</span>
            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              stockFilter === 'bajo' ? 'bg-nu-mustard text-nu-black' : 'bg-nu-coral text-white'
            }`}>
              <span>{stockFilter === 'bajo' ? 'Bajo Stock' : 'Agotados'}</span>
              <button onClick={() => setStockFilter('todos')}>
                <X className="w-3 h-3 ml-1" />
              </button>
            </span>
            <button 
              onClick={() => setStockFilter('todos')}
              className="text-xs text-nu-purple2 font-medium hover:underline"
            >
              Limpiar filtro
            </button>
          </div>
        )}

      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-nu-white rounded-2xl border border-dashed border-nu-grey1 p-12 text-center">
          <Package className="w-12 h-12 text-nu-grey2 mx-auto mb-3" />
          <h3 className="text-base font-bold text-nu-black">No se encontraron productos</h3>
          <p className="text-xs text-nu-grey2 max-w-sm mx-auto mt-1">
            Intenta cambiar los términos de búsqueda o el filtro de categorías seleccionado.
          </p>
          {(searchQuery || selectedCategory !== 'Todos' || stockFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setStockFilter('todos');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-nu-master1 text-white text-xs font-semibold hover:bg-nu-purple2 transition"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map(product => {
            const stock = Number(product.Stock_Actual) || 0;
            const minStock = Number(product.Stock_Minimo) || 0;
            const isOutOfStock = stock === 0;
            const isLowStock = !isOutOfStock && stock <= minStock;

            // Porcentaje de stock relativo para barra de progreso
            const maxRef = Math.max(minStock * 2, stock, 1);
            const stockPercent = Math.min(100, Math.round((stock / maxRef) * 100));

            return (
              <div
                key={product.ID_Producto}
                className="bg-nu-white rounded-2xl border border-nu-grey1/90 overflow-hidden shadow-nu-card hover:shadow-nu transition duration-200 flex flex-col justify-between group"
              >
                {/* Cabecera & Contenedor Cuadrado de Imagen */}
                <div>
                  <div className="relative aspect-square w-full bg-nu-offwhite overflow-hidden border-b border-nu-grey1">
                    {product.URL_Foto_Catalogo ? (
                      <img
                        src={product.URL_Foto_Catalogo}
                        alt={product.Nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-nu-grey1 text-nu-grey2">
                        <Package className="w-12 h-12 text-nu-grey2/60" />
                      </div>
                    )}

                    {/* Badge de Categoría */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-nu-master2/85 text-nu-lightblue backdrop-blur-sm shadow-sm">
                        {product.Categoria}
                      </span>
                    </div>

                    {/* SKU Pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/90 text-nu-grey3 shadow-sm border border-nu-grey1">
                        {product.SKU || product.ID_Producto}
                      </span>
                    </div>

                    {/* Badge de Estado de Stock */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      {isOutOfStock ? (
                        <div className="w-full py-1.5 px-3 rounded-xl bg-nu-coral text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>AGOTADO (0 {product.Unidad_Medida || 'u'})</span>
                        </div>
                      ) : isLowStock ? (
                        <div className="w-full py-1.5 px-3 rounded-xl bg-nu-mustard text-nu-black font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-nu-black" />
                          <span>STOCK BAJO ({stock} / Min: {minStock})</span>
                        </div>
                      ) : (
                        <div className="w-full py-1 px-2.5 rounded-lg bg-nu-white/95 text-nu-grey3 text-[11px] font-medium flex items-center justify-between shadow-sm">
                          <span className="text-nu-grey2">Disponible:</span>
                          <span className="font-extrabold text-nu-master1">{stock} {product.Unidad_Medida}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="p-4 space-y-2.5">
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-nu-black text-sm leading-snug line-clamp-2">
                          {product.Nombre}
                        </h4>
                        <span className="text-[11px] font-mono text-nu-grey2">
                          ID: {product.ID_Producto}
                        </span>
                      </div>
                      
                      {userRole === 'Administrador' && (
                        <button
                          onClick={() => onOpenEditProduct(product)}
                          className="touch-target p-1.5 text-nu-grey2 hover:text-nu-master1 hover:bg-nu-offwhite rounded-lg transition"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Barra de progreso de Stock vs Mínimo */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-nu-grey2">Mínimo sugerido: {minStock} {product.Unidad_Medida}</span>
                        <span className={`font-bold ${isOutOfStock ? 'text-nu-coral' : isLowStock ? 'text-amber-600' : 'text-nu-purple2'}`}>
                          {stock} en almacén
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-nu-grey1 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOutOfStock 
                              ? 'bg-nu-coral w-full' 
                              : isLowStock 
                              ? 'bg-amber-400' 
                              : 'bg-nu-master1'
                          }`}
                          style={{ width: `${Math.max(5, stockPercent)}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Botón de Acción Principal (Mínimo 48px touch-target) */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onSelectProductForMovement(product)}
                    className="w-full touch-target py-3 px-4 rounded-xl bg-nu-master1 hover:bg-nu-purple2 active:scale-98 text-white font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center space-x-2 shadow-md hover:shadow-nu"
                  >
                    <PlusCircle className="w-4 h-4 text-nu-lightblue" />
                    <span>Registrar Movimiento</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
