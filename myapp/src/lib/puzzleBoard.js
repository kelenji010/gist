/**
 * Puzzle Board 4 — Carnival theme
 *
 * Coordinate system (letter = column, number = row, row 1 at top):
 *   a1 b1 c1
 *   a2 b2 c2
 *   a3 b3 c3
 *
 * Visual board:
 *   [fill neon]  bumper car    minus
 *   roller coaster  clown car  on
 *   [fill horn]  red cape   bullseye target
 *
 * Groups (order inside each group does not matter):
 *   bumper car + clown car + roller coaster = car → [b1,b2,a2]
 *   neon + minus + on = knee                  → [a1,c1,c2]  (play-on-words rebus)
 *   horn + red cape + bullseye target = bull  → [a3,b3,c3]
 *
 * Theme (shown on results):
 *   car + knee + bull = carnival
 *
 * Valid solve sequences (knee needs car solved first to path through b1):
 *   car → knee → bull
 *   car → bull → knee
 *   bull → car → knee
 */

/** @typedef {{ id: string; type: 'fixed'|'fill'; word?: string; options?: string[]; correct?: string }} Cell */

/** @type {Cell[]} */
export const BOARD = [
  // row 1
  { id: 'a1', type: 'fill', options: ['neon', 'x-ray', 'lamp'], correct: 'neon' },
  { id: 'b1', type: 'fixed', word: 'bumper car' },
  { id: 'c1', type: 'fixed', word: 'minus' },
  // row 2
  { id: 'a2', type: 'fixed', word: 'roller coaster' },
  { id: 'b2', type: 'fixed', word: 'clown car' },
  { id: 'c2', type: 'fixed', word: 'on' },
  // row 3
  { id: 'a3', type: 'fill', options: ['horn', 'tusk', 'fingernail'], correct: 'horn' },
  { id: 'b3', type: 'fixed', word: 'red cape' },
  { id: 'c3', type: 'fixed', word: 'bullseye target' },
];

/** Answer groups — cell ids, order inside a group does not matter. */
export const GROUPS = [
  { id: 'car', word: 'car', cells: ['b1', 'b2', 'a2'] },
  { id: 'knee', word: 'knee', cells: ['a1', 'c1', 'c2'] },
  { id: 'bull', word: 'bull', cells: ['a3', 'b3', 'c3'] },
];

/** Final theme shown on results: car + knee + bull = carnival */
export const THEME = {
  word: 'carnival',
  icons: ['car', 'knee', 'bull'],
};

/**
 * Top-strip hint reveal order (not board tiles).
 * Hint 1 → knee (board rebus), Hint 2 → car (link), Hint 3 → bull (link).
 */
export const HINT_REVEAL_ORDER = ['knee', 'car', 'bull'];
export const MAX_HINTS = 3;

/**
 * Post-attempt tint when ≥2 tiles in a failed swipe belong to one unsolved group.
 * rebus (knee) = dark, link 1 (car) = medium, link 2 (bull) = light
 */
export const GROUP_COLORS = {
  knee: '#00008B',
  car: '#0000CD',
  bull: '#ADD8E6',
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
 * Exact order of the arrays matters; cell order inside a group does not.
 * Knee is not orthogonally connected until car (b1) is solved and pathable.
 */
export const VALID_SEQUENCES = [
  ['car', 'knee', 'bull'],
  ['car', 'bull', 'knee'],
  ['bull', 'car', 'knee'],
];

export const COLLECTIBLE = {
  number: '002',
  word: 'ferris-wheel',
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

    // Every fill-in in this group must be correctly answered
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
