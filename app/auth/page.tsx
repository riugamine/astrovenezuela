'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getBrandLogo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#32217A] to-[#7F98C9] p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Home Link - Positioned absolutely */}
        <Link href="/" className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary transition-colors rounded-full p-2 hover:bg-primary/10"
          >
            <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
            
          </Button>
        </Link>

        <div className="flex flex-col items-center space-y-4 mb-8 mt-8">
          <Image
            src={getBrandLogo("azul-marino")}
            alt="Astro"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
          <h1 className="text-2xl font-bold text-[#001730]">Bienvenido a Astro</h1>
          <p className="text-sm text-gray-500 text-center">
            Únete a nuestra comunidad y descubre nuestra colección exclusiva
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}