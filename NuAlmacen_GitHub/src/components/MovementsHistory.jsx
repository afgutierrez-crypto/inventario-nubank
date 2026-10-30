import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Repeat, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  FileText, 
  Search, 
  Filter, 
  ExternalLink,
  X
} from 'lucide-react';

export function MovementsHistory({ movements }) {
  const [filterType, setFilterType] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Filtrado
  const filteredMovements = movements.filter(mov => {
    const matchesType = filterType === 'Todos' || mov.Tipo_Movimiento === filterType;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      mov.Nombre_Producto?.toLowerCase().includes(query) ||
      mov.ID_Producto?.toLowerCase().includes(query) ||
      mov.Nombre_Usuario?.toLowerCase().includes(query) ||
      mov.Motivo_Destino?.toLowerCase().includes(query) ||
      mov.Observaciones?.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Controles y Filtros */}
      <div className="bg-nu-white p-4 rounded-2xl border border-nu-grey1/80 shadow-nu-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-nu-grey2 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por producto, responsable o motivo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-xs sm:text-sm font-medium focus:outline-none focus:border-nu-master1 focus:ring-1 focus:ring-nu-master1"
            />
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Todos', 'Entrada', 'Salida', 'Uso interno'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition touch-target ${
                  filterType === type
                    ? 'bg-nu-master1 text-white shadow'
                    : 'bg-nu-offwhite text-nu-grey3 hover:bg-nu-grey1 border border-nu-grey1'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Lista de Movimientos */}
      {filteredMovements.length === 0 ? (
        <div className="bg-nu-white p-12 rounded-2xl border border-dashed border-nu-grey1 text-center">
          <FileText className="w-12 h-12 text-nu-grey2 mx-auto mb-2" />
          <h4 className="font-bold text-nu-black text-sm">Sin movimientos registrados</h4>
          <p className="text-xs text-nu-grey2 mt-1">No hay registros que coincidan con los filtros actuales.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMovements.map((mov, idx) => {
            const isEntrada = mov.Tipo_Movimiento === 'Entrada';
            const isSalida = mov.Tipo_Movimiento === 'Salida';
            const isUso = mov.Tipo_Movimiento === 'Uso interno';

            return (
              <div
                key={mov.ID_Movimiento || idx}
                className="bg-nu-white p-4 sm:p-5 rounded-2xl border border-nu-grey1/80 shadow-nu-card hover:border-nu-purple1/40 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Lado izquierdo: Tipo, Nombre e ID */}
                <div className="flex items-start space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isEntrada ? 'bg-nu-lightblue/25 text-nu-master1 border border-nu-lightblue/50' :
                    isSalida ? 'bg-nu-coral/20 text-rose-700 border border-nu-coral/40' :
                    'bg-nu-purple1/20 text-nu-purple2 border border-nu-purple1/40'
                  }`}>
                    {isEntrada && <ArrowDownLeft className="w-5 h-5 text-nu-master1" />}
                    {isSalida && <ArrowUpRight className="w-5 h-5 text-nu-coral" />}
                    {isUso && <Repeat className="w-5 h-5 text-nu-purple1" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isEntrada ? 'bg-nu-lightblue/30 text-nu-master1' :
                        isSalida ? 'bg-nu-coral/20 text-rose-700' :
                        'bg-nu-purple1/20 text-nu-purple2'
                      }`}>
                        {mov.Tipo_Movimiento}
                      </span>
                      <span className="text-xs text-nu-grey2 font-mono">
                        {mov.ID_Movimiento || 'MOV-RECENT'}
                      </span>
                    </div>

                    <h4 className="font-bold text-nu-black text-sm sm:text-base mt-1">
                      {mov.Nombre_Producto}
                    </h4>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-nu-grey2 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-nu-grey2" />
                        <span>{mov.Timestamp}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-nu-master1" />
                        <span className="font-medium text-nu-grey3">{mov.Nombre_Usuario}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lado central: Motivo & Observaciones */}
                <div className="md:max-w-xs text-xs space-y-1 bg-nu-offwhite p-2.5 rounded-xl border border-nu-grey1/70">
                  <div className="text-nu-grey3">
                    <span className="text-nu-grey2">Motivo: </span>
                    <strong className="text-nu-black">{mov.Motivo_Destino || 'General'}</strong>
                  </div>
                  {mov.Observaciones && (
                    <p className="text-nu-grey2 italic line-clamp-2">
                      "{mov.Observaciones}"
                    </p>
                  )}
                </div>

                {/* Lado derecho: Cantidad & Evidencia */}
                <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-2 md:pt-0">
                  {/* Foto de Evidencia Thumbnail */}
                  {mov.URL_Foto_Evidencia || mov.fotoBase64 ? (
                    <button
                      onClick={() => setSelectedPhoto(mov.URL_Foto_Evidencia || mov.fotoBase64)}
                      className="touch-target p-1 rounded-xl border border-nu-purple1/40 hover:border-nu-master1 bg-nu-offwhite transition group relative"
                      title="Ver foto de evidencia"
                    >
                      <img
                        src={mov.URL_Foto_Evidencia || mov.fotoBase64}
                        alt="Evidencia"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-nu-master1 text-white p-0.5 rounded-full shadow">
                        <ImageIcon className="w-2.5 h-2.5" />
                      </span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-nu-grey2 italic hidden md:inline">
                      Sin evidencia
                    </span>
                  )}

                  {/* Cantidad */}
                  <div className="text-right">
                    <span className={`text-lg sm:text-xl font-black ${
                      isEntrada ? 'text-emerald-600' : isSalida ? 'text-rose-600' : 'text-nu-purple2'
                    }`}>
                      {isEntrada ? '+' : '-'}{mov.Cantidad}
                    </span>
                    <span className="block text-[10px] text-nu-grey2 font-semibold uppercase">
                      Unidades
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PREVISUALIZADOR DE FOTO EN ALTA DEFINICIÓN */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-nu-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-nu-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-nu-grey1">
            <div className="bg-nu-master2 text-white p-4 flex items-center justify-between">
              <span className="text-sm font-bold flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-nu-lightblue" />
                <span>Foto de Evidencia del Movimiento</span>
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg hover:bg-nu-purple3 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-nu-offwhite flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto}
                alt="Evidencia en grande"
                className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>
            <div className="p-4 bg-white text-right">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-5 py-2 rounded-xl bg-nu-master1 text-white text-xs font-bold hover:bg-nu-purple2 transition shadow"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
