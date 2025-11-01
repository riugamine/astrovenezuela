'use client'

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";

/**
 * Generic WhatsApp floating button for the shop
 * Displays in the bottom-right corner across all shop pages
 */
export function WhatsAppFloatingButtonGeneric() {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWhatsAppClick = () => {
    try {
      // Create a general inquiry message
      const message = [
        "👋 *HOLA*",
        "",
        "¡Hola! Estoy interesado en sus productos.",
        "¿Podrían brindarme más información?",
        "",
        `🔗 Sitio web: ${window.location.href}`
      ].join("\n");

      // WhatsApp number from environment variables
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      
      if (!phoneNumber) {
        console.error('Número de WhatsApp no configurado en NEXT_PUBLIC_WHATSAPP_NUMBER');
        // Don't show alert in production, just log
        if (process.env.NODE_ENV === 'development') {
          alert('Error: Número de WhatsApp no configurado. Por favor contacta al administrador.');
        }
        return;
      }
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Silently fail in production
    }
  };

  // Don't render on server to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6"
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      <div className="relative group">
        {/* Tooltip that appears on hover */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Contactar por WhatsApp
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
        
        <Button
          onClick={handleWhatsAppClick}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex items-center justify-center border-2 border-green-400 hover:border-green-300"
          style={{
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
          aria-label="Contactar por WhatsApp"
        >
          <FontAwesomeIcon 
            icon={faWhatsapp} 
            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" 
          />
        </Button>
      </div>
    </div>
  );
}

