/**
 * Puzzle Board 5 — Cent / Roll / Park
 *
 * Coordinate system (letter = column, number = row, row 1 at top):
 *   a1 b1 c1
 *   a2 b2 c2
 *   a3 b3 c3
 *
 * Visual board:
 *   dollar        rolled cash   [fill divide]
 *   tree          [fill RR]     kaiser roll
 *   swing         bench         hundred
 *
 * Groups (order inside each group does not matter):
 *   rolled cash + rolls-royce + kaiser roll = roll  → [b1,b2,c2]
 *   dollar + divide + hundred = cent                  → [a1,c1,c3]  (board rebus)
 *   tree + swing + bench = park                       → [a2,a3,b3]
 *
 * Theme (shown on results):
 *   cent + roll + park = central park
 *
 * Valid solve sequences (cent needs roll solved first to path through c2):
 *   roll → cent → park
 *   roll → park → cent
 *   park → roll → cent
 */

/** @typedef {{ id: string; type: 'fixed'|'fill'; word?: string; options?: string[]; correct?: string }} Cell */

/** @type {Cell[]} */
export const BOARD = [
  // row 1
  { id: 'a1', type: 'fixed', word: 'dollar' },
  { id: 'b1', type: 'fixed', word: 'rolled cash' },
  {
    id: 'c1',
    type: 'fill',
    options: ['divide', 'multiply', 'addition'],
    correct: 'divide',
  },
  // row 2
  { id: 'a2', type: 'fixed', word: 'tree' },
  {
    id: 'b2',
    type: 'fill',
    options: ['maserati', 'rolls-royce', 'lamborghini'],
    correct: 'rolls-royce',
  },
  { id: 'c2', type: 'fixed', word: 'kaiser roll' },
  // row 3
  { id: 'a3', type: 'fixed', word: 'swing' },
  { id: 'b3', type: 'fixed', word: 'bench' },
  { id: 'c3', type: 'fixed', word: 'hundred' },
];

/** Answer groups — cell ids, order inside a group does not matter. */
export const GROUPS = [
  { id: 'roll', word: 'roll', cells: ['b1', 'b2', 'c2'] },
  { id: 'cent', word: 'cent', cells: ['a1', 'c1', 'c3'] },
  { id: 'park', word: 'park', cells: ['a2', 'a3', 'b3'] },
];

/** Final theme shown on results: cent + roll + park = central park */
export const THEME = {
  word: 'central park',
  icons: ['cent', 'roll', 'park'],
};

/**
 * Top-strip hint reveal order (not board tiles).
 * Hint 1 → cent (rebus), Hint 2 → roll (link), Hint 3 → park (link).
 */
export const HINT_REVEAL_ORDER = ['cent', 'roll', 'park'];
export const MAX_HINTS = 3;

/**
 * Post-attempt tint when ≥2 tiles in a failed swipe belong to one unsolved group.
 * rebus (cent) = dark, link 1 (roll) = medium, link 2 (park) = light
 */
export const GROUP_COLORS = {
  cent: '#00008B',
  roll: '#0000CD',
  park: '#ADD8E6',
};

/** @param {string} cellId */
export function groupIdForCell(cellId) {
  const group = GROUPS.find((g) => g.cells.includes(cellId));
  return group?.id ?? null;
}

/** @param {string} groupId */
export function colorForGroup(groupId) {
  return GROUP_COLORS[groupId] ?? null;
}

/**
 * Allowed sequences for solving the three groups (by group id).
 * Cent is not swipeable until roll (c2) is solved and pathable.
 */
export const VALID_SEQUENCES = [
  ['roll', 'cent', 'park'],
  ['roll', 'park', 'cent'],
  ['park', 'roll', 'cent'],
];

export const COLLECTIBLE = {
  number: '003',
  word: 'park',
};

export const MAX_LIVES = 3;

/** Compare two cell-id lists as unordered sets. */
export function sameCellSet(a, b) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * If `selectedIds` matches an unsolved group, return that group.
 * Fill-in cells in the group must already have the correct answer.
 */
export function matchGroup(selectedIds, solvedGroupIds, fillAnswers) {
  for (const group of GROUPS) {
    if (solvedGroupIds.includes(group.id)) continue;
    if (!sameCellSet(selectedIds, group.cells)) continue;

    const cells = BOARD.filter((c) => group.cells.includes(c.id));
    const fillsOk = cells.every((c) => {
      if (c.type !== 'fill') return true;
      return fillAnswers[c.id] === c.correct;
    });
    if (!fillsOk) continue;

    return group;
  }
  return null;
}

/**
 * After a correct group is solved, check that the sequence of solved groups
 * so far is still a prefix of at least one valid sequence.
 */
export function isSequenceStillValid(solvedOrder) {
  return VALID_SEQUENCES.some((seq) =>
    solvedOrder.every((id, i) => seq[i] === id)
  );
}

/** Icon words for a group, using correct fill-in answers. */
export function iconsForGroup(group) {
  return group.cells.map((id) => {
    const cell = BOARD.find((c) => c.id === id);
    if (!cell) return '';
    if (cell.type === 'fixed') return cell.word;
    return cell.correct;
  });
}
