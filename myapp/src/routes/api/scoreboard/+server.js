/**
 * /api/scoreboard
 * GET  → list this week's scores (?week=YYYY-MM-DD optional)
 * POST → save score + optional collectible { username, points, weekKey, collectible? }
 *        Rejects if username already played this week (409).
 */
import { json } from '@sveltejs/kit';
import { isSupabaseConfigured } from '$lib/server/supabase.js';
import {
  getLeaderboard,
  saveScore,
  saveCollectible,
  hasPlayedWeek,
} from '$lib/server/scores.js';

const MAX_ENTRIES = 50;

function mondayWeekKey(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

function validateUsername(username) {
  const trimmed = (username || '').trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 20) {
    return { error: 'Username must be 2–20 characters' };
  }
  if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
    return { error: 'Username may only contain letters, numbers, spaces, _ and -' };
  }
  return { username: trimmed };
}

export async function GET({ url }) {
  if (!isSupabaseConfigured()) {
    return json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  try {
    const week = url.searchParams.get('week') || mondayWeekKey();
    const checkUser = url.searchParams.get('username');

    if (checkUser) {
      const v = validateUsername(checkUser);
      if (v.error) return json({ error: v.error }, { status: 400 });
      const played = await hasPlayedWeek(v.username, week);
      return json({ username: v.username, weekKey: week, played });
    }

    const entries = await getLeaderboard(MAX_ENTRIES, week);
    return json({ weekKey: week, entries: entries ?? [] });
  } catch (error) {
    console.error('Scoreboard read failed:', error.message);
    return json({ error: error.message || 'Failed to load scoreboard' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    if (!isSupabaseConfigured()) {
      return json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const v = validateUsername(body.username);
    if (v.error) return json({ error: v.error }, { status: 400 });

    const score = Number(body.points);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return json({ error: 'Invalid score' }, { status: 400 });
    }

    const weekKey = (body.weekKey || mondayWeekKey()).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) {
      return json({ error: 'Invalid week key' }, { status: 400 });
    }

    const saved = await saveScore({
      username: v.username,
      points: score,
      weekKey,
      puzzleId: body.puzzleId || null,
    });

    let collectible = null;
    if (body.collectible?.number && body.collectible?.word) {
      collectible = await saveCollectible({
        username: v.username,
        number: String(body.collectible.number),
        word: String(body.collectible.word),
        weekKey,
      });
    }

    return json({ success: true, score: saved, collectible });
  } catch (error) {
    if (error.code === 'ALREADY_PLAYED') {
      return json({ error: error.message, code: 'ALREADY_PLAYED' }, { status: 409 });
    }
    console.error('Scoreboard save failed:', error.message);
    return json({ error: error.message || 'Failed to save score' }, { status: 500 });
  }
}
