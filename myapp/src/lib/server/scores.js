/**
 * scores.js — weekly scores + collectibles in Supabase.
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

/** Has this username already submitted a score for this week? */
export async function hasPlayedWeek(username, weekKey) {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('scores')
    .select('id')
    .eq('username', username)
    .eq('week_key', weekKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

/**
 * Save one score per username per week.
 * Throws with code ALREADY_PLAYED if they already have a row for this week.
 */
export async function saveScore({ username, points, weekKey, puzzleId = null }) {
  const supabase = getSupabase();
  if (!supabase) return null;

  if (await hasPlayedWeek(username, weekKey)) {
    const err = new Error('This username already played this week');
    err.code = 'ALREADY_PLAYED';
    throw err;
  }

  const userId = await upsertUser(username);

  const row = {
    user_id: userId,
    username,
    puzzle_id: puzzleId,
    points,
    week_key: weekKey,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('scores')
    .insert(row)
    .select('id, username, points, week_key, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const err = new Error('This username already played this week');
      err.code = 'ALREADY_PLAYED';
      throw err;
    }
    throw new Error(error.message);
  }
  return data;
}

/** Latest collectible for each username (by earned_at). */
async function latestCollectiblesByUsername(usernames) {
  const supabase = getSupabase();
  if (!supabase || !usernames?.length) return new Map();

  const { data, error } = await supabase
    .from('collectibles')
    .select('username, number, word, week_key, earned_at')
    .in('username', usernames)
    .order('earned_at', { ascending: false });

  if (error) throw new Error(error.message);

  /** @type {Map<string, { number: string; word: string; weekKey: string }>} */
  const map = new Map();
  for (const row of data ?? []) {
    if (map.has(row.username)) continue;
    map.set(row.username, {
      number: row.number,
      word: row.word,
      weekKey: row.week_key,
    });
  }
  return map;
}

/** Top scores for the current (or given) week, including latest collectible. */
export async function getLeaderboard(limit = 50, weekKey = null) {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase
    .from('scores')
    .select('id, username, points, week_key, created_at')
    .order('points', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (weekKey) query = query.eq('week_key', weekKey);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const collectibleMap = await latestCollectiblesByUsername(
    (data ?? []).map((row) => row.username)
  );

  return data.map((row) => ({
    id: row.id,
    username: row.username,
    points: row.points,
    weekKey: row.week_key,
    date: new Date(row.created_at).getTime(),
    collectible: collectibleMap.get(row.username) ?? null,
  }));
}

/** Save a collectible card for a username (idempotent per number). */
export async function saveCollectible({ username, number, word, weekKey }) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await upsertUser(username);

  const { data: existing } = await supabase
    .from('collectibles')
    .select('id')
    .eq('username', username)
    .eq('number', number)
    .maybeSingle();

  if (existing) {
    // Keep the card linked to this username; refresh word/week if they re-earn it.
    const { data, error } = await supabase
      .from('collectibles')
      .update({ word, week_key: weekKey, user_id: userId })
      .eq('id', existing.id)
      .select('id, username, number, word, week_key')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('collectibles')
    .insert({
      user_id: userId,
      username,
      number,
      word,
      week_key: weekKey,
    })
    .select('id, username, number, word, week_key')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase
        .from('collectibles')
        .select('id, username, number, word, week_key')
        .eq('username', username)
        .eq('number', number)
        .maybeSingle();
      return again;
    }
    throw new Error(error.message);
  }
  return data;
}

export async function getCollectibles(username) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('collectibles')
    .select('id, number, word, week_key, earned_at')
    .eq('username', username)
    .order('earned_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
