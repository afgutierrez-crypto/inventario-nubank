import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Package, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';

export function ChatbotNuBot({ 
  products, 
  movements, 
  onSelectProductForMovement 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy NuBot, tu asistente inteligente de almacén. Puedo responder dudas de stock, movimientos recientes, consultar quién retiró un producto o explicarte los protocolos operativos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '¿Cuál fue la última salida registrada?',
        '¿Qué productos tienen stock bajo?',
        '¿Quién retiró el Terminal POS?',
        'Protocolo de mermas'
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Detección de productos con bajo stock
  const lowStockProducts = products.filter(
    p => Number(p.Stock_Actual) <= Number(p.Stock_Minimo)
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Motor de Procesamiento de Lenguaje Natural (NLP Local)
  const processQuery = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. ¿Cuál fue la última salida?
    if (q.includes('última salida') || q.includes('ultima salida') || q.includes('último movimiento')) {
      const salidas = movements.filter(m => m.Tipo_Movimiento === 'Salida' || m.Tipo_Movimiento === 'Uso interno');
      if (salidas.length === 0) {
        return {
          text: 'No hay registro de salidas recientes en la base de datos de movimientos.',
          type: 'info'
        };
      }
      const last = salidas[salidas.length - 1];
      return {
        text: `La última salida fue de **${last.Cantidad} unidades** de **"${last.Nombre_Producto}"** realizada por **${last.Nombre_Usuario}** el día *${last.Timestamp}*.\n\nMotivo registrado: *${last.Motivo_Destino || 'No especificado'}*.`,
        product: products.find(p => p.ID_Producto === last.ID_Producto)
      };
    }

    // 2. ¿Quién retiró [producto]?
    if (q.includes('quién retiró') || q.includes('quien retiro') || q.includes('quién sacó') || q.includes('quien saco')) {
      // Buscar producto mencionado
      const matchedProd = products.find(p => 
        q.includes(p.Nombre.toLowerCase()) || 
        q.includes(p.ID_Producto.toLowerCase()) || 
        (p.SKU && q.includes(p.SKU.toLowerCase())) ||
        (q.includes('pos') && p.Nombre.toLowerCase().includes('pos')) ||
        (q.includes('hoodie') && p.Nombre.toLowerCase().includes('hoodie')) ||
        (q.includes('tarjeta') && p.Nombre.toLowerCase().includes('tarjeta'))
      );

      if (matchedProd) {
        const prodMovements = movements.filter(m => 
          m.ID_Producto === matchedProd.ID_Producto && 
          (m.Tipo_Movimiento === 'Salida' || m.Tipo_Movimiento === 'Uso interno')
        );

        if (prodMovements.length === 0) {
          return {
            text: `No encontré registros de salidas o retiros para **${matchedProd.Nombre}**. El stock actual sigue intacto con **${matchedProd.Stock_Actual} ${matchedProd.Unidad_Medida}**.`,
            product: matchedProd
          };
        }

        const lastRetiro = prodMovements[prodMovements.length - 1];
        return {
          text: `El último colaborador en retirar **${matchedProd.Nombre}** fue **${lastRetiro.Nombre_Usuario}** (${lastRetiro.ID_Usuario_Responsable || 'Operador'}).\n\n• **Cantidad:** ${lastRetiro.Cantidad} ${matchedProd.Unidad_Medida}\n• **Fecha/Hora:** ${lastRetiro.Timestamp}\n• **Destino:** ${lastRetiro.Motivo_Destino}\n• **Observación:** ${lastRetiro.Observaciones || 'Sin notas adicionales'}`,
          product: matchedProd
        };
      } else {
        return {
          text: 'No identifiqué qué producto específico deseas consultar. Puedes preguntarme por ejemplo: *"¿Quién retiró el Terminal POS?"* o *"¿Quién retiró el Hoodie Nu?"*.',
          suggestions: ['¿Quién retiró el Terminal POS?', '¿Quién retiró el Hoodie Nu?']
        };
      }
    }

    // 3. Consulta de Stock por categoría o producto
    if (q.includes('cuántas') || q.includes('cuantas') || q.includes('cuánto') || q.includes('cuanto') || q.includes('stock de') || q.includes('quedan')) {
      // Verificar si pregunta por categoría
      const categories = ['Hardware', 'Tarjetas', 'Merchandising', 'Suministros', 'Empaque'];
      const matchedCat = categories.find(c => q.includes(c.toLowerCase()));

      if (matchedCat) {
        const catProducts = products.filter(p => p.Categoria.toLowerCase() === matchedCat.toLowerCase());
        const totalStock = catProducts.reduce((sum, p) => sum + Number(p.Stock_Actual), 0);
        const details = catProducts.map(p => `• **${p.Nombre}:** ${p.Stock_Actual} ${p.Unidad_Medida} (Mín: ${p.Stock_Minimo})`).join('\n');
        return {
          text: `En la categoría **${matchedCat}** tenemos un total de **${totalStock} unidades** distribuidas en ${catProducts.length} referencias:\n\n${details}`
        };
      }

      // Verificar si pregunta por producto específico
      const matchedProd = products.find(p => 
        q.includes(p.Nombre.toLowerCase()) || 
        q.includes(p.ID_Producto.toLowerCase()) ||
        (q.includes('pos') && p.Nombre.toLowerCase().includes('pos')) ||
        (q.includes('hoodie') && p.Nombre.toLowerCase().includes('hoodie')) ||
        (q.includes('tarjeta') && p.Nombre.toLowerCase().includes('tarjeta')) ||
        (q.includes('lector') && p.Nombre.toLowerCase().includes('lector')) ||
        (q.includes('caja') && p.Nombre.toLowerCase().includes('caja')) ||
        (q.includes('rollo') && p.Nombre.toLowerCase().includes('rollo')) ||
        (q.includes('sticker') && p.Nombre.toLowerCase().includes('sticker'))
      );

      if (matchedProd) {
        const isLow = Number(matchedProd.Stock_Actual) <= Number(matchedProd.Stock_Minimo);
        return {
          text: `Actualmente quedan **${matchedProd.Stock_Actual} ${matchedProd.Unidad_Medida}** de **${matchedProd.Nombre}** (SKU: ${matchedProd.SKU || matchedProd.ID_Producto}).\n\n${
            isLow ? `⚠️ **¡Alerta!** Este producto está en o por debajo de su stock mínimo (${matchedProd.Stock_Minimo}). Se aconseja registrar una Entrada.` : '✅ Nivel de stock saludable.'
          }`,
          product: matchedProd,
          showAction: true
        };
      }
    }

    // 4. Alertas de Stock Bajo
    if (q.includes('stock bajo') || q.includes('alerta') || q.includes('crítico') || q.includes('critico') || q.includes('agotado') || q.includes('reponer')) {
      if (lowStockProducts.length === 0) {
        return {
          text: '🎉 ¡Excelentes noticias! Actualmente todos los productos del inventario están por encima de su nivel de Stock Mínimo.',
        };
      }
      const list = lowStockProducts.map(p => {
        const isZero = Number(p.Stock_Actual) === 0;
        return `• ${isZero ? '🔴' : '🟡'} **${p.Nombre}**: ${p.Stock_Actual} ${p.Unidad_Medida} (Mínimo: ${p.Stock_Minimo})`;
      }).join('\n');

      return {
        text: `⚠️ **Atención:** Hay **${lowStockProducts.length} productos** que requieren reposición urgente:\n\n${list}\n\n¿Deseas que te ayude a registrar una Entrada para alguno de ellos?`
      };
    }

    // 5. Protocolo de Mermas
    if (q.includes('merma') || q.includes('dañado') || q.includes('roto') || q.includes('defecto')) {
      return {
        text: `📋 **Protocolo NuBank para Manejo de Mermas & Bajas:**\n\n1. Selecciona el producto afectado y haz clic en **Registrar Movimiento**.\n2. Elige el tipo de operación **Salida**.\n3. En el campo **Motivo / Destino**, selecciona estrictamente *"Mermas / Daño físico"*.\n4. **Obligatorio:** Toma una fotografía nítida del daño utilizando el botón *"Usar Cámara"* como evidencia auditable.\n5. En observaciones, anota el número de serie o detalle de la falla física.`
      };
    }

    // 6. Protocolo de Salidas y Despachos
    if (q.includes('protocolo de salida') || q.includes('despacho') || q.includes('como sacar') || q.includes('cómo sacar')) {
      return {
        text: `📦 **Protocolo de Salida y Despacho:**\n\n1. Verifica físicamente la orden o guía de despacho del cliente/sucursal.\n2. Ubica el producto en el catálogo y pulsa **Registrar Movimiento**.\n3. Selecciona **Salida**.\n4. Ingresa la cantidad exacta (el sistema bloqueará retiros superiores al stock disponible).\n5. Selecciona el motivo ("Venta despachada" o "Envío a sucursal").\n6. Sube foto del remito o guía firmada para el respaldo en Google Drive/Sheets.`
      };
    }

    // 7. Protocolo de Entradas
    if (q.includes('entrada') || q.includes('recepción') || q.includes('proveedor') || q.includes('ingreso')) {
      return {
        text: `📥 **Protocolo de Recepción de Entradas:**\n\n1. Cuenta físicamente las cajas/unidades recibidas del proveedor contra la factura.\n2. En la app, pulsa **Registrar Movimiento** > **Entrada**.\n3. Introduce la cantidad entrante (el stock en Google Sheets se incrementará automáticamente en tiempo real).\n4. Toma foto a la factura o remisión del transportista.\n5. Elige motivo *"Compra a proveedor"* y confirma.`
      };
    }

    // Fallback inteligente
    return {
      text: `Entendido. Puedo buscar información sobre cualquier producto o movimiento en el almacén. Prueba consultándome algo como:\n\n• *"¿Cuántas unidades quedan de Hardware?"*\n• *"¿Quién retiró el Hoodie Nu?"*\n• *"Ver alertas de stock bajo"*\n• *"Protocolo de mermas"*`,
      suggestions: [
        '¿Qué productos tienen stock bajo?',
        '¿Cuántas unidades quedan de Hardware?',
        'Protocolo de salida'
      ]
    };
  };

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        product: response.product,
        showAction: response.showAction,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* BOTÓN FLOTANTE ESTILO NUBANK */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative touch-target w-14 h-14 rounded-2xl bg-nu-master1 hover:bg-nu-purple2 text-white shadow-nu-lg flex items-center justify-center transition-all duration-300 transform active:scale-95 border-2 ${
            isOpen ? 'rotate-90 bg-nu-master2 border-nu-purple1' : 'border-nu-lightblue/80 pulse-glow'
          }`}
          aria-label="Abrir Asistente NuBot"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-7 h-7 text-nu-lightblue" />
              {/* Notificación si hay stock bajo */}
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-nu-mustard text-nu-black text-[10px] font-extrabold flex items-center justify-center border-2 border-nu-master2">
                  {lowStockProducts.length}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* VENTANA CHATBOT (DRAWER / MODAL) */}
      {isOpen && (
        <div className="fixed bottom-24 sm:bottom-24 right-2 sm:right-6 w-[95vw] sm:w-[420px] h-[540px] max-h-[80vh] z-50 bg-nu-white rounded-3xl shadow-2xl border border-nu-grey1/90 flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header NuBot */}
          <div className="bg-nu-master2 text-white p-4 border-b border-nu-purple3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-nu-master1 border border-nu-lightblue/40 flex items-center justify-center shadow">
                <Bot className="w-5 h-5 text-nu-lightblue" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-sm text-white">NuBot</h4>
                  <span className="w-2 h-2 rounded-full bg-nu-lightblue animate-pulse"></span>
                </div>
                <p className="text-[11px] text-nu-grey2">Asistente Inteligente de Almacén</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-nu-grey1 hover:text-white hover:bg-nu-purple3 transition"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Proactivo de Alertas de Stock */}
          {lowStockProducts.length > 0 && (
            <div className="bg-nu-mustard/25 border-b border-nu-mustard/60 px-3.5 py-2 flex items-center justify-between text-xs text-amber-950 font-medium">
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><strong>{lowStockProducts.length} productos</strong> bajo el stock mínimo</span>
              </div>
              <button
                onClick={() => handleSend('¿Qué productos tienen stock bajo?')}
                className="text-[11px] font-bold text-nu-purple2 hover:underline"
              >
                Ver
              </button>
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-nu-offwhite">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-nu-master1 text-white rounded-br-none'
                      : 'bg-white text-nu-grey3 border border-nu-grey1 rounded-bl-none'
                  }`}
                >
                  {msg.text}

                  {/* Tarjeta de Acción Rápida si la respuesta involucra un producto */}
                  {msg.product && (
                    <div className="mt-3 p-2.5 rounded-xl bg-nu-offwhite border border-nu-grey1 flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white overflow-hidden border border-nu-grey1 flex-shrink-0">
                          {msg.product.URL_Foto_Catalogo ? (
                            <img src={msg.product.URL_Foto_Catalogo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-1 text-nu-grey2" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-nu-black text-xs truncate">{msg.product.Nombre}</p>
                          <p className="text-[10px] text-nu-grey2">Stock: {msg.product.Stock_Actual} {msg.product.Unidad_Medida}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onSelectProductForMovement(msg.product);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-nu-master1 hover:bg-nu-purple2 text-white text-[11px] font-bold transition flex items-center space-x-1 shadow-sm flex-shrink-0"
                      >
                        <span>Mover</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Chips de Sugerencias */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] py-1 px-2.5 rounded-full bg-white hover:bg-nu-purple1/10 border border-nu-purple1/30 text-nu-purple2 font-medium transition text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-nu-grey2 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white p-3 rounded-2xl rounded-bl-none border border-nu-grey1 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-nu-master1 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-nu-purple1 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-nu-lightblue animate-bounce delay-200"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-nu-grey1 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregunta a NuBot sobre stock o salidas..."
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-nu-offwhite border border-nu-grey1 text-nu-grey3 placeholder-nu-grey2 text-xs sm:text-sm focus:outline-none focus:border-nu-master1 focus:ring-1 focus:ring-nu-master1"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="touch-target p-2.5 rounded-xl bg-nu-master1 hover:bg-nu-purple2 disabled:bg-nu-grey1 text-white disabled:text-nu-grey2 transition shadow"
            >
              <Send className="w-4 h-4 text-nu-lightblue" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
