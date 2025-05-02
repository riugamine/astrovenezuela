import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="Astro" className="h-8" />
        </div>

        {/* Menú de navegación principal - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Productos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Ropa</DropdownMenuItem>
              <DropdownMenuItem>Calzado</DropdownMenuItem>
              <DropdownMenuItem>Accesorios</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost">Acerca de</Button>
        </div>

        {/* Iconos de usuario */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;