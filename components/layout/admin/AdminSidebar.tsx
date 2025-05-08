'use client';

import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBox, 
  faUsers, 
  faChartLine,
  faCog,
  faBars,
  faShoppingCart 
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { faListUl } from '@fortawesome/free-solid-svg-icons';

const AdminSidebar: FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { href: '/admin', icon: faHome, label: 'Dashboard' },
    { href: '/admin/products', icon: faBox, label: 'Productos' },
    { href: '/admin/categories', icon: faListUl, label: 'Categorías' },
    { href: '/admin/orders', icon: faShoppingCart, label: 'Órdenes' },
    { href: '/admin/users', icon: faUsers, label: 'Usuarios' },
    { href: '/admin/analytics', icon: faChartLine, label: 'Análisis' },
    { href: '/admin/settings', icon: faCog, label: 'Configuración' },
  ];

  return (
    <aside className={cn(
      "bg-primary text-primary-foreground min-h-screen p-4 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <img src="/logo.png" alt="Astro Admin" className="h-8" />
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-primary-foreground/10"
        >
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-primary-foreground/10",
                pathname === item.href && "bg-primary-foreground/20",
                isCollapsed && "justify-center"
              )}
            >
              <FontAwesomeIcon icon={item.icon} className={cn(
                "h-5 w-5",
                isCollapsed && "mr-0"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;