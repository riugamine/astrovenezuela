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
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Enhanced validation schema with Spanish messages
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Enhanced error message mapping for better user experience
 * Maps Supabase error codes to user-friendly Spanish messages
 */
const getAuthErrorMessage = (error: any): string => {
  const errorMap: { [key: string]: string } = {
    'Invalid login credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'Email not confirmed': 'Por favor, confirma tu correo electrónico antes de iniciar sesión.',
    'Invalid email or password': 'Correo electrónico o contraseña incorrectos.',
    'Too many requests': 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.',
    'Email rate limit exceeded': 'Has excedido el límite de intentos. Intenta más tarde.',
    'Network request failed': 'Error de conexión. Verifica tu conexión a internet.',
    'signup_disabled': 'El registro está temporalmente deshabilitado.',
    'email_address_invalid': 'El formato del correo electrónico no es válido.',
    'weak_password': 'La contraseña es muy débil. Usa al menos 8 caracteres.',
  };

  const errorMessage = error?.message || '';
  return errorMap[errorMessage] || `Error: ${errorMessage}` || 'Ha ocurrido un error. Intenta nuevamente.';
};

export function LoginForm() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithPassword, signInWithGoogle } = useAuthStore();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  /**
   * Handles email/password login with enhanced error handling
   */
  const onSubmit = async (data: LoginFormData) => {
    if (isLoginLoading || isSubmitting) return;
    
    try {
      setIsLoginLoading(true);
      
      const result = await signInWithPassword(data.email, data.password);

      if (result.error) {
        toast.error(getAuthErrorMessage(result.error));
        return;
      }

      if (!result.user || !result.session) {
        toast.error('No se pudo iniciar sesión. Intenta nuevamente.');
        return;
      }

      // Success notification
      toast.success('¡Bienvenido de vuelta!', {
        description: `Sesión iniciada como ${result.user.email}`,
      });
      
      // Redirect based on URL parameters or default to home
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo') || '/';
      
      router.push(redirectTo);
      router.refresh();
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoginLoading(false);
    }
  };

  /**
   * Handles Google OAuth login with the new secure system
   */
  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    
    try {
      setIsGoogleLoading(true);
      
      // Get redirect URL from current page
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      await signInWithGoogle();
      
      // The OAuth flow will handle the redirect
      toast.loading('Redirigiendo a Google...', {
        description: 'Serás redirigido para completar la autenticación',
      });
      
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast.error('No se pudo conectar con Google. Intenta más tarde.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isFormDisabled = isLoginLoading || isGoogleLoading || isSubmitting;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="Correo electrónico"
            className="w-full text-[#001730] bg-white"
            disabled={isFormDisabled}
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            placeholder="Contraseña"
            className="w-full text-[#001730]"
            disabled={isFormDisabled}
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-[#001730] hover:bg-[#32217A] relative transition-colors"
          disabled={isFormDisabled}
          aria-label="Iniciar sesión con correo y contraseña"
        >
          {isLoginLoading ? (
            <>
              <span className="opacity-0">Iniciar Sesión</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500 font-medium">
            O continuar con
          </span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full relative border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={handleGoogleLogin}
        disabled={isFormDisabled}
        aria-label="Iniciar sesión con Google"
      >
        {isGoogleLoading ? (
          <>
            <span className="opacity-0">Google</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#001730] border-t-transparent"></div>
            </div>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-gray-700">Continuar con Google</span>
          </>
        )}
      </Button>
      
      {/* Security notice */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
        Tu sesión está protegida con cifrado de extremo a extremo.
      </p>
    </div>
  );
}