import { getSupabaseClient, initializeSupabase } from './supabaseClient.js';

export function getDatabaseService() {
  initializeSupabase();
  return getSupabaseClient()?.from ? getSupabaseClient() : null;
}
