const runtimeEnv = typeof window !== 'undefined' && window.__APP_ENV__ ? window.__APP_ENV__ : {};

const supabaseConfig = {
  url: runtimeEnv.SUPABASE_URL || '',
  anonKey: runtimeEnv.SUPABASE_ANON_KEY || ''
};

export default supabaseConfig;
