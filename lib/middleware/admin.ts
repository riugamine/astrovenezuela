import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para rutas administrativas
 * Verifica permisos de administrador y maneja redirecciones
 */
export async function adminMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  // Verificar si la ruta es administrativa
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Verificar rol de administrador en los metadatos del usuario
    const userRole = user.user_metadata?.role;
    
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return res;
}