const runtimeEnv = typeof window !== 'undefined' && window.__APP_ENV__ ? window.__APP_ENV__ : {};

const appConfig = {
  appName: 'Processwallah OCR V2',
  environment: 'development',
  env: {
    supabaseUrl: runtimeEnv.SUPABASE_URL || '',
    supabaseAnonKey: runtimeEnv.SUPABASE_ANON_KEY || '',
    geminiApiKey: runtimeEnv.GEMINI_API_KEY || ''
  }
};

export default appConfig;
