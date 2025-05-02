import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBox, 
  faUsers, 
  faChartLine,
  faCog 
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

/**
 * Barra lateral de navegación del panel administrativo
 * Contiene los enlaces principales de navegación
 */
const AdminSidebar: FC = () => {
  return (
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen p-4">
      <div className="mb-8">
        <img src="/logo.png" alt="Astro Admin" className="h-8" />
      </div>
      
      <nav className="space-y-2">
        <Link 
          href="/admin" 
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faHome} className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link 
          href="/admin/products" 
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faBox} className="h-5 w-5" />
          <span>Productos</span>
        </Link>
        <Link 
          href="/admin/users" 
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          <span>Usuarios</span>
        </Link>
        <Link 
          href="/admin/analytics" 
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
          <span>Análisis</span>
        </Link>
        <Link 
          href="/admin/settings" 
          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faCog} className="h-5 w-5" />
          <span>Configuración</span>
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;