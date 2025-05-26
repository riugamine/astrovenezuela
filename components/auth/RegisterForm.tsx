'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth';

// Schema de validación mejorado
const registerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('El formato del correo electrónico no es válido')
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
    .min(1, 'La confirmación de contraseña es requerida')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;


export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      const response = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (!response.success || !response.user) {
        toast.error('No se pudo crear el usuario. Por favor, intenta nuevamente');
        return;
      }

      // Limpiar el formulario después del éxito
      reset();
      
      // Mostrar mensaje de éxito y redirigir
      toast.success('Registro exitoso. Por favor, verifica tu correo para activar tu cuenta.');
      router.push('/auth/verify-email');
      
    } catch (error: any) {
      console.error('Error inesperado:', error);
      toast.error('Ha ocurrido un error inesperado. Por favor, intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('name')}
          placeholder="Nombre completo"
          className="w-full text-[#001730]"
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Correo electrónico"
          className="w-full text-[#001730]"
          disabled={loading}
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
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('confirmPassword')}
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full text-[#001730]"
          disabled={loading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full bg-[#001730] hover:bg-[#32217A] relative"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="opacity-0">Registrarse</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          </>
        ) : (
          'Registrarse'
        )}
      </Button>
    </form>
  );
}