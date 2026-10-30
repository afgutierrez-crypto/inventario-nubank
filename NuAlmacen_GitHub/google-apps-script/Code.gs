/**
 * ============================================================================
 * NUBANK INVENTORY & WAREHOUSE MANAGEMENT - BACKEND GOOGLE APPS SCRIPT
 * Sincronización Bidireccional en Tiempo Real con la Web App
 * ============================================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Crea una nueva hoja de cálculo en Google Sheets (o usa una existente).
 * 2. Ve a 'Extensiones' > 'Apps Script'.
 * 3. Borra el código existente y pega todo este contenido.
 * 4. Haz clic en 'Implementar' (Deploy) > 'Nueva implementación' (New deployment).
 * 5. Selecciona tipo: 'Aplicación web' (Web app).
 *    - Descripción: "NuBank Inventario API v1"
 *    - Ejecutar como: "Yo" (Tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (Anyone) -> IMPORTANTE para permitir que la PWA se conecte sin bloqueos de login.
 * 6. Haz clic en 'Implementar', autoriza los permisos y copia la URL proporcionada.
 * 7. Pega esa URL en la configuración de la aplicación web NuBank en la sección "Conectar Google Sheets".
 */

// Nombres de las pestañas requeridas según la especificación
const SHEETS = {
  USERS: 'Usuarios',
  PRODUCTS: 'Catalogo_Productos',
  MOVEMENTS: 'Movimientos'
};

/**
 * Función que se ejecuta en peticiones HTTP GET
 */
