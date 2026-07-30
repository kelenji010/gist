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

/** Display label for an icon id (himantes1 / himantes2 → "himantes"). */
export function iconLabel(word) {
  const key = (word || '').toLowerCase().trim();
  if (key === 'himantes1' || key === 'himantes2') return 'himantes';
  return word || '';
}

/** @deprecated kept so old imports don't break; prefer iconSrc */
export function getIconSvg() {
  return '';
}
