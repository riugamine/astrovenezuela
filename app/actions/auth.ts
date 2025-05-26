'use server'

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';


// Schema de validación para el registro
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  email: z.string()
    .email('El formato del correo electrónico no es válido')
    .toLowerCase(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
});

type RegisterData = z.infer<typeof registerSchema>;
type RegisterResponse = {
  error?: string;
  success?: boolean;
  user?: any;
};

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  try {
    const supabase = await createClient();

    // Intentar registrar directamente
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          full_name: data.name,
          role: 'customer'
        }
      }
    });

    // Manejar el error de usuario existente
    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        return { 
          error: 'Este correo electrónico ya está registrado',
          success: false 
        };
      }
      return { 
        error: signUpError.message,
        success: false 
      };
    }

    // Verificar si el registro fue exitoso
    if (!authData.user) {
      return {
        error: 'No se pudo crear el usuario',
        success: false
      };
    }

    return { 
      success: true,
      user: authData.user 
    };

  } catch (err) {
    console.error('Authentication error:', err);
    throw err;
    return { 
      error: 'Ha ocurrido un error inesperado',
      success: false 
    };
  }
}