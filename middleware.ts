import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/supabase/server';

/**
 * Secure middleware that validates authentication server-side
 * This prevents client-side authentication bypass attacks
 */
export async function middleware(request: NextRequest) {
  try {
    // Create server-side Supabase client with proper cookie handling
    const { supabase, response } = createMiddlewareSupabaseClient(request);
    
    // Validate session server-side
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Authentication validation error:', error.message);
      // Continue without blocking for non-critical errors
    }
    
    const pathname = request.nextUrl.pathname;
    
    // Handle admin routes with strict validation
    if (pathname.startsWith('/admin')) {
      if (!user) {
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('error', 'Por favor inicia sesión para acceder al área de administración');
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Validate admin role from user metadata
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        console.error('No role found for user:', user.id);
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('error', 'Rol de usuario no encontrado');
        return NextResponse.redirect(redirectUrl);
      }
      
      if (userRole !== 'admin') {
        console.warn('Unauthorized admin access attempt:', {
          userId: user.id,
          email: user.email,
          role: userRole,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent')
        });
        
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('error', 'Acceso no autorizado');
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // Handle protected user routes
    const protectedRoutes = ['/profile', '/orders', '/account'];
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Redirect authenticated users away from auth pages
    const authRoutes = ['/auth'];
    const isAuthRoute = authRoutes.some(route => 
      pathname.startsWith(route) && 
      !pathname.startsWith('/auth/callback') &&
      !pathname.startsWith('/auth/error')
    );
    
    if (isAuthRoute && user) {
      // Check if there's a redirectTo parameter
      const redirectTo = request.nextUrl.searchParams.get('redirectTo');
      const targetUrl = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/';
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    
    // Handle OAuth callback success
    if (pathname === '/auth/callback') {
      const authSuccess = request.nextUrl.searchParams.get('auth_success');
      if (authSuccess === 'true' && user) {
        // Clean redirect without the auth_success parameter
        const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
        const cleanUrl = new URL(redirectTo, request.url);
        return NextResponse.redirect(cleanUrl);
      }
    }
    
    // Add security headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set CSP for enhanced security
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://maps.googleapis.com",
      "frame-src 'none'",
    ].join('; ');
    
    responseHeaders.set('Content-Security-Policy', csp);
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Return original response on error to avoid breaking the app
    return NextResponse.next();
  }
}

// Configure middleware to run on specific routes
export const config = {
  matcher: [
    '/auth/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/account/:path*',
  ],
};
