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

function readEnv(name) {
  return env[name]?.trim() || process.env[name]?.trim() || '';
}

function supabaseUrl() {
  return readEnv('SUPABASE_URL');
}

function supabaseKey() {
  return readEnv('SUPABASE_PUBLISHABLE_KEY') || readEnv('SUPABASE_ANON_KEY');
}

export function isSupabaseConfigured() {
  const url = supabaseUrl();
  const key = supabaseKey();

  if (!url || !key) return false;
  if (url.includes('YOUR_PROJECT_REF') || url.includes('your-project-ref')) return false;
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) return false;

  return true;
}

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;

  if (!client) {
    client = createClient(supabaseUrl(), supabaseKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
