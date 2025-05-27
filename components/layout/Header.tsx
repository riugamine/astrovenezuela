'use client';
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faBars,
  faSun,
  faMoon,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Switch } from "@/components/ui/switch";
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getBrandLogo } from "@/lib/utils";
import Image from 'next/image';
import { getCategories } from '@/lib/data/categories';

// Interface for navigation items
interface NavigationItem {
  title: string;
  href: string;
  description: string;
  parent_id?: string | null;
  icon?: any;
}

// Component for desktop navigation item
const NavigationItemCard = ({ item }: { item: NavigationItem }) => (
  <NavigationMenuLink asChild>
    <Link 
      href={item.href} 
      className="block p-4 hover:bg-secondary/10 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        {item.icon && <FontAwesomeIcon icon={item.icon} className="h-4 w-4 text-primary" />}
        <h3 className="font-exo text-lg text-primary font-bold">{item.title}</h3>
      </div>
      <p className="font-gabarito text-sm text-muted-foreground pl-6">
        {item.description}
      </p>
    </Link>
  </NavigationMenuLink>
);

// Component for mobile navigation item
const MobileNavigationItem = ({ item, children }: { item: NavigationItem; children?: React.ReactNode }) => (
  <AccordionItem value={item.title} className="border-none">
    <AccordionTrigger className="hover:bg-secondary/10 px-4 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        {item.icon && <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />}
        <span>{item.title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="pl-8">
      {children || (
        <Link href={item.href} className="block py-2 hover:text-primary transition-colors">
          {item.description}
        </Link>
      )}
    </AccordionContent>
  </AccordionItem>
);

// Component for desktop navigation item when no subcategories exist
const NavigationLink = ({ item }: { item: NavigationItem }) => (
  <Link 
    href={item.href} 
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-secondary/10 rounded-md transition-colors"
  >
    {item.icon && <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />}
    <span>{item.title}</span>
  </Link>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, signOut } = useAuthStore();

  // Use React Query for categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Organize categories into a hierarchy
  const mainCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(cat => cat.parent_id === parentId);
  const hasSubcategories = (categoryId: string) => 
    categories.some(cat => cat.parent_id === categoryId);

  // Handle theme-dependent logo
  const logoSrc = theme === 'dark' ? getBrandLogo('blanco') : getBrandLogo('azul-marino');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menú</SheetTitle>
                  <SheetDescription>
                    Navega por nuestra colección de productos
                  </SheetDescription>
                </SheetHeader>
                
                <ScrollArea className="h-[calc(100vh-180px)]">
                  <Accordion type="single" collapsible className="p-4">
                    {/* Home */}
                    <AccordionItem value="home" className="border-none">
                      <Link href="/" className="flex items-center gap-2 py-2 hover:text-primary transition-colors">
                        <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
                        <span>Inicio</span>
                      </Link>
                    </AccordionItem>

                    {/* Categories */}
                    {mainCategories.map(category => (
                      hasSubcategories(category.id) ? (
                        <MobileNavigationItem
                          key={category.id}
                          item={{
                            title: category.name,
                            href: `/products`,
                            description: category.description,
                          }}
                        >
                          <div className="space-y-2">
                            {getSubcategories(category.id).map(subcat => (
                              <Link
                                key={subcat.id}
                                href={`/products`}
                                className="block py-2 hover:text-primary transition-colors"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </MobileNavigationItem>
                      ) : (
                        <AccordionItem key={category.id} value={category.id} className="border-none">
                          <Link 
                            href={`/products`}
                            className="flex items-center gap-2 py-2 hover:text-primary transition-colors"
                          >
                            <span>{category.name}</span>
                          </Link>
                        </AccordionItem>
                      )
                    ))}
                  </Accordion>
                </ScrollArea>

                <SheetFooter className="border-t p-4 mt-auto">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      />
                      <span>Modo {theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
                    </div>
                    {user && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {user.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center justify-center">
              <Image 
                src={logoSrc}
                alt="Astro" 
                width={120}
                height={40}
                className="object-contain"
                priority
                sizes="(100vw - 32px) 400px, 120px"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {mainCategories.map(category => (
                  hasSubcategories(category.id) ? (
                    <NavigationMenuItem key={category.id}>
                      <NavigationMenuTrigger className="gap-2">
                        {category.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-6 w-[400px]">
                          <NavigationItemCard
                            item={{
                              title: category.name,
                              href: `/products`,
                              description: category.description,
                              
                            }}
                          />
                          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                            {getSubcategories(category.id).map(subcat => (
                              <Link
                                key={subcat.id}
                                href={`/products`}
                                className="p-3 hover:bg-secondary/10 rounded-lg transition-colors"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={category.id}>
                      <NavigationLink
                        item={{
                          title: category.name,
                          href: `/products`,
                          description: category.description,
                          
                        }}
                      />
                    </NavigationMenuItem>
                  )
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <FontAwesomeIcon
                icon={theme === 'dark' ? faSun : faMoon}
                className="h-5 w-5"
              />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-white">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
