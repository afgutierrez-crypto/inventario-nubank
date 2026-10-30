# NuAlmacén - Aplicación de Gestión de Inventario & Almacén en Tiempo Real

Aplicación web responsive (Mobile-First / PWA) inspirada en el lenguaje de diseño y tokens cromáticos de **NuBank**, integrada bidireccionalmente con **Google Sheets** en tiempo real mediante **Google Apps Script**.

---

## 🎨 Sistema de Diseño y Tokens de Color NuBank

| Token | Código HEX | Rol en la Interfaz |
| :--- | :--- | :--- |
| **Master Purple 1** | `#820AD1` | Color principal de marca, botones principales, acentos activos |
| **Purple 1** | `#BD0FEA` | Highlights activos, notificaciones, uso interno |
| **Purple 2** | `#8A05BE` | Superficies secundarias, hover states |
| **Purple 3** | `#4C0677` | Contornos, fondos de tarjetas oscuras |
| **Master Purple 2** | `#2F0549` | Fondo profundo, encabezados, barra superior |
| **Off-White** | `#F4F4F4` | Fondo general de la aplicación |
| **White** | `#FFFFFF` | Tarjetas de producto, modales |
| **Grey 1** | `#E5E5E5` | Bordes sutiles, inputs inactivos |
| **Grey 2** | `#999999` | Placeholders, textos secundarios |
| **Grey 3** | `#3C3C3C` | Texto principal de lectura, íconos |
| **Black** | `#000000` | Títulos de alto contraste |
| **Mustard** | `#D6E303` | Advertencias, alerta de nivel de stock bajo |
| **Coral** | `#FF7D6B` | Acciones de salida, errores, eliminar |
| **Light Blue** | `#6FF5FF` | Información, acciones de chatbot, entradas |

---

## 🏗️ Arquitectura de Datos (Google Sheets)

La aplicación interactúa en tiempo real con 3 pestañas principales:

1. **`Usuarios`**:
   - `ID_Usuario`, `Nombre_Completo`, `Rol`, `Email`, `Password_Hash`, `Activo`.
2. **`Catalogo_Productos`**:
   - `ID_Producto`, `Nombre`, `Categoria`, `Stock_Actual`, `Stock_Minimo`, `Unidad_Medida`, `URL_Foto_Catalogo`.
3. **`Movimientos`**:
   - `ID_Movimiento`, `Timestamp`, `Tipo_Movimiento` (*Entrada* / *Salida* / *Uso interno*), `ID_Producto`, `Nombre_Producto`, `Cantidad`, `ID_Usuario_Responsable`, `Nombre_Usuario`, `URL_Foto_Evidencia`, `Motivo_Destino`, `Observaciones`.

---

## 🚀 Despliegue de Google Apps Script (Backend)

1. En tu Google Drive, crea una hoja de cálculo en blanco o usa una existente.
2. Ve al menú superior **Extensiones > Apps Script**.
3. Copia todo el contenido del archivo [`google-apps-script/Code.gs`](file:///C:/Users/afgutierrez/.gemini/antigravity/scratch/nu-inventario/google-apps-script/Code.gs) y pégalo en el editor de Apps Script.
4. Haz clic en el botón azul **Implementar (Deploy) > Nueva implementación (New deployment)**.
5. Configura los parámetros:
   - **Tipo**: Aplicación web
   - **Descripción**: `NuBank Inventario API`
   - **Ejecutar como**: `Yo (tu cuenta)`
   - **Quién tiene acceso**: `Cualquiera (Anyone)` *(Indispensable para habilitar la sincronización web sin bloqueos)*.
6. Copia la URL terminada en `/exec`.
7. En la barra superior de la app, pulsa el botón de engranaje / **Modo Local** y pega tu URL en el campo **URL de la Web App**.
8. ¡Listo! Al enviar la primera petición, el script formateará automáticamente las 3 pestañas con encabezados morados `#820AD1` y datos de ejemplo.

---

## 📱 Módulos y Funcionalidades

### A. Autenticación y Perfiles
- Visualización persistente en el encabezado: `"Registrando como: [Nombre del Colaborador]"`.
- Cambio de usuario inmediato con un clic entre perfiles preconfigurados (**Sofía Rivas - Operador**, **Carlos Mendoza - Administrador**, **Valeria Gómez - Operador**) o inicio con ID/Email.
- Control de roles: Administradores tienen permisos para agregar, editar y eliminar referencias del catálogo.

### B. Catálogo Visual de Productos
- Barra de búsqueda reactiva por nombre, código PRD o SKU.
- Píldoras de filtrado por categoría estilo NuBank (*Hardware, Tarjetas, Merchandising, Suministros, Empaque*).
- Badges de stock con semáforo inteligente:
  - **Normal**: Morado / Gris
  - **Stock Bajo (≤ Stock Mínimo)**: Mostaza `#D6E303` con alerta
  - **Agotado (0 unidades)**: Coral `#FF7D6B` con notificación crítica
- Botón touch optimizado de 48px: *"Registrar Movimiento"*.

### C. Flujo de Registro de Movimientos
- Selector segmentado: **Entrada** (`#6FF5FF` / `#820AD1`), **Salida** (`#FF7D6B`), **Uso Interno** (`#BD0FEA`).
- Selector de cantidad con stepper (+ / -), chips rápidos (+1, +5, +10, Todo) y previsualización de nuevo stock (`24 -> 19 unidades`).
- Validación estricta en tiempo real: impide registrar salidas mayores al stock actual.
- Captura de fotografía / evidencia con cámara del teléfono móvil o carga de imagen con previsualización.
- Asignación automática del responsable activo y selector adaptativo de motivos según el tipo de operación.
- Animación de confirmación exitosa y actualización inmediata en la UI.

### D. Chatbot Asistente de Almacén (NuBot)
- Widget flotante en la esquina inferior derecha (`#820AD1` con acento `#6FF5FF`).
- Motor de lenguaje natural que analiza en tiempo real el catálogo y el historial:
  - *¿Quién retiró el producto X?*
  - *¿Cuál fue la última salida registrada?*
  - *¿Cuántas unidades quedan de la categoría Y?*
  - *Protocolo de mermas y protocolo de salidas.*
- Alertas proactivas automáticas para productos bajo el stock mínimo.

### E. Modo Offline & Sincronización Automática
- Almacenamiento local seguro en `localStorage` / `IndexedDB`.
- Detección reactiva de desconexión: los movimientos registrados sin conexión se encolan automáticamente con timestamp.
- Sincronización en lote inmediata cuando se recupera la conexión de red.

---

## 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (PWA)
npm run build

# Previsualizar compilación de producción
npm run preview
```