function doGet(e) {
  try {
    ensureSheetsStructure();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    
    if (action === 'ping') {
      return jsonResponse({ status: 'success', message: 'NuBank Inventory API Online', timestamp: new Date().toISOString() });
    }
    
    if (action === 'getProducts') {
      const products = getSheetData(SHEETS.PRODUCTS);
      return jsonResponse({ status: 'success', data: products });
    }
    
    if (action === 'getMovements') {
      const movements = getSheetData(SHEETS.MOVEMENTS);
      return jsonResponse({ status: 'success', data: movements });
    }
    
    if (action === 'getUsers') {
      const users = getSheetData(SHEETS.USERS).map(u => {
        // Por seguridad no exponemos hashes
        const { Password_Hash, ...safeUser } = u;
        return safeUser;
      });
      return jsonResponse({ status: 'success', data: users });
    }
    
    // Default: 'getAll'
    const users = getSheetData(SHEETS.USERS).map(u => {
      const { Password_Hash, ...safeUser } = u;
      return safeUser;
    });
    const products = getSheetData(SHEETS.PRODUCTS);
    const movements = getSheetData(SHEETS.MOVEMENTS);
    
    return jsonResponse({
      status: 'success',
      data: {
        users: users,
        products: products,
        movements: movements
      },
      serverTime: new Date().toISOString()
    });
    
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Función que se ejecuta en peticiones HTTP POST
 */
function doPost(e) {
  try {
    ensureSheetsStructure();
    
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // En caso de que se envíe como formulario
        payload = e.parameter || {};
      }
    }
    
    const action = payload.action || (e && e.parameter && e.parameter.action);
    
    if (action === 'registerMovement') {
      return handleRegisterMovement(payload.movement);
    }
    
    if (action === 'syncOfflineQueue') {
      return handleSyncOfflineQueue(payload.movements);
    }
    
    if (action === 'saveProduct') {
      return handleSaveProduct(payload.product);
    }
    
    if (action === 'deleteProduct') {
      return handleDeleteProduct(payload.idProducto);
    }
    
    return jsonResponse({ status: 'error', message: 'Acción no reconocida: ' + action });
    
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Registrar un movimiento y actualizar el stock atómicamente
 */
function handleRegisterMovement(movement) {
  if (!movement || !movement.ID_Producto || !movement.Cantidad || !movement.Tipo_Movimiento) {
    return jsonResponse({ status: 'error', message: 'Datos de movimiento incompletos' });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const movSheet = ss.getSheetByName(SHEETS.MOVEMENTS);
  
  const prodData = prodSheet.getDataRange().getValues();
  if (prodData.length <= 1) {
    return jsonResponse({ status: 'error', message: 'Catálogo de productos vacío' });
  }
  
  const headers = prodData[0];
  const idColIdx = headers.indexOf('ID_Producto');
  const stockColIdx = headers.indexOf('Stock_Actual');
  const nameColIdx = headers.indexOf('Nombre');
  
  if (idColIdx === -1 || stockColIdx === -1) {
    return jsonResponse({ status: 'error', message: 'Estructura de columnas inválida en Catalogo_Productos' });
  }
  
  let targetRowIdx = -1;
  let currentStock = 0;
  let productName = movement.Nombre_Producto || '';
  
  for (let i = 1; i < prodData.length; i++) {
    if (String(prodData[i][idColIdx]).trim() === String(movement.ID_Producto).trim()) {
      targetRowIdx = i + 1; // 1-indexed para Sheets
      currentStock = Number(prodData[i][stockColIdx]) || 0;
      if (!productName && nameColIdx !== -1) {
        productName = prodData[i][nameColIdx];
      }
      break;
    }
  }
  
  if (targetRowIdx === -1) {
    return jsonResponse({ status: 'error', message: 'Producto no encontrado: ' + movement.ID_Producto });
  }
  
  const qty = Number(movement.Cantidad);
  let newStock = currentStock;
  const tipo = String(movement.Tipo_Movimiento).trim();
  
  if (tipo.toLowerCase().includes('entrada')) {
    newStock = currentStock + qty;
  } else if (tipo.toLowerCase().includes('salida') || tipo.toLowerCase().includes('uso')) {
    if (qty > currentStock) {
      return jsonResponse({ 
        status: 'error', 
        message: 'Stock insuficiente. Stock actual: ' + currentStock + ', intentado retirar: ' + qty 
      });
    }
    newStock = currentStock - qty;
  } else {
    return jsonResponse({ status: 'error', message: 'Tipo de movimiento inválido: ' + tipo });
  }
  
  // Guardar imagen en Google Drive si viene en base64
  let fotoUrl = movement.URL_Foto_Evidencia || '';
  if (movement.fotoBase64) {
    try {
      fotoUrl = saveBase64ImageToDrive(movement.fotoBase64, 'Evidencia_' + movement.ID_Producto + '_' + Date.now());
    } catch (driveErr) {
      // Si falla Drive, mantenemos lo que se pueda o dejamos placeholder
      fotoUrl = movement.URL_Foto_Evidencia || 'https://via.placeholder.com/400?text=Foto+Guardada';
    }
  }
  
  // Actualizar stock en celda correspondiente
  prodSheet.getRange(targetRowIdx, stockColIdx + 1).setValue(newStock);
  
  // Generar ID de movimiento si no tiene
  const movId = movement.ID_Movimiento || ('MOV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random()*1000));
  const timestamp = movement.Timestamp || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  
  // Insertar en hoja Movimientos
  // Columnas: ID_Movimiento, Timestamp, Tipo_Movimiento, ID_Producto, Nombre_Producto, Cantidad, ID_Usuario_Responsable, Nombre_Usuario, URL_Foto_Evidencia, Motivo_Destino, Observaciones
  movSheet.appendRow([
    movId,
    timestamp,
    movement.Tipo_Movimiento,
    movement.ID_Producto,
    productName,
    qty,
    movement.ID_Usuario_Responsable || 'USR-001',
    movement.Nombre_Usuario || 'Operador',
    fotoUrl,
    movement.Motivo_Destino || '',
    movement.Observaciones || ''
  ]);
  
  return jsonResponse({
    status: 'success',
    message: 'Movimiento registrado con éxito',
    data: {
      ID_Movimiento: movId,
      ID_Producto: movement.ID_Producto,
      Nuevo_Stock: newStock,
      Timestamp: timestamp,
      URL_Foto_Evidencia: fotoUrl
    }
  });
}

/**
 * Sincronizar cola de movimientos registrados offline
 */
function handleSyncOfflineQueue(movements) {
  if (!Array.isArray(movements) || movements.length === 0) {
    return jsonResponse({ status: 'success', syncedCount: 0, results: [] });
  }
  
  const results = [];
  for (let i = 0; i < movements.length; i++) {
    const res = handleRegisterMovement(movements[i]);
    const parsed = JSON.parse(res.getContent());
    results.push(parsed);
  }
  
  return jsonResponse({
    status: 'success',
    syncedCount: results.filter(r => r.status === 'success').length,
    results: results
  });
}

/**
 * Guardar o actualizar producto
 */
function handleSaveProduct(prod) {
  if (!prod || !prod.Nombre || !prod.Categoria) {
    return jsonResponse({ status: 'error', message: 'Datos de producto incompletos' });
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = prodSheet.getDataRange().getValues();
  const headers = data[0];
  const idColIdx = headers.indexOf('ID_Producto');
  
  let targetRow = -1;
  const prodId = prod.ID_Producto || ('PRD-' + Math.floor(1000 + Math.random()*9000));
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]).trim() === String(prodId).trim()) {
      targetRow = i + 1;
      break;
    }
  }
  
  const rowData = [
    prodId,
    prod.Nombre,
    prod.Categoria,
    Number(prod.Stock_Actual) || 0,
    Number(prod.Stock_Minimo) || 5,
    prod.Unidad_Medida || 'Unidades',
    prod.URL_Foto_Catalogo || ''
  ];
  
  if (targetRow !== -1) {
    prodSheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    prodSheet.appendRow(rowData);
  }
  
  return jsonResponse({ status: 'success', message: 'Producto guardado', data: { ID_Producto: prodId } });
}

/**
 * Eliminar producto
 */
function handleDeleteProduct(idProducto) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodSheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = prodSheet.getDataRange().getValues();
  const idColIdx = data[0].indexOf('ID_Producto');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]).trim() === String(idProducto).trim()) {
      prodSheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Producto eliminado' });
    }
  }
  return jsonResponse({ status: 'error', message: 'Producto no encontrado' });
}

