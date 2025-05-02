import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";

/**
 * Componente de cabecera para el panel administrativo
 * Muestra el título y los iconos de notificaciones y usuario
 */
const AdminHeader: FC = () => {
  return (
    <header className="border-b bg-white">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel Administrativo</h1>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;