/**
 * supabase.js — one shared database client for server code.
 *
 * Needs these env vars in myapp/.env:
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_PUBLISHABLE_KEY=your-key
 *
 * If they are missing, getSupabase() returns null and APIs return 503.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

export function isSupabaseConfigured() {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) return false;
  if (url.includes('YOUR_PROJECT_REF')) return false;
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) return false;

  return true;
}

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;

  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
