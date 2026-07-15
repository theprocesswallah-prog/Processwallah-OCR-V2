import { createClient } from '@supabase/supabase-js';
import appConfig from '../../../../config/app.config.js';
import supabaseConfig from '../../../../config/supabase.config.js';

let supabaseClient = null;

function isValidUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function isValidKey(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function initializeSupabase() {
  const url = appConfig.env?.supabaseUrl || supabaseConfig.url || '';
  const anonKey = appConfig.env?.supabaseAnonKey || supabaseConfig.anonKey || '';

  console.groupCollapsed('[Supabase] Initialization');
  console.info('SDK Loaded', true);
  console.info('Project URL', url || 'Not configured');
  console.info('Anon Key Present', isValidKey(anonKey));
  console.groupEnd();

  if (!isValidUrl(url)) {
    console.error('[Supabase] Invalid URL');
    return {
      client: null,
      status: 'Invalid URL',
      message: 'Supabase project URL is missing or invalid.'
    };
  }

  if (!isValidKey(anonKey)) {
    console.error('[Supabase] Invalid Key');
    return {
      client: null,
      status: 'Invalid Key',
      message: 'Supabase anonymous key is missing or invalid.'
    };
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  console.info('[Supabase] Client initialized');

  return {
    client: supabaseClient,
    status: 'Connected',
    message: 'Supabase client initialized successfully.'
  };
}

export async function testConnection() {
  const startedAt = performance.now();
  const { client, status, message } = initializeSupabase();

  if (!client) {
    console.warn('[Supabase] Connection test failed', { status, message });
    return {
      status,
      message,
      latency: null,
      session: null
    };
  }

  try {
    const { data, error } = await client.from('profiles').select('id').limit(1);
    const latency = Math.round(performance.now() - startedAt);

    if (error) {
      console.error('[Supabase] Connection test error', error);
      return {
        status: 'Disconnected',
        message: error.message || 'Unable to connect to Supabase.',
        latency,
        session: null
      };
    }

    console.info('[Supabase] Connection test succeeded', { latency, data });
    return {
      status: 'Connected',
      message: 'Supabase connection established.',
      latency,
      session: client.auth.getSession ? await client.auth.getSession() : null
    };
  } catch (error) {
    console.error('[Supabase] Network Error', error);
    return {
      status: 'Network Error',
      message: error.message || 'Network request failed.',
      latency: Math.round(performance.now() - startedAt),
      session: null
    };
  }
}

export function diagnosticSupabase() {
  const { client, status } = initializeSupabase();
  const session = client?.auth?.getSession ? 'Available' : 'Unavailable';

  console.groupCollapsed('[Supabase] Diagnostic');
  console.info('SDK Loaded', true);
  console.info('Project URL', appConfig.env?.supabaseUrl || supabaseConfig.url || 'Not configured');
  console.info('Connection Status', status);
  console.info('Latency', 'Pending');
  console.info('Current Session', session);
  console.groupEnd();
}

export function getSupabaseClient() {
  return supabaseClient;
}
