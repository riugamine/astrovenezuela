import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Función para manejar la redirección después de la autenticación
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        // Si hay un error, redirigimos a la página de error
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }

      if (session) {
        // Si la sesión se creó exitosamente, redirigimos al inicio
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }
    } catch (error) {
      console.error('Error al procesar la autenticación:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }
  }

  // Si no hay código o algo falló, redirigimos a la página de autenticación
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}