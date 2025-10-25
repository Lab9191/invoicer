import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  email: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Signup failed');
  }

  return result.data;
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for cookies
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result.data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user as AuthUser;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user as AuthUser | null);
  });
}

/**
 * Refresh the current session to extend expiry
 * Call this on user activity to keep session alive
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }

  return data.session;
}

/**
 * Setup auto-refresh on user activity
 * Refreshes session on any interaction (click, keypress, navigation)
 * @param inactivityTimeout - Time in ms before requiring re-login (default: 10 minutes)
 */
export function setupAutoRefresh(inactivityTimeout: number = 10 * 60 * 1000) {
  let lastActivity = Date.now();
  let refreshTimer: NodeJS.Timeout | null = null;

  const resetTimer = async () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;

    // If more than timeout passed, don't refresh - require re-login
    if (timeSinceLastActivity > inactivityTimeout) {
      await signOut();
      window.location.href = '/auth/login';
      return;
    }

    lastActivity = now;

    // Refresh session
    await refreshSession();

    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Set new timer for auto-logout after inactivity
    refreshTimer = setTimeout(async () => {
      await signOut();
      window.location.href = '/auth/login';
    }, inactivityTimeout);
  };

  // Listen to user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  // Also refresh on page navigation
  window.addEventListener('popstate', resetTimer);

  // Initial timer setup
  resetTimer();

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
    window.removeEventListener('popstate', resetTimer);
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
  };
}
