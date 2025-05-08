import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database.types'
import { CookieOptions } from '@supabase/ssr'

/**
 * Creates a Supabase client for server-side operations
 * Handles cookies and authentication automatically
 * @returns Promise<SupabaseClient> - Configured Supabase client
 */
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true
            })
          } catch {
            // Silent error handling for header-sent scenarios
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', {
              ...options,
              maxAge: 0,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })
          } catch {
            // Silent error handling for header-sent scenarios
          }
        }
      }
    }
  )
}