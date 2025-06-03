import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  console.log('🔄 Processing OAuth callback...', { 
    hasCode: !!code, 
    error,
    error_description 
  });

  // Handle OAuth errors from provider
  if (error) {
    console.error('❌ OAuth provider error:', error, error_description);
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error_description || error)}`);
  }

  // Handle the code exchange if we have a code
  if (code) {
    const supabase = await createServerSupabaseClient();
    
    console.log('🔄 Exchanging code for session...');
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError) {
      console.log('✅ OAuth exchange successful, redirecting to home...');
      
      // Successful authentication - redirect to home with success parameter
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        // Development environment
        return NextResponse.redirect(`${origin}/?auth_success=true`);
      } else if (forwardedHost) {
        // Production with load balancer
        return NextResponse.redirect(`https://${forwardedHost}/?auth_success=true`);
      } else {
        // Production without load balancer
        return NextResponse.redirect(`${origin}/?auth_success=true`);
      }
    } else {
      console.error('❌ Session exchange failed:', exchangeError);
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Failed to exchange code for session')}`);
    }
  }

  // No code and no error - this shouldn't happen
  console.error('❌ No code or error in callback');
  return NextResponse.redirect(`${origin}/auth/error?message=invalid_callback`);
}