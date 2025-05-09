'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faBars, faTimes, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from 'next/link';
import { useState } from 'react';
import { categories } from '@/lib/data/categories';
import { useTheme } from 'next-themes';
import { useCartStore } from '@/lib/store/useCartStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Interfaz para los elementos del menú de navegación
interface NavigationItem {
  title: string;
  href: string;
  description: string;
}

// Componente para renderizar un item del menú de navegación
const NavigationItemCard = ({ item }: { item: NavigationItem }) => (
  <NavigationMenuLink asChild>
    <Link href={item.href} className="group">
      <div className="p-4 hover:bg-secondary/10 rounded-lg transition-colors">
        <h3 className="font-exo text-lg mb-1 text-primary font-bold">{item.title}</h3>
        <p className="font-gabarito text-sm text-muted-foreground">
          {item.description}
        </p>
      </div>
    </Link>
  </NavigationMenuLink>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, signOut } = useAuthStore();

  // Transformar las categorías en items de navegación
  const navigationItems: NavigationItem[] = categories.map(category => ({
    title: category.name,
    href: `/categories/${category.slug}`,
    description: category.description || `Explora nuestra colección de ${category.name.toLowerCase()}`
  }));

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img 
            src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/sign/brand-assets/brand-logo/Logotipo_Blanco-03.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzA5NTExMDNjLTY3ZjgtNDYwNS1hZDc3LTE5YmEwYTM0NjdiMiJ9.eyJ1cmwiOiJicmFuZC1hc3NldHMvYnJhbmQtbG9nby9Mb2dvdGlwb19CbGFuY28tMDMucG5nIiwiaWF0IjoxNzQ2MzY5ODAzLCJleHAiOjE5MDQwNDk4MDN9.IuYZ0hot_g4vlIVOQASw_1O1PlZGT2I5HmI_QM4BNpE" 
            alt="Astro" 
            className="h-8" 
          />
        </Link>

        {/* Menú Desktop con NavigationMenu */}
        <div className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-exo text-white bg-transparent hover:bg-secondary/80">
                  Productos
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] bg-white rounded-lg shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {navigationItems.map((item, index) => (
                        <NavigationItemCard key={index} item={item} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-secondary/20">
                      <NavigationItemCard 
                        item={{
                          title: "Ver todo",
                          href: "/products",
                          description: "Explora toda nuestra colección de productos"
                        }}
                      />
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/about" 
                    className="font-exo px-4 py-2 hover:bg-secondary/80 rounded-md transition-colors text-white"
                  >
                    Acerca de
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Iconos y Menú Móvil */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-secondary/80"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <FontAwesomeIcon 
              icon={theme === 'dark' ? faSun : faMoon} 
              className="h-5 w-5 transition-transform hover:rotate-12"
            />
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="hover:bg-secondary/80 relative">
              <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.user_metadata.full_name || 'Usuario')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Menú Móvil */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-exo text-left">Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                {/* Theme Toggle en Menú Móvil */}
                <button
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    setIsOpen(false);
                  }}
                  className="flex items-center font-gabarito text-lg py-2 hover:bg-slate-100 rounded-md px-4 transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={theme === 'dark' ? faSun : faMoon} 
                    className="h-5 w-5 mr-3"
                  />
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
                
                {navigationItems.map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-gabarito text-lg py-2 hover:bg-slate-100 rounded-md px-4 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
                <Link 
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="font-gabarito text-lg py-2 hover:bg-slate-100 rounded-md px-4 transition-colors"
                >
                  Acerca de
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;