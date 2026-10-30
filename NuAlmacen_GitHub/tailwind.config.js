/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nu: {
          master1: '#820AD1', // Color Principal de Marca / Botones / Acciones primarias
          purple1: '#BD0FEA', // Acentos / Notificaciones / Highlights activos
          purple2: '#8A05BE', // Superficies secundarias / Hover states
          purple3: '#4C0677', // Contornos / Fondos de tarjetas oscuras
          master2: '#2F0549', // Fondo profundo / Encabezados / Barra superior
          offwhite: '#F4F4F4', // Fondo de aplicación general
          white: '#FFFFFF', // Tarjetas de producto / Modales
          grey1: '#E5E5E5', // Bordes sutiles / Inputs inactivos
          grey2: '#999999', // Placeholders / Texto secundario
          grey3: '#3C3C3C', // Texto principal de lectura / Íconos
          black: '#000000', // Títulos de alto contraste
          mustard: '#D6E303', // Advertencias / Nivel de stock bajo
          coral: '#FF7D6B', // Acciones de salida / Errores / Eliminar
          lightblue: '#6FF5FF', // Información / Acciones del Chatbot / Entradas
        }
      },
      fontFamily: {
        sans: ['Inter', 'Graphik', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'nu': '0 4px 20px -2px rgba(130, 10, 209, 0.12)',
        'nu-lg': '0 10px 30px -4px rgba(130, 10, 209, 0.2)',
        'nu-card': '0 2px 8px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
