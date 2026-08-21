/**
 * Puzzle Board 4 — Fur / Ant / Ship
 *
 * Coordinate system (letter = column, number = row, row 1 at top):
 *   a1 b1 c1
 *   a2 b2 c2
 *   a3 b3 c3
 *
 * Visual board:
 *   mink           hip            she
 *   rabbit         [fill fox]     shh
 *   [fill anthill] ant colony     queen
 *
 * Groups (order inside each group does not matter):
 *   mink + rabbit + fox = fur                         → [a1,a2,b2]
 *   anthill + ant colony + queen = ant                → [a3,b3,c3]
 *   shh + she + hip = ship                            → [b1,c1,c2]  (board rebus)
 *
 * Theme (shown on results):
 *   fur + ant + ship = friendship
 *
 * Each group is orthogonally connected, so any solve order is valid.
 */

/** @typedef {{ id: string; type: 'fixed'|'fill'; word?: string; options?: string[]; correct?: string }} Cell */
/** @typedef {{ id: string; word: string; kind: 'link'|'rebus'; cells: string[] }} Group */

/** @type {Cell[]} */
export const BOARD = [
  // row 1
  { id: 'a1', type: 'fixed', word: 'mink' },
  { id: 'b1', type: 'fixed', word: 'hip' },
  { id: 'c1', type: 'fixed', word: 'she' },
  // row 2
  { id: 'a2', type: 'fixed', word: 'rabbit' },
  {
    id: 'b2',
    type: 'fill',
    options: ['fox', 'lamb', 'goat'],
    correct: 'fox',
  },
  { id: 'c2', type: 'fixed', word: 'shh' },
  // row 3
  {
    id: 'a3',
    type: 'fill',
    options: ['anthill', 'rabbit hole', 'nest'],
    correct: 'anthill',
  },
  { id: 'b3', type: 'fixed', word: 'ant colony' },
  { id: 'c3', type: 'fixed', word: 'queen' },
];

/** Answer groups — cell ids, order inside a group does not matter. */
/** @type {Group[]} */
export const GROUPS = [
  { id: 'fur', word: 'fur', kind: 'link', cells: ['a1', 'a2', 'b2'] },
  { id: 'ant', word: 'ant', kind: 'link', cells: ['a3', 'b3', 'c3'] },
  { id: 'ship', word: 'ship', kind: 'rebus', cells: ['b1', 'c1', 'c2'] },
];

/** Final theme shown on results: fur + ant + ship = friendship */
export const THEME = {
  word: 'friendship',
  icons: ['fur', 'ant', 'ship'],
};

/**
 * Top-strip hint reveal order (not board tiles).
 * Hint 1 → fur (link), Hint 2 → ant (link), Hint 3 → ship (rebus).
 */
export const HINT_REVEAL_ORDER = ['fur', 'ant', 'ship'];
export const MAX_HINTS = 3;

/**
 * Post-attempt tint when ≥2 tiles in a failed swipe belong to one unsolved group.
 * rebus (ship) = dark, link 1 (fur) = medium, link 2 (ant) = light
 */
export const GROUP_COLORS = {
  ship: '#00008B',
  fur: '#0000CD',
  ant: '#ADD8E6',
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
 * All orders are valid — each group is an orthogonal L or row.
 */
export const VALID_SEQUENCES = [
  ['fur', 'ant', 'ship'],
  ['fur', 'ship', 'ant'],
  ['ant', 'fur', 'ship'],
  ['ant', 'ship', 'fur'],
  ['ship', 'fur', 'ant'],
  ['ship', 'ant', 'fur'],
];

export const COLLECTIBLE = {
  number: '004',
  word: 'friendship',
};

export const MAX_LIVES = 3;

/** Correct fill-in picks, keyed by cell id. */
export function correctFillAnswers() {
  /** @type {Record<string, string>} */
  const out = {};
  for (const cell of BOARD) {
    if (cell.type === 'fill' && cell.correct) out[cell.id] = cell.correct;
  }
  return out;
}

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
