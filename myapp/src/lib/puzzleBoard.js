/**
 * Puzzle Board 3 — Greek mythology theme
 *
 * Coordinate system (letter = column, number = row, row 1 at top):
 *   a1 b1 c1
 *   a2 b2 c2
 *   a3 b3 c3
 *
 * Visual board:
 *   [fill-in]  awl   [fill-in]
 *   hand       jay   himantes2
 *   wisdom  eye chart  eye
 *
 * Groups (order inside each group does not matter):
 *   himantes1 + himantes2 + hand = mitt   → [c1,c2,a2]
 *   athena + wisdom + eye = owl           → [a1,a3,c3]
 *   awl + jay + eye chart = algae         → [b1,b2,b3]
 *
 * Theme (shown on results):
 *   mitt + owl + algae = mythology
 *
 * Valid solve sequences (exact order of groups):
 *   algae → mitt → owl
 *   algae → owl → mitt
 */

/** @typedef {{ id: string; type: 'fixed'|'fill'; word?: string; options?: string[]; correct?: string }} Cell */

/** @type {Cell[]} */
export const BOARD = [
  // row 1
  { id: 'a1', type: 'fill', options: ['athena', 'hera', 'aphrodite'], correct: 'athena' },
  { id: 'b1', type: 'fixed', word: 'awl' },
  { id: 'c1', type: 'fill', options: ['himantes1', 'helmet', 'mittens'], correct: 'himantes1' },
  // row 2
  { id: 'a2', type: 'fixed', word: 'hand' },
  { id: 'b2', type: 'fixed', word: 'jay' },
  { id: 'c2', type: 'fixed', word: 'himantes2' },
  // row 3
  { id: 'a3', type: 'fixed', word: 'wisdom' },
  { id: 'b3', type: 'fixed', word: 'eye chart' },
  { id: 'c3', type: 'fixed', word: 'eye' },
];

/** Answer groups — cell ids, order inside a group does not matter. */
export const GROUPS = [
  { id: 'mitt', word: 'mitt', cells: ['c1', 'c2', 'a2'] },
  { id: 'owl', word: 'owl', cells: ['a1', 'a3', 'c3'] },
  { id: 'algae', word: 'algae', cells: ['b1', 'b2', 'b3'] },
];

/** Final theme shown on results: mitt + owl + algae = mythology */
export const THEME = {
  word: 'mythology',
  icons: ['mitt', 'owl', 'algae'],
};

/**
 * Top-strip hint reveal order (not board tiles).
 * Hint 1 → algae (rebus), Hint 2 → owl (link), Hint 3 → mitt (link).
 */
export const HINT_REVEAL_ORDER = ['algae', 'owl', 'mitt'];
export const MAX_HINTS = 3;

/**
 * Allowed sequences for solving the three groups (by group id).
 * Exact order of the arrays matters; cell order inside a group does not.
 */
export const VALID_SEQUENCES = [
  ['algae', 'mitt', 'owl'],
  ['algae', 'owl', 'mitt'],
];

export const COLLECTIBLE = {
  number: '001',
  word: 'owl',
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
 * (Both valid sequences start with algae.)
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
