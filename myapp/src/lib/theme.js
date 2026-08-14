/** Light/dark theme — persisted in localStorage, applied on <html data-theme>. */

const THEME_KEY = 'gist_theme';

function hasStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

/** @returns {'light' | 'dark'} */
export function getTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function preferredTheme() {
  if (!hasStorage()) return 'light';
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/** @param {'light' | 'dark'} theme */
export function setTheme(theme) {
  if (typeof document === 'undefined') return;
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'dark' ? '#121c26' : '#5e8fb6');
  if (hasStorage()) window.localStorage.setItem(THEME_KEY, next);
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/** Apply saved/system theme (also run from app.html to avoid a flash). */
export function initTheme() {
  setTheme(preferredTheme());
}
