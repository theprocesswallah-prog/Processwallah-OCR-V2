const runtimeEnv = typeof window !== 'undefined' && window.__APP_ENV__ ? window.__APP_ENV__ : {};
const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const appConfig = {
  appName: 'Processwallah OCR V2',
  environment: 'development',
  env: {
    supabaseUrl: runtimeEnv.SUPABASE_URL || viteEnv.VITE_SUPABASE_URL || 'https://vjhwvprfkkhvzsxliybi.supabase.co',
    supabaseAnonKey: runtimeEnv.SUPABASE_ANON_KEY || viteEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_n5HVeHGNR1bX2vjRFYlTsQ_UsLAmSsg',
    geminiApiKey: runtimeEnv.GEMINI_API_KEY || viteEnv.VITE_GEMINI_API_KEY || ''
  }
};

export default appConfig;
