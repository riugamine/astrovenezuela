import { authMiddleware } from './lib/middleware/auth';
import { adminMiddleware } from './lib/middleware/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Primero verificamos la autenticación general
  const authResponse = await authMiddleware(request);
  if (authResponse.status !== 200) return authResponse;

  // Luego verificamos permisos administrativos
  const adminResponse = await adminMiddleware(request);
  if (adminResponse.status !== 200) return adminResponse;

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/auth/:path*'
  ]
}