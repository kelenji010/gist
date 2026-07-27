/**
 * /api/scoreboard
 * GET  → list top scores
 * POST → save a player's score { username, points, puzzleId? }
 */
import { json } from '@sveltejs/kit';
import { isSupabaseConfigured } from '$lib/server/supabase.js';
import { getLeaderboard, saveScore } from '$lib/server/scores.js';

const MAX_ENTRIES = 50;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  try {
    const entries = await getLeaderboard(MAX_ENTRIES);
    return json(entries ?? []);
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

    const { username, points, puzzleId } = await request.json();

    const trimmed = (username || '').trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 20) {
      return json({ error: 'Username must be 2–20 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      return json(
        { error: 'Username may only contain letters, numbers, spaces, _ and -' },
        { status: 400 }
      );
    }

    const score = Number(points);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return json({ error: 'Invalid score' }, { status: 400 });
    }

    await saveScore({ username: trimmed, points: score, puzzleId: puzzleId || null });
    return json({ success: true });
  } catch (error) {
    console.error('Scoreboard save failed:', error.message);
    return json({ error: error.message || 'Failed to save score' }, { status: 500 });
  }
}
