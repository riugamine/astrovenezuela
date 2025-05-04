'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img 
            src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/sign/brand-assets/brand-logo/Logotipo_Azul%20marino.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzA5NTExMDNjLTY3ZjgtNDYwNS1hZDc3LTE5YmEwYTM0NjdiMiJ9.eyJ1cmwiOiJicmFuZC1hc3NldHMvYnJhbmQtbG9nby9Mb2dvdGlwb19BenVsIG1hcmluby5wbmciLCJpYXQiOjE3NDYyMDcwNTQsImV4cCI6MjA2MTU2NzA1NH0.zF69fSmdSDjEhfy_0Whcs1fOMVbU2APgAV8khFzx7Pc" 
            alt="Astro" 
            className="h-8" 
          />
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-exo">Productos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/categories/ropa-deportiva">
                <DropdownMenuItem className="font-gabarito">Ropa Deportiva</DropdownMenuItem>
              </Link>
              <Link href="/categories/accesorios">
                <DropdownMenuItem className="font-gabarito">Accesorios</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/about">
            <Button variant="ghost" className="font-exo">Acerca de</Button>
          </Link>
        </div>

        {/* Iconos y Menú Móvil */}
        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
            </Button>
          </Link>

          {/* Menú Móvil */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-exo text-left">Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                <Link 
                  href="/categories/ropa-deportiva" 
                  onClick={() => setIsOpen(false)}
                  className="font-gabarito text-lg py-2 hover:bg-slate-100 rounded-md px-4 transition-colors"
                >
                  Ropa Deportiva
                </Link>
                <Link 
                  href="/categories/accesorios"
                  onClick={() => setIsOpen(false)}
                  className="font-gabarito text-lg py-2 hover:bg-slate-100 rounded-md px-4 transition-colors"
                >
                  Accesorios
                </Link>
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