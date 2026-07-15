import appConfig from '../config/app.config.js';
import supabaseConfig from '../config/supabase.config.js';
import geminiConfig from '../config/gemini.config.js';

export function loadConfig() {
  const runtimeEnv = window?.__APP_ENV__ || {};

  const resolvedConfig = {
    app: {
      ...appConfig,
      env: {
        supabaseUrl: runtimeEnv.SUPABASE_URL || appConfig.env.supabaseUrl || '',
        supabaseAnonKey: runtimeEnv.SUPABASE_ANON_KEY || appConfig.env.supabaseAnonKey || '',
        geminiApiKey: runtimeEnv.GEMINI_API_KEY || appConfig.env.geminiApiKey || ''
      }
    },
    supabase: {
      ...supabaseConfig,
      url: runtimeEnv.SUPABASE_URL || supabaseConfig.url || '',
      anonKey: runtimeEnv.SUPABASE_ANON_KEY || supabaseConfig.anonKey || ''
    },
    gemini: {
      ...geminiConfig,
      apiKey: runtimeEnv.GEMINI_API_KEY || geminiConfig.apiKey || ''
    }
  };

  return resolvedConfig;
}
