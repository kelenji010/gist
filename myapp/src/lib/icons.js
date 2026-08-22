/**
 * Icon URLs — PNG art in /static/icons/ plus emoji glyphs for this week's board.
 * Files live in /static/icons/ (served as /icons/...).
 */

/** Bump when icon binaries change so production/CDN caches refresh. */
const ICON_CACHE = 'v19';

/** Emoji glyphs keyed by normalized icon id. */
const EMOJI_ICONS = {};

/** @param {string} word */
function iconKey(word) {
  return (word || '').toLowerCase().trim().replace(/\s+/g, '-');
}

/** @param {string} word */
export function iconEmoji(word) {
  return EMOJI_ICONS[iconKey(word)] ?? null;
}

/** @param {string} word */
export function iconSrc(word) {
  if (iconEmoji(word)) return '';
  const key = iconKey(word);
  if (!key) return '';
  const file = key === 'queen-ant' ? 'queen' : key;
  return `/icons/${file}.png?${ICON_CACHE}`;
}

/** Display label for an icon id. */
export function iconLabel(word) {
  const key = iconKey(word);
  if (key === 'ant-colony') return 'ant colony';
  if (key === 'owl-home') return 'owl home';
  if (key === 'queen' || key === 'queen-ant') return 'queen ant';
  return word || '';
}

/** @deprecated kept so old imports don't break; prefer iconSrc */
export function getIconSvg() {
  return '';
}
