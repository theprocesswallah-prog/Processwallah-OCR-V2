import { loadConfig } from './configLoader.js';

export async function testConnections() {
  const config = loadConfig();
  const results = {
    supabase: { ok: false, message: 'Not tested' },
    gemini: { ok: false, message: 'Not tested' }
  };

  if (!config.supabase.url || !config.supabase.anonKey) {
    results.supabase.message = 'Supabase environment variables are not configured.';
  } else {
    results.supabase.ok = true;
    results.supabase.message = 'Supabase configuration detected.';
  }

  if (!config.gemini.apiKey) {
    results.gemini.message = 'Gemini API key is not configured.';
  } else {
    results.gemini.ok = true;
    results.gemini.message = 'Gemini API configuration detected.';
  }

  return results;
}
