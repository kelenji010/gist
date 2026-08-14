/**
 * Icon URLs — PNG art in /static/icons/ plus emoji glyphs for this week's board.
 * Files live in /static/icons/ (served as /icons/...).
 */

/** Bump when icon binaries change so production/CDN caches refresh. */
const ICON_CACHE = 'v8';

/** Emoji glyphs keyed by normalized icon id. */
const EMOJI_ICONS = {
  cent: '¢',
  roll: '🧻',
  dollar: '$',
  'rolled-cash': '💵',
  divide: '÷',
  multiply: 'x',
  addition: '+',
  hundred: '💯',
  tree: '🌳',
  swing: '🛝',
};

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
  if (key === 'picnic') return `/icons/central-park.png?${ICON_CACHE}`;
  return `/icons/${key}.png?${ICON_CACHE}`;
}

/** Display label for an icon id. */
export function iconLabel(word) {
  const key = iconKey(word);
  if (key === 'ferris-wheel') return 'ferris wheel';
  if (key === 'rolled-cash') return 'rolled cash';
  if (key === 'rolls-royce') return 'rolls-royce';
  if (key === 'kaiser-roll') return 'kaiser roll';
  if (key === 'central-park' || key === 'picnic') return 'central park';
  if (key === 'x-ray') return 'x-ray';
  return word || '';
}

/** @deprecated kept so old imports don't break; prefer iconSrc */
export function getIconSvg() {
  return '';
}
