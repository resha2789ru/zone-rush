import { SUPABASE_CONFIG } from '../config/supabaseConfig.js';

// ==================================================
// SUPABASE CLIENT BOOTSTRAP
// ==================================================

function hasValidConfig() {
  const key = SUPABASE_CONFIG.publishableKey;
  const hasSupportedPublicKey =
    typeof key === 'string' &&
    (key.startsWith('sb_publishable_') || key.startsWith('eyJ'));

  return (
    SUPABASE_CONFIG.enabled &&
    typeof SUPABASE_CONFIG.url === 'string' &&
    SUPABASE_CONFIG.url.startsWith('https://') &&
    hasSupportedPublicKey
  );
}

export function isSupabaseEnabled() {
  return hasValidConfig();
}

export function createSupabaseClient() {
  if (!hasValidConfig()) return null;
  if (!window.supabase?.createClient) return null;

  try {
    return window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.publishableKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  } catch (error) {
    console.warn('Supabase client init failed, using local fallback.', error);
    return null;
  }
}

export async function withSupabaseTimeout(promise, timeoutMs = SUPABASE_CONFIG.requestTimeoutMs) {
  let timeoutId = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`Supabase request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }
}
