/**
 * scores.js — read/write high scores in Supabase.
 * Used by the /api/scoreboard endpoint.
 */
import { getSupabase } from './supabase.js';

/** Create a users row if this username is new; return the user id. */
export async function upsertUser(username) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('users')
    .insert({ username })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Save (or replace) one score per username. */
export async function saveScore({ username, points, puzzleId = null }) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await upsertUser(username);

  const row = {
    user_id: userId,
    username,
    puzzle_id: puzzleId,
    points,
    created_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  const query = existing
    ? supabase.from('scores').update(row).eq('id', existing.id)
    : supabase.from('scores').insert(row);

  const { data, error } = await query
    .select('id, username, points, created_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Top scores for the leaderboard page. */
export async function getLeaderboard(limit = 50) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('scores')
    .select('id, username, points, created_at')
    .order('points', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map((row) => ({
    id: row.id,
    username: row.username,
    points: row.points,
    date: new Date(row.created_at).getTime(),
  }));
}
