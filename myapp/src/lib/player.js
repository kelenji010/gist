/**
 * player.js — browser identity + weekly play lock (localStorage).
 * Server also enforces one play per username per week.
 */

const USERNAME_KEY = 'gist_username';
const HISTORY_KEY = 'gist_history';
const COLLECTIBLES_KEY = 'gist_collectibles';

function hasStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

/** Monday (local) of the current week as "YYYY-MM-DD". */
export function weekKey(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

export function getUsername() {
  if (!hasStorage()) return '';
  return window.localStorage.getItem(USERNAME_KEY) || '';
}

/** Save username (overwrites). */
export function setUsername(name) {
  if (!hasStorage()) return '';
  const trimmed = (name || '').trim().slice(0, 20);
  if (!trimmed) return '';
  window.localStorage.setItem(USERNAME_KEY, trimmed);
  return trimmed;
}

/** Random display name like "Gist_a7k2". */
export function generateUsername() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `Gist_${suffix}`;
}

/** Ensure a username exists; create a random one if needed. */
export function ensureUsername() {
  const existing = getUsername();
  if (existing) return existing;
  return setUsername(generateUsername());
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

/** True if this browser already finished this week's puzzle. */
export function hasPlayedThisWeek() {
  const week = weekKey();
  return getHistory().some((entry) => entry.weekKey === week || entry.date === week);
}

/** Mark this week's puzzle as finished for this browser. */
export function markPlayedThisWeek() {
  if (!hasStorage()) return;
  const history = getHistory().filter((e) => e.weekKey !== weekKey());
  history.unshift({
    weekKey: weekKey(),
    playedAt: Date.now(),
  });
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

/** @deprecated use hasPlayedThisWeek */
export function hasPlayedToday() {
  return hasPlayedThisWeek();
}

/** @deprecated use markPlayedThisWeek */
export function markPlayedToday() {
  markPlayedThisWeek();
}

export function getLocalCollectibles() {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(COLLECTIBLES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Save a collectible locally (and keep unique by number). */
export function addLocalCollectible(collectible) {
  if (!hasStorage() || !collectible?.number) return;
  const list = getLocalCollectibles().filter((c) => c.number !== collectible.number);
  list.unshift({
    number: collectible.number,
    word: collectible.word,
    weekKey: weekKey(),
    earnedAt: Date.now(),
  });
  window.localStorage.setItem(COLLECTIBLES_KEY, JSON.stringify(list.slice(0, 50)));
}

/**
 * Points for the weekly scoreboard (0–100).
 * Win: time + remaining lives. Lose: partial credit for groups solved.
 */
export function computePoints({ won, elapsedSeconds, livesLeft, groupsSolved }) {
  if (!won) {
    return Math.min(30, Math.max(0, (groupsSolved || 0) * 10));
  }
  const timeScore = Math.max(20, 70 - Math.floor(Math.max(0, elapsedSeconds) / 8));
  const lifeBonus = Math.max(0, livesLeft) * 10;
  return Math.min(100, timeScore + lifeBonus);
}
