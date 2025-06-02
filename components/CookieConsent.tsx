'use client'
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookie } from '@fortawesome/free-solid-svg-icons';

export function CookieConsent() {
  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    
    if (!hasAccepted) {
      toast(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon 
              icon={faCookie} 
              className="h-5 w-5 text-[#001730]" 
            />
            <span className="font-semibold text-[#001730]">
              Política de Cookies
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio web.
            Al continuar navegando, aceptas su uso.
          </p>
        </div>,
        {
          duration: Infinity,
          position: 'bottom-right',
          className: 'w-[400px] bg-white border-2 border-[#001730]',
          action: {
            label: 'Aceptar',
            onClick: () => {
              localStorage.setItem('cookieConsent', 'true');
            },
          },
        }
      );
    }
  }, []);

  return null;
}