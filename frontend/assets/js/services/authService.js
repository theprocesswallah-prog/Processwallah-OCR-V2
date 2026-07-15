import { getSupabaseClient, initializeSupabase } from './supabaseClient.js';

export function getAuthService() {
  initializeSupabase();
  return getSupabaseClient()?.auth || null;
}
