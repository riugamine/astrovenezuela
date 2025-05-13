import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para autenticación general
 * Verifica sesiones y maneja redirecciones para rutas protegidas
 */
export async function authMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Crear cliente de Supabase
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/admin', '/profile', '/orders'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Rutas de autenticación cuando ya está logueado
  const authRoutes = ['/auth'];
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
}