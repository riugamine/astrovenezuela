
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Este middleware se ejecuta en cada navegación
export async function middleware(request: NextRequest) {
  try {
    // Crear cliente de Supabase
    const supabase = createClient();
    
    // Obtener información del usuario
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error de autenticación:', error.message);
      return NextResponse.next();
    }
    
    // Verificar rutas de administrador
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Si no hay usuario, redirigir a login
      if (!user) {
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent('Por favor inicia sesión para acceder al área de administración')}`, request.url)
        );
      }
      
      // Verificar rol de administrador
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        console.error('Rol de usuario no encontrado:', user.id);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent('Rol de usuario no encontrado')}`, request.url)
        );
      }
      
      if (userRole !== 'admin') {
        console.warn('Intento de acceso no autorizado:', user.id);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent('Acceso no autorizado')}`, request.url)
        );
      }
    }
    
    // Verificar rutas protegidas (perfil, órdenes)
    const protectedRoutes = ['/profile', '/orders'];
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    // Rutas de autenticación cuando ya está logueado
    const authRoutes = ['/auth'];
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route) && 
      !request.nextUrl.pathname.startsWith('/auth/callback')
    );
    
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Verificar parámetro de éxito de autenticación
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      const authSuccess = request.nextUrl.searchParams.get('auth_success');
      
      if (authSuccess === 'true') {
        // Redirigimos a la página principal sin el parámetro
        const url = request.nextUrl.clone();
        url.searchParams.delete('auth_success');
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error('Error en middleware:', error);
  }
  
  return NextResponse.next();
}

// Configuramos el middleware para que se ejecute solo en rutas específicas
export const config = {
  matcher: [
    '/auth/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
};
