import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin middleware with enhanced error handling
 * Verifies admin permissions and handles various error scenarios
 */
export async function adminMiddleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = await createClient();
    
    // Get user data with error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent('Authentication failed')}`, request.url)
      );
    }

    // Check if it's an admin route
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute) {
      // Handle unauthenticated users
      if (!user) {
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent('Please login to access admin area')}`, request.url)
        );
      }

      // Verify admin role
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        console.error('User role not found:', user.id);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent('User role not found')}`, request.url)
        );
      }
      
      if (userRole !== 'admin') {
        console.warn('Unauthorized access attempt:', user.id);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent('Unauthorized access')}`, request.url)
        );
      }
    }

    return res;
  } catch (error) {
    // Log the error for monitoring
    console.error('Admin middleware error:', error);
    
    // Return a generic error response
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent('An unexpected error occurred')}`, request.url)
    );
  }
}