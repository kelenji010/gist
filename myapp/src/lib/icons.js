/**
 * Icon URLs — cropped from the user's reference art sheets.
 * Files live in /static/icons/ (served as /icons/...).
 */

/** @param {string} word */
export function iconSrc(word) {
  const key = (word || '').toLowerCase().trim().replace(/\s+/g, '-');
  if (!key) return '';
  return `/icons/${key}.png`;
}

/** Display label for an icon id. */
export function iconLabel(word) {
  const key = (word || '').toLowerCase().trim();
  if (key === 'ferris-wheel') return 'ferris wheel';
  if (key === 'bumper-car' || key === 'bumper car') return 'bumper car';
  if (key === 'clown-car' || key === 'clown car') return 'clown car';
  if (key === 'x-ray') return 'x-ray';
  return word || '';
}

/** @deprecated kept so old imports don't break; prefer iconSrc */
export function getIconSvg() {
  return '';
}
