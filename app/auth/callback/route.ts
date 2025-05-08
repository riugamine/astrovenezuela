import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// Función para manejar la redirección después de la autenticación
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');

  if (token && type === 'signup') {
    const supabase = createClient();
    
    try {
      // Intercambiar el token por una sesión
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      
      if (error) {
        console.error('Error en la verificación:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }

      if (session) {
        // Si la sesión se creó exitosamente, redirigimos al inicio
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }

      // Si no hay sesión pero tampoco hay error, redirigimos a auth
      return NextResponse.redirect(`${requestUrl.origin}/auth`);
    } catch (error) {
      console.error('Error al procesar la autenticación:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }
  }

  // Si no hay token o tipo, redirigimos a la página de autenticación
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}