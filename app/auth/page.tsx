'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#32217A] to-[#7F98C9] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <img src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/sign/brand-assets/brand-logo/Logotipo_Azul%20marino.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzA5NTExMDNjLTY3ZjgtNDYwNS1hZDc3LTE5YmEwYTM0NjdiMiJ9.eyJ1cmwiOiJicmFuZC1hc3NldHMvYnJhbmQtbG9nby9Mb2dvdGlwb19BenVsIG1hcmluby5wbmciLCJpYXQiOjE3NDYyMDcwNTQsImV4cCI6MjA2MTU2NzA1NH0.zF69fSmdSDjEhfy_0Whcs1fOMVbU2APgAV8khFzx7Pc" alt="Astro" className="h-12" />
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