import { createLocalSaveAdapter } from './localSaveAdapter.js';
import { createSupabaseSaveAdapter } from './supabaseSaveAdapter.js';
import { createSupabaseClient, isSupabaseEnabled } from '../services/supabaseClient.js';

// ==================================================
// PERSISTENCE ADAPTER FACTORY
// ==================================================

export function createSaveAdapter() {
  const localAdapter = createLocalSaveAdapter();
  const client = createSupabaseClient();

  if (!isSupabaseEnabled() || !client) {
    return localAdapter;
  }

  return createSupabaseSaveAdapter(client, localAdapter);
}
