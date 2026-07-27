/**
 * player.js — small helpers that remember the player in the browser
 * (localStorage). Safe to edit; nothing here talks to the server.
 */

const USERNAME_KEY = 'gist_username';
const HISTORY_KEY = 'gist_history';

function hasStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

/** Today's date as "YYYY-MM-DD" (local timezone). */
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getUsername() {
  if (!hasStorage()) return '';
  return window.localStorage.getItem(USERNAME_KEY) || '';
}

/** Saves a username once. Later calls are ignored so the name stays stable. */
export function setUsername(name) {
  if (!hasStorage()) return;
  if (getUsername()) return;
  const trimmed = (name || '').trim();
  if (trimmed) window.localStorage.setItem(USERNAME_KEY, trimmed);
}

function getHistory() {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** True if the player already finished today's official (non-practice) puzzle. */
export function hasPlayedToday() {
  const today = todayKey();
  return getHistory().some((entry) => entry.date === today && !entry.practice);
}

/**
 * Call this when a puzzle is finished so the home page can show
 * "Play Practice" instead of "Play Now".
 */
export function markPlayedToday({ practice = false } = {}) {
  if (!hasStorage()) return;
  const history = getHistory();
  history.unshift({
    date: todayKey(),
    playedAt: Date.now(),
    practice: !!practice,
  });
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}
