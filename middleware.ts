import { authMiddleware } from './lib/middleware/auth';
import { adminMiddleware } from './lib/middleware/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Este middleware se ejecuta en cada navegación
export async function middleware(request: NextRequest) {
  try {
    // Solo ejecutamos la lógica de autenticación en rutas específicas
    // que requieren autenticación o en la ruta de callback
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/callback');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || 
                            request.nextUrl.pathname.startsWith('/profile');
    
    if (isAuthRoute || isProtectedRoute) {
      // Verificamos si hay un parámetro de éxito de autenticación
      const authSuccess = request.nextUrl.searchParams.get('auth_success');
      
      if (authSuccess === 'true') {
        // Redirigimos a la página principal sin el parámetro
        const url = request.nextUrl.clone();
        url.searchParams.delete('auth_success');
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
  }
  
  return NextResponse.next();
}

// Configuramos el middleware para que se ejecute solo en rutas específicas
export const config = {
  matcher: [
    '/auth/callback/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
