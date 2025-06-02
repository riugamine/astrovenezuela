import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Si hay un error en la respuesta de OAuth
  if (error) {
    console.error('Error de OAuth:', error, error_description);
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`);
  }

  // Validar que next sea una ruta relativa por seguridad
  if (!next.startsWith('/')) {
    return NextResponse.redirect(`${origin}/auth/error?message=invalid_redirect`);
  }

  // Con el flujo implícito, no necesitamos intercambiar código
  // La biblioteca de Supabase maneja automáticamente la sesión
  // Simplemente redirigimos al usuario a la página solicitada

  // Determinar la URL de redirección basada en el entorno
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectUrl;

  if (isLocalEnv) {
    redirectUrl = `${origin}${next}`;
  } else if (forwardedHost) {
    redirectUrl = `https://${forwardedHost}${next}`;
  } else {
    redirectUrl = `${origin}${next}`;
  }

  // Añadir parámetro para mostrar mensaje de éxito
  redirectUrl += redirectUrl.includes('?') ? '&' : '?';
  redirectUrl += 'auth_success=true';

  return NextResponse.redirect(redirectUrl);
}