'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Mensajes de error personalizados en español
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Función para manejar errores de autenticación
const getAuthErrorMessage = (error: any): string => {
  const errorMap: { [key: string]: string } = {
    'Invalid login credentials': 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.',
    'Email not confirmed': 'Por favor, confirma tu correo electrónico antes de iniciar sesión.',
    'Invalid email or password': 'Correo electrónico o contraseña incorrectos.',
    'Too many requests': 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.',
    'Email rate limit exceeded': 'Has excedido el límite de intentos. Intenta más tarde.',
    'Network request failed': 'Error de conexión. Verifica tu conexión a internet.',
  };

  return errorMap[error.message] || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
};

export function LoginForm() {
  // Separar los estados de carga para cada botón
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithPassword, signInWithGoogle } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoginLoading(true);
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }

      if (!user || !session) {
        toast.error('No se pudo iniciar sesión. Por favor, intenta nuevamente.');
        return;
      }

      setUser(user);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/'); 
      router.refresh();
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error));
      console.error('Error de inicio de sesión:', error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
  
    } catch (error: any) {
      toast.error('No se pudo conectar con Google. Por favor, intenta más tarde.');
      console.error('Error de Google OAuth:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('email')}
            type="email"
            placeholder="Correo electrónico"
            className="w-full text-[#001730]"
            disabled={isLoginLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Input
            {...register('password')}
            type="password"
            placeholder="Contraseña"
            className="w-full text-[#001730]"
            disabled={isLoginLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-[#001730] hover:bg-[#32217A] relative"
          disabled={isLoginLoading}
        >
          {isLoginLoading ? (
            <>
              <span className="opacity-0">Iniciar Sesión</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O continuar con</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full relative"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <>
            <span className="opacity-0">Google</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#001730]"></div>
            </div>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
            Google
          </>
        )}
      </Button>
    </div>
  );
}