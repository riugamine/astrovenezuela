import { NextResponse } from 'next/server';
import { handleOAuthCallback } from '@/lib/services/oauth';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    // Handle OAuth callback with our secure service
    const result = await handleOAuthCallback({
      code: code || '',
      state: state || '',
      error: error || undefined,
      error_description: error_description || undefined,
    });

    if (result.success) {
      // Determine redirect URL
      const redirectUrl = `${origin}${result.redirectTo}`;
      const finalUrl = new URL(redirectUrl);
      
      // Add success parameter for client-side handling
      finalUrl.searchParams.set('auth_success', 'true');
      
      return NextResponse.redirect(finalUrl.toString());
    }

    // If we get here, something went wrong
    return NextResponse.redirect(`${origin}/auth/error?message=unknown_error`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const { origin } = new URL(request.url);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
}