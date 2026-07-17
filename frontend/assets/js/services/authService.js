import { getSupabaseClient, initializeSupabase } from './supabaseClient.js';

export function getAuthService() {
  initializeSupabase();
  return getSupabaseClient()?.auth || null;
}

export async function signInWithPassword(email, password) {
  const auth = getAuthService();
  if (!auth) {
    throw new Error('Authentication service is unavailable.');
  }

  return auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email, password) {
  const auth = getAuthService();
  if (!auth) {
    throw new Error('Authentication service is unavailable.');
  }

  return auth.signUp({ email, password });
}

export async function resetPassword(email) {
  const auth = getAuthService();
  if (!auth) {
    throw new Error('Authentication service is unavailable.');
  }

  return auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`
  });
}

export async function signOut() {
  const auth = getAuthService();
  if (!auth) {
    throw new Error('Authentication service is unavailable.');
  }

  return auth.signOut();
}

export async function getCurrentSession() {
  const auth = getAuthService();
  if (!auth) {
    return null;
  }

  const { data } = await auth.getSession();
  return data.session || null;
}
