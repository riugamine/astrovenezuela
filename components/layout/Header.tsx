import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

const Header = () => {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/sign/brand-assets/brand-logo/Logotipo_Azul%20marino.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzA5NTExMDNjLTY3ZjgtNDYwNS1hZDc3LTE5YmEwYTM0NjdiMiJ9.eyJ1cmwiOiJicmFuZC1hc3NldHMvYnJhbmQtbG9nby9Mb2dvdGlwb19BenVsIG1hcmluby5wbmciLCJpYXQiOjE3NDYyMDcwNTQsImV4cCI6MjA2MTU2NzA1NH0.zF69fSmdSDjEhfy_0Whcs1fOMVbU2APgAV8khFzx7Pc" alt="Astro" className="h-8" />
        </Link>

        {/* Menú de navegación principal - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Productos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/shop/categories/ropa">
                <DropdownMenuItem>Ropa</DropdownMenuItem>
              </Link>
              <Link href="/shop/categories/calzado">
                <DropdownMenuItem>Calzado</DropdownMenuItem>
              </Link>
              <Link href="/shop/categories/accesorios">
                <DropdownMenuItem>Accesorios</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/about">
            <Button variant="ghost">Acerca de</Button>
          </Link>
        </div>

        {/* Iconos de usuario */}
        <div className="flex items-center space-x-4">
          <Link href="/shop/cart">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;