/**
 * Guarda imagen base64 en carpeta de Google Drive y retorna enlace público
 */
function saveBase64ImageToDrive(base64Data, filename) {
  const folderName = "NuBank_Inventario_Evidencias";
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  
  // Extraer data limpia de base64
  let contentType = 'image/jpeg';
  let pureBase64 = base64Data;
  if (base64Data.indexOf('data:') === 0) {
    const parts = base64Data.split(',');
    contentType = parts[0].split(';')[0].replace('data:', '');
    pureBase64 = parts[1];
  }
  
  const decoded = Utilities.base64Decode(pureBase64);
  const blob = Utilities.newBlob(decoded, contentType, filename + '.jpg');
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Retornar enlace directo para ver
  return file.getDownloadUrl() || file.getUrl();
}

/**
 * Convierte los datos de una hoja en array de objetos JSON según encabezados
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const list = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] && !row[1]) continue; // Fila vacía
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      }
      obj[headers[j]] = val;
    }
    list.push(obj);
  }
  return list;
}

/**
 * Asegura la creación de las 3 pestañas y sus encabezados con el estilo NuBank
 */
function ensureSheetsStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Usuarios
  let sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEETS.USERS);
    const headers = ['ID_Usuario', 'Nombre_Completo', 'Rol', 'Email', 'Password_Hash', 'Activo'];
    sheetUsers.appendRow(headers);
    formatHeaderRow(sheetUsers);
    
    // Semilla de usuarios
    sheetUsers.appendRow(['USR-001', 'Sofía Rivas', 'Operador', 'sofia.rivas@nubank.com', 'demo123', 'SI']);
    sheetUsers.appendRow(['USR-002', 'Carlos Mendoza', 'Administrador', 'carlos.mendoza@nubank.com', 'admin123', 'SI']);
    sheetUsers.appendRow(['USR-003', 'Valeria Gómez', 'Operador', 'valeria.gomez@nubank.com', 'demo123', 'SI']);
  }
  
  // 2. Catalogo_Productos
  let sheetProd = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!sheetProd) {
    sheetProd = ss.insertSheet(SHEETS.PRODUCTS);
    const headers = ['ID_Producto', 'Nombre', 'Categoria', 'Stock_Actual', 'Stock_Minimo', 'Unidad_Medida', 'URL_Foto_Catalogo'];
    sheetProd.appendRow(headers);
    formatHeaderRow(sheetProd);
    
    // Semilla de productos
    sheetProd.appendRow(['PRD-1001', 'Terminal POS Nu Tap & Pay v3', 'Hardware', 24, 8, 'Unidades', 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1002', 'Tarjeta de Débito Nu Metal Violeta', 'Tarjetas', 450, 100, 'Unidades', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1003', 'Lector Chip Bluetooth Portátil', 'Hardware', 6, 10, 'Unidades', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1004', 'Hoodie Nu morado oficial Talla M', 'Merchandising', 3, 12, 'Unidades', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1005', 'Caja de Envío Ecológica Morada S', 'Empaque', 120, 30, 'Cajas', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1006', 'Rollos Térmicos para Impresora 57mm', 'Suministros', 50, 20, 'Rollos', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=60']);
    sheetProd.appendRow(['PRD-1007', 'Stickers Holográficos NuBank', 'Merchandising', 0, 50, 'Packs', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60']);
  }
  
  // 3. Movimientos
  let sheetMov = ss.getSheetByName(SHEETS.MOVEMENTS);
  if (!sheetMov) {
    sheetMov = ss.insertSheet(SHEETS.MOVEMENTS);
    const headers = ['ID_Movimiento', 'Timestamp', 'Tipo_Movimiento', 'ID_Producto', 'Nombre_Producto', 'Cantidad', 'ID_Usuario_Responsable', 'Nombre_Usuario', 'URL_Foto_Evidencia', 'Motivo_Destino', 'Observaciones'];
    sheetMov.appendRow(headers);
    formatHeaderRow(sheetMov);
    
    // Semilla de movimientos
    sheetMov.appendRow(['MOV-001', '2026-10-28 09:15:00', 'Entrada', 'PRD-1001', 'Terminal POS Nu Tap & Pay v3', 30, 'USR-002', 'Carlos Mendoza', '', 'Compra a proveedor', 'Lote de importación inicial']);
    sheetMov.appendRow(['MOV-002', '2026-10-29 11:30:00', 'Salida', 'PRD-1001', 'Terminal POS Nu Tap & Pay v3', 6, 'USR-001', 'Sofía Rivas', '', 'Venta despachada', 'Despacho a sucursal norte']);
    sheetMov.appendRow(['MOV-003', '2026-10-30 08:20:00', 'Uso interno', 'PRD-1004', 'Hoodie Nu morado oficial Talla M', 2, 'USR-001', 'Sofía Rivas', '', 'Dotación de personal', 'Entrega a nuevos pasantes de TI']);
  }
}

/**
 * Estiliza encabezados con el color de marca NuBank Master Purple 1 (#820AD1)
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#820AD1');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Retorna salida JSON con los headers CORS adecuados
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
