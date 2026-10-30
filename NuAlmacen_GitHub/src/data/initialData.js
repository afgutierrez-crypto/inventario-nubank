/**
 * DATOS INICIALES Y ESQUEMA (Sincronizados con Google Sheets)
 */

export const INITIAL_USERS = [
  {
    ID_Usuario: 'USR-001',
    Nombre_Completo: 'Sofía Rivas',
    Rol: 'Operador',
    Email: 'sofia.rivas@nubank.com',
    Activo: 'SI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    ID_Usuario: 'USR-002',
    Nombre_Completo: 'Carlos Mendoza',
    Rol: 'Administrador',
    Email: 'carlos.mendoza@nubank.com',
    Activo: 'SI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    ID_Usuario: 'USR-003',
    Nombre_Completo: 'Valeria Gómez',
    Rol: 'Operador',
    Email: 'valeria.gomez@nubank.com',
    Activo: 'SI',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PRODUCTS = [
  {
    ID_Producto: 'PRD-1001',
    Nombre: 'Terminal POS Nu Tap & Pay v3',
    Categoria: 'Hardware',
    Stock_Actual: 24,
    Stock_Minimo: 8,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-POS-03'
  },
  {
    ID_Producto: 'PRD-1002',
    Nombre: 'Tarjeta Débito Nu Metal Violeta',
    Categoria: 'Tarjetas',
    Stock_Actual: 450,
    Stock_Minimo: 100,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-CRD-MET'
  },
  {
    ID_Producto: 'PRD-1003',
    Nombre: 'Lector Chip Bluetooth Portátil',
    Categoria: 'Hardware',
    Stock_Actual: 6, // Bajo stock
    Stock_Minimo: 10,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-LEC-BT'
  },
  {
    ID_Producto: 'PRD-1004',
    Nombre: 'Hoodie Nu Morado Oficial Talla M',
    Categoria: 'Merchandising',
    Stock_Actual: 3, // Crítico
    Stock_Minimo: 12,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-MRCH-HDM'
  },
  {
    ID_Producto: 'PRD-1005',
    Nombre: 'Caja de Envío Ecológica Morada S',
    Categoria: 'Empaque',
    Stock_Actual: 120,
    Stock_Minimo: 30,
    Unidad_Medida: 'Cajas',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-BOX-S'
  },
  {
    ID_Producto: 'PRD-1006',
    Nombre: 'Rollos Térmicos para Impresora 57mm',
    Categoria: 'Suministros',
    Stock_Actual: 50,
    Stock_Minimo: 20,
    Unidad_Medida: 'Rollos',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-ROL-57'
  },
  {
    ID_Producto: 'PRD-1007',
    Nombre: 'Stickers Holográficos NuBank',
    Categoria: 'Merchandising',
    Stock_Actual: 0, // Agotado
    Stock_Minimo: 50,
    Unidad_Medida: 'Packs',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-STK-HOL'
  },
  {
    ID_Producto: 'PRD-1008',
    Nombre: 'Lanyards Nu Morado con Mosquetón',
    Categoria: 'Merchandising',
    Stock_Actual: 85,
    Stock_Minimo: 25,
    Unidad_Medida: 'Unidades',
    URL_Foto_Catalogo: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60',
    SKU: 'NU-LAN-01'
  }
];

export const INITIAL_MOVEMENTS = [
  {
    ID_Movimiento: 'MOV-2026-001',
    Timestamp: '2026-10-28 09:15:00',
    Tipo_Movimiento: 'Entrada',
    ID_Producto: 'PRD-1001',
    Nombre_Producto: 'Terminal POS Nu Tap & Pay v3',
    Cantidad: 30,
    ID_Usuario_Responsable: 'USR-002',
    Nombre_Usuario: 'Carlos Mendoza',
    URL_Foto_Evidencia: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60',
    Motivo_Destino: 'Compra a proveedor',
    Observaciones: 'Lote importación inicial #PO-9942'
  },
  {
    ID_Movimiento: 'MOV-2026-002',
    Timestamp: '2026-10-29 11:30:00',
    Tipo_Movimiento: 'Salida',
    ID_Producto: 'PRD-1001',
    Nombre_Producto: 'Terminal POS Nu Tap & Pay v3',
    Cantidad: 6,
    ID_Usuario_Responsable: 'USR-001',
    Nombre_Usuario: 'Sofía Rivas',
    URL_Foto_Evidencia: '',
    Motivo_Destino: 'Venta despachada',
    Observaciones: 'Despacho comercial clientes corporativos'
  },
  {
    ID_Movimiento: 'MOV-2026-003',
    Timestamp: '2026-10-30 08:20:00',
    Tipo_Movimiento: 'Uso interno',
    ID_Producto: 'PRD-1004',
    Nombre_Producto: 'Hoodie Nu Morado Oficial Talla M',
    Cantidad: 2,
    ID_Usuario_Responsable: 'USR-001',
    Nombre_Usuario: 'Sofía Rivas',
    URL_Foto_Evidencia: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    Motivo_Destino: 'Dotación de personal',
    Observaciones: 'Entrega a nuevos pasantes de Software Engineering'
  }
];

export const CATEGORIES = [
  'Todos',
  'Hardware',
  'Tarjetas',
  'Merchandising',
  'Suministros',
  'Empaque'
];

export const MOTIVOS = {
  Entrada: [
    'Compra a proveedor',
    'Devolución de cliente',
    'Ajuste positivo de inventario',
    'Producción terminada / Ensamble',
    'Recepción entre sucursales'
  ],
  Salida: [
    'Venta despachada',
    'Envío a sucursal',
    'Mermas / Daño físico',
    'Devolución a proveedor',
    'Obsolescencia tecnológica'
  ],
  'Uso interno': [
    'Dotación de personal',
    'Consumo en oficinas Nu',
    'Pruebas y QA de laboratorio',
    'Muestras de marketing / Eventos',
    'Mantenimiento e infraestructura'
  ]
};
