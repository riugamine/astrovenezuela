'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { setUser, setSession } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      
      const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        }
      });

      if (signUpError) throw signUpError;

      setUser(user);
      setSession(session);
      router.push('/auth/verify-email');
    } catch (error) {
      toast.error('Error al registrar usuario');
      console.error(error);
      router.push('/auth/error');
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
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full bg-[#001730] hover:bg-[#32217A]"
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </Button>
    </form>
  );
}