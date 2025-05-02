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
          <img src="/logo.png" alt="Astro" className="h-8" />
        </Link>

        {/* Menú de navegación principal - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Productos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/productos/ropa">
                <DropdownMenuItem>Ropa</DropdownMenuItem>
              </Link>
              <Link href="/productos/calzado">
                <DropdownMenuItem>Calzado</DropdownMenuItem>
              </Link>
              <Link href="/productos/accesorios">
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
          <Link href="/carrito">
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