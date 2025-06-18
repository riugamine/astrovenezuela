'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import crypto from 'crypto';

// OAuth state validation schema
const OAuthStateSchema = z.object({
  timestamp: z.number(),
  nonce: z.string(),
  provider: z.enum(['google', 'github', 'discord']),
  redirectTo: z.string().optional(),
});

type OAuthState = z.infer<typeof OAuthStateSchema>;

// Types for OAuth operations
export interface OAuthInitiateParams {
  provider: 'google' | 'github' | 'discord';
  redirectTo?: string;
}

export interface OAuthCallbackParams {
  code: string;
  state: string;
  error?: string;
  error_description?: string;
}

export interface AuthSession {
  user: any;
  session: any;
  isValid: boolean;
  expiresAt?: string;
}

/**
 * Generates a secure state parameter for OAuth flow
 * This prevents CSRF attacks by ensuring the callback matches the initiation
 */
function generateOAuthState(provider: string, redirectTo?: string): string {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  
  const state = {
    timestamp,
    nonce,
    provider,
    redirectTo: redirectTo || '/',
  };
  
  // Encode and sign the state to prevent tampering
  const stateString = Buffer.from(JSON.stringify(state)).toString('base64');
  const signature = crypto
    .createHmac('sha256', process.env.OAUTH_STATE_SECRET || 'fallback-secret')
    .update(stateString)
    .digest('hex');
  
  return `${stateString}.${signature}`;
}

/**
 * Validates and decodes OAuth state parameter
 * Ensures the callback is legitimate and matches the original request
 */
function validateOAuthState(state: string): OAuthState | null {
  try {
    const [stateString, signature] = state.split('.');
    
    if (!stateString || !signature) {
      throw new Error('Invalid state format');
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.OAUTH_STATE_SECRET || 'fallback-secret')
      .update(stateString)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid state signature');
    }
    
    // Decode and validate state
    const decodedState = JSON.parse(Buffer.from(stateString, 'base64').toString());
    const validatedState = OAuthStateSchema.parse(decodedState);
    
    // Check if state is not too old (5 minutes max)
    const maxAge = 5 * 60 * 1000; // 5 minutes
    if (Date.now() - validatedState.timestamp > maxAge) {
      throw new Error('State expired');
    }
    
    return validatedState;
  } catch (error) {
    console.error('Error validating OAuth state:', error);
    return null;
  }
}

/**
 * Initiates OAuth flow with secure state management
 * This is the entry point for OAuth authentication
 */
export async function initiateOAuth({ provider, redirectTo }: OAuthInitiateParams) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Generate secure state parameter
    const state = generateOAuthState(provider, redirectTo);
    
    // Store state in secure HTTP-only cookie for validation
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    });
    
    // Configure OAuth options based on provider
    const oauthOptions = {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes: provider === 'google' ? 'email profile' : undefined,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined,
    };
    
    // Initiate OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        ...oauthOptions,
        queryParams: {
          ...oauthOptions.queryParams,
          state, // Include our secure state
        },
      },
    });
    
    if (error) {
      throw new Error(`Failed to initiate ${provider} authentication`);
    }
    
    // Redirect to OAuth provider
    if (data.url) {
      redirect(data.url);
    }
    
    throw new Error('No OAuth URL received');
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    throw error;
  }
}

/**
 * Handles OAuth callback with comprehensive security validation
 * This processes the return from the OAuth provider
 */
export async function handleOAuthCallback({ code, state, error, error_description }: OAuthCallbackParams) {
  try {
    // Handle OAuth errors first
    if (error) {
      throw new Error(`OAuth authentication failed: ${error_description || error}`);
    }
    
    if (!code || !state) {
      throw new Error('Missing required OAuth parameters');
    }
    
    // Validate state parameter
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!storedState || storedState !== state) {
      throw new Error('Invalid or mismatched OAuth state');
    }
    
    // Clear the state cookie
    cookieStore.delete('oauth_state');
    
    // Validate and decode state
    const validatedState = validateOAuthState(state);
    if (!validatedState) {
      throw new Error('Failed to validate OAuth state');
    }
    
    // Exchange code for session using Supabase
    const supabase = await createServerSupabaseClient();
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      throw new Error('Failed to create authenticated session');
    }
    
    if (!data.user || !data.session) {
      throw new Error('No user or session returned from OAuth');
    }
    
    // Set additional security headers and session data
    await setSecureSession(data.session, data.user);
    
    // Return success with redirect information
    return {
      success: true,
      user: data.user,
      session: data.session,
      redirectTo: validatedState.redirectTo || '/',
    };
    
  } catch (error) {
    throw error;
  }
}

/**
 * Sets secure session with additional security measures
 * This ensures the session is properly secured and validated
 */
async function setSecureSession(session: any, user: any) {
  const cookieStore = await cookies();
  
  // Set additional security cookies
  cookieStore.set('auth_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: session.expires_in || 3600,
    path: '/',
  });
  
  cookieStore.set('auth_session_hash', 
    crypto.createHash('sha256').update(session.access_token).digest('hex').substring(0, 16),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: session.expires_in || 3600,
      path: '/',
    }
  );
}

/**
 * Server action for initiating Google OAuth (Simplified)
 * Following official Supabase documentation pattern
 */
export async function initiateGoogleOAuth() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Use Supabase's built-in PKCE flow - much simpler and more secure
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Error initiating OAuth:', error);
      return { success: false, error: error.message };
    }
    
    if (data.url) {
      return { success: true, url: data.url };
    }
    
    console.error('No OAuth URL received');
    return { success: false, error: 'No OAuth URL received' };
    
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    return { success: false, error: 'Failed to initiate OAuth', details: error };
  }
}

/**
 * Validates current session from server-side (Simplified)
 * Let Supabase handle most of the complexity
 */
export async function validateSession(): Promise<AuthSession> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (userError || sessionError || !user || !session) {
      return { user: null, session: null, isValid: false };
    }
    
    
    return {
      user,
      session,
      isValid: true,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
    };
    
  } catch (error) {
    console.error('Error validating session:', error);
    return { user: null, session: null, isValid: false };
  }
}

/**
 * Clears session (Simplified)
 */
export async function clearSession() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error clearing session:', error);
  }
} 