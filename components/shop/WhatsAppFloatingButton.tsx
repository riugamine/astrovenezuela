'use client'

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Product } from "@/lib/types/database.types";
import { useExchangeRateStore } from "@/lib/store/useExchangeRateStore";
import { calculateDualPrices, formatDualPrice } from "@/lib/utils/currency-converter";

interface WhatsAppFloatingButtonProps {
  product: Product;
}

/**
 * Botón flotante de WhatsApp para ventas
 * Se muestra en la parte inferior derecha en desktop y en la parte inferior en móviles
 */
export function WhatsAppFloatingButton({ product }: WhatsAppFloatingButtonProps) {
  const { activeRate } = useExchangeRateStore();

  const handleWhatsAppClick = () => {
    // Crear mensaje para WhatsApp
    let priceDisplay = `REF ${product.price.toLocaleString("en-US")}`;
    
    if (activeRate) {
      const { usdPrice, vesPrice } = calculateDualPrices(product.price, activeRate);
      priceDisplay = formatDualPrice(usdPrice, vesPrice);
    }
    
    const message = [
      "🛍️ *CONSULTA DE PRODUCTO*",
      "",
      `📦 *${product.name}*`,
      `💰 Precio: ${priceDisplay}`,
      "",
      "¡Hola! Me interesa este producto. ¿Podrías darme más información?",
      "",
      `🔗 Ver producto: ${typeof window !== 'undefined' ? window.location.href : ''}`
    ].join("\n");

    // Número de WhatsApp desde variables de entorno
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    
    if (!phoneNumber) {
      console.error('Número de WhatsApp no configurado en NEXT_PUBLIC_WHATSAPP_NUMBER');
      alert('Error: Número de WhatsApp no configurado. Por favor contacta al administrador.');
      return;
    }
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
      <div className="relative group">
        {/* Tooltip que aparece en hover */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Consultar por WhatsApp
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
        
        <Button
          onClick={handleWhatsAppClick}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
          aria-label="Contactar por WhatsApp"
        >
          <FontAwesomeIcon 
            icon={faWhatsapp} 
            className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" 
          />
        </Button>
      </div>
    </div>
  );
}
