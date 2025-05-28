import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// Function to handle authentication redirects
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');

  const supabase = createClient();

  // Handle Google OAuth callback
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error in OAuth callback:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }

      if (data.session) {
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }
    } catch (error) {
      console.error('Error processing OAuth:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }
  }

  // Handle email verification
  if (token && type === 'signup') {
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      
      if (error) {
        console.error('Error in verification:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }

      if (session) {
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }
    } catch (error) {
      console.error('Error processing verification:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }
  }

  // If no valid parameters found, redirect to auth page
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}