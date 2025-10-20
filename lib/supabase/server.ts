import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side operations with proper cookie handling
 * This ensures secure session management on the server side
 */
export const createServerSupabaseClient = async (
) => {
  // Use Next.js cookies API for server components
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors silently for server components
            console.warn('Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors silently for server components
            console.warn('Failed to remove cookie:', name, error);
          }
        },
      },
      auth: {
        flowType: 'pkce', // More secure than implicit flow
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );
};

/**
 * Creates a Supabase client for middleware with proper request/response handling
 * This ensures cookies are properly managed in the middleware layer
 */
export const createMiddlewareSupabaseClient = (
  request: NextRequest
) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );

  return { supabase, response };
};

/**
 * Creates a Supabase client for server-side operations
 * This is a convenience function that returns the client directly
 */
export const supabaseServer = async () => {
  return await createServerSupabaseClient();
}; 