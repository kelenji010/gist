<script lang="ts">
  /**
   * PUZZLE PAGE (/puzzle)
   *
   * - Tap a dashed fill-in tile → choose an icon
   * - Swipe across 3 icons to combine them
   * - Board shows icons only (no words)
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import {
    BOARD,
    GROUPS,
    THEME,
    COLLECTIBLE,
    MAX_LIVES,
    HINT_REVEAL_ORDER,
    MAX_HINTS,
    matchGroup,
    isSequenceStillValid,
    sameCellSet,
    iconsForGroup,
    colorForGroup,
  } from '$lib/puzzleBoard.js';
  import {
    hasPlayedThisWeek,
    markPlayedThisWeek,
    ensureUsername,
    generateUsername,
    setUsername,
    computePoints,
    addLocalCollectible,
    weekKey,
  } from '$lib/player.js';
  import { saveResult, formatTime } from '$lib/resultStore.js';
  import HowToPlay from '$lib/components/HowToPlay.svelte';
  import { tap } from '$lib/iosTap.js';

  type Phase = 'playing' | 'finished';

  let phase = $state<Phase>('playing');
  let lives = $state(MAX_LIVES);
  let selected = $state<string[]>([]);
  let solvedOrder = $state<string[]>([]);
  let fillAnswers = $state<Record<string, string>>({});
  let openFillId = $state<string | null>(null);
  let feedback = $state('');
  let gameStartMs = $state(0);
  let elapsedSeconds = $state(0);
  let blocked = $state(false);
  let showHowTo = $state(false);
  /** How many top-strip hints used (0–MAX_HINTS). */
  let hintsUsed = $state(0);
  /** Group ids that were already hinted when the player solved them. */
  let solvedWithHint = $state<string[]>([]);
  /**
   * After a failed 3-tile attempt: tint cells that were partly correct
   * for one unsolved group (post-submit clue only).
   */
  let attemptHint = $state<{ groupId: string; cellIds: string[] } | null>(null);

  /** Swipe tracking */
  let swiping = $state(false);
  let swipeMoved = false;
  let swipeStartId: string | null = null;
  /** Last cell under the finger (includes solved/empty tiles for pathing). */
  let swipeCursorId: string | null = null;
  let activePointerId: number | null = null;

  const hintedIds = $derived(HINT_REVEAL_ORDER.slice(0, hintsUsed));
  const hintsLeft = $derived(MAX_HINTS - hintsUsed);

  /** Top strip: car → knee → bull. Shown when solved or revealed by hint. */
  const slots = $derived(
    THEME.icons.map((id) => {
      const visible = solvedOrder.includes(id) || hintedIds.includes(id);
      if (!visible) return { id, word: null, hinted: false, solved: false };
      return {
        id,
        word: id,
        hinted: hintedIds.includes(id) && !solvedOrder.includes(id),
        solved: solvedOrder.includes(id),
      };
    })
  );

  function useHint() {
    if (phase !== 'playing' || hintsUsed >= MAX_HINTS) return;
    hintsUsed += 1;
    const messages = ['Top rebus revealed', 'Link revealed', 'Link revealed'];
    feedback = messages[hintsUsed - 1] ?? 'Hint used';
  }

  onMount(() => {
    if (hasPlayedThisWeek()) {
      blocked = true;
      goto('/result');
      return;
    }

    gameStartMs = Date.now();

    const onMove = (e: PointerEvent) => onBoardPointerMove(e);
    const onUp = (e: PointerEvent) => onBoardPointerUp(e);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  });

  $effect(() => {
    if (phase !== 'playing' || !gameStartMs) return;
    const id = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - gameStartMs) / 1000);
    }, 250);
    return () => clearInterval(id);
  });

  function cellById(id: string) {
    return BOARD.find((c) => c.id === id)!;
  }

  function displayWord(cellId: string): string | null {
    const cell = cellById(cellId);
    if (cell.type === 'fixed') return cell.word ?? null;
    return fillAnswers[cellId] ?? null;
  }

  function isSolvedCell(cellId: string) {
    return solvedOrder.some((gid) => {
      const g = GROUPS.find((x) => x.id === gid);
      return g?.cells.includes(cellId);
    });
  }

  /** True if this cell counts toward a soft clue (fill-ins must be the correct icon). */
  function countsForSoftClue(cellId: string) {
    const cell = cellById(cellId);
    if (cell.type === 'fill') return fillAnswers[cellId] === cell.correct;
    return true;
  }

  /** After submit: which unsolved group has the most overlap with the attempt (need ≥2). */
  function findPartialAttemptHint(selection: string[]) {
    let best: { groupId: string; cellIds: string[] } | null = null;
    for (const group of GROUPS) {
      if (solvedOrder.includes(group.id)) continue;
      const overlap = selection.filter(
        (id) => group.cells.includes(id) && countsForSoftClue(id)
      );
      if (overlap.length < 2) continue;
      if (!best || overlap.length > best.cellIds.length) {
        best = { groupId: group.id, cellIds: overlap };
      }
    }
    return best;
  }

  function clearAttemptHint() {
    attemptHint = null;
  }

  function tileIdFromPoint(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y);
    const tile = el?.closest?.('[data-cell-id]') as HTMLElement | null;
    return tile?.dataset?.cellId ?? null;
  }

  /** Column/row for cell ids like "a1" (col 0–2, row 0–2). */
  function cellCoords(id: string) {
    return {
      col: id.charCodeAt(0) - 97,
      row: Number(id[1]) - 1,
    };
  }

  /** True if two cells share an edge (no diagonals). Corners/edges of the board are fine. */
  function isOrthogonalNeighbors(a: string, b: string) {
    const A = cellCoords(a);
    const B = cellCoords(b);
    return Math.abs(A.col - B.col) + Math.abs(A.row - B.row) === 1;
  }

  /** Solved tiles are empty for combining but can be crossed while swiping. */
  function canPathThrough(cellId: string) {
    return isSolvedCell(cellId);
  }

  /**
   * Can we walk from → to using only orthogonal steps, optionally through solved tiles?
   * Blocks diagonal jumps even if the finger skips across a corner.
   */
  function canReachOrthogonally(fromId: string, toId: string) {
    if (fromId === toId) return true;
    if (isOrthogonalNeighbors(fromId, toId)) return true;

    const queue = [fromId];
    const seen = new Set([fromId]);
    while (queue.length) {
      const cur = queue.shift()!;
      for (const cell of BOARD) {
        const id = cell.id;
        if (seen.has(id) || !isOrthogonalNeighbors(cur, id)) continue;
        if (id === toId) return true;
        if (!canPathThrough(id)) continue;
        seen.add(id);
        queue.push(id);
      }
    }
    return false;
  }

  function isOrthogonalSelection(path: string[]) {
    for (let i = 1; i < path.length; i++) {
      if (!canReachOrthogonally(path[i - 1], path[i])) return false;
    }
    return true;
  }

  function tryAddToSwipe(cellId: string) {
    if (!cellId || isSolvedCell(cellId)) return;
    if (!displayWord(cellId)) return;

    const existing = selected.indexOf(cellId);
    if (existing !== -1) {
      // Swipe back onto an earlier tile → drop everything after it
      if (existing < selected.length - 1) {
        selected = selected.slice(0, existing + 1);
      }
      return;
    }

    if (selected.length >= 3) return;

    // Must be edge-adjacent to the last selected tile (or via solved path-through).
    const last = selected[selected.length - 1];
    if (last && !canReachOrthogonally(last, cellId)) return;

    selected = [...selected, cellId];
  }

  function onTilePointerDown(event: PointerEvent, cellId: string) {
    if (phase !== 'playing' || isSolvedCell(cellId)) return;
    clearAttemptHint();

    const cell = cellById(cellId);

    // Empty fill-in: prepare for tap → picker (no swipe until filled)
    if (cell.type === 'fill' && !displayWord(cellId)) {
      swiping = true;
      swipeMoved = false;
      swipeStartId = cellId;
      swipeCursorId = cellId;
      activePointerId = event.pointerId;
      selected = [];
      feedback = '';
      return;
    }

    if (!displayWord(cellId)) {
      feedback = 'Fill this tile first.';
      return;
    }

    swiping = true;
    swipeMoved = false;
    swipeStartId = cellId;
    swipeCursorId = cellId;
    activePointerId = event.pointerId;
    selected = [cellId];
    feedback = '';
    event.preventDefault();
  }

  function onBoardPointerMove(event: PointerEvent) {
    if (!swiping || event.pointerId !== activePointerId) return;

    const id = tileIdFromPoint(event.clientX, event.clientY);
    if (!id) return;

    if (id !== swipeStartId) swipeMoved = true;
    if (id === swipeCursorId) return;

    // Only step to an edge-neighbor of the current cursor (no diagonals / corner cuts)
    if (swipeCursorId && !isOrthogonalNeighbors(swipeCursorId, id)) return;

    // Also block selecting a tile that would make the chosen path diagonal
    if (
      selected.length > 0 &&
      !canPathThrough(id) &&
      !canReachOrthogonally(selected[selected.length - 1], id)
    ) {
      return;
    }

    swipeCursorId = id;

    // Cross solved/empty combined tiles without selecting them
    if (canPathThrough(id)) return;

    // Don't path through unfilled fill-ins
    if (!displayWord(id)) return;

    tryAddToSwipe(id);
  }

  function endSwipeTracking() {
    swiping = false;
    swipeMoved = false;
    swipeStartId = null;
    swipeCursorId = null;
    activePointerId = null;
  }

  function onBoardPointerUp(event: PointerEvent) {
    if (!swiping) return;
    // iOS can recycle pointer ids / cancel mid-gesture — still finish the swipe.
    if (activePointerId != null && event.pointerId !== activePointerId) return;

    const startId = swipeStartId;
    const moved = swipeMoved;
    const path = [...selected];

    endSwipeTracking();

    // Tap on fill-in (empty or filled) → open picker to set/change icon
    if (startId && !moved) {
      const cell = cellById(startId);
      if (cell.type === 'fill' && !isSolvedCell(startId)) {
        selected = [];
        openFillId = startId;
        return;
      }
    }

    if (path.length === 3 && isOrthogonalSelection(path)) {
      selected = path;
      checkSelection();
    } else {
      // Fewer than 3, or a diagonal/disconnected path — clear quietly
      selected = [];
      if (moved && path.length > 0) feedback = '';
    }
  }

  function checkSelection() {
    const attempt = [...selected];
    const group = matchGroup(attempt, solvedOrder, fillAnswers);

    if (!group) {
      const maybe = GROUPS.find(
        (g) => !solvedOrder.includes(g.id) && sameCellSet(attempt, g.cells)
      );
      lives -= 1;
      // Post-submit clue: tint the tiles that were partly right for a group
      attemptHint = findPartialAttemptHint(attempt);
      feedback = maybe
        ? 'Check your fill-ins.'
        : attemptHint
          ? 'Close — those tiles share a link or rebus.'
          : 'Not a match.';
      selected = [];
      if (lives <= 0) endGame(false);
      return;
    }

    const nextOrder = [...solvedOrder, group.id];
    if (!isSequenceStillValid(nextOrder)) {
      lives -= 1;
      attemptHint = findPartialAttemptHint(attempt);
      feedback = attemptHint
        ? 'Close — those tiles share a link or rebus.'
        : 'Not a match.';
      selected = [];
      if (lives <= 0) endGame(false);
      return;
    }

    clearAttemptHint();

    if (hintedIds.includes(group.id) && !solvedWithHint.includes(group.id)) {
      solvedWithHint = [...solvedWithHint, group.id];
    }

    solvedOrder = nextOrder;
    selected = [];
    feedback = 'Nice!';
    openFillId = null;

    if (solvedOrder.length === GROUPS.length) {
      setTimeout(() => endGame(true), 500);
    }
  }

  function pickFill(option: string) {
    if (!openFillId) return;
    fillAnswers = { ...fillAnswers, [openFillId]: option };
    openFillId = null;
    feedback = '';
  }

  async function endGame(won: boolean) {
    if (phase === 'finished') return;
    phase = 'finished';
    const elapsed = Math.floor((Date.now() - gameStartMs) / 1000);
    elapsedSeconds = elapsed;

    let username = ensureUsername();
    const livesLost = Math.max(0, MAX_LIVES - lives);
    const points = computePoints({
      solvedGroupIds: solvedOrder,
      hintedGroupIds: solvedWithHint,
      livesLost,
    });
    const collectible = won ? COLLECTIBLE : null;
    const week = weekKey();

    markPlayedThisWeek();
    if (collectible) addLocalCollectible(collectible);

    // Save result first so /result always has the card + answer key,
    // even if the scoreboard request is slow or fails.
    const answers = [
      ...GROUPS.map((g) => ({
        word: g.word,
        cells: [...g.cells],
        icons: iconsForGroup(g),
      })),
      {
        word: THEME.word,
        cells: [],
        icons: [...THEME.icons],
      },
    ];

    saveResult({
      won,
      elapsedSeconds: elapsed,
      points,
      username,
      weekKey: week,
      scoreSaved: false,
      answers,
      fillAnswers: {
        a1: 'neon',
        a3: 'horn',
      },
      collectible,
    });

    goto('/result');

    // Persist points + collectible to Supabase in the background.
    try {
      const res = await fetch('/api/scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, points, weekKey: week, collectible }),
      });
      if (res.ok) {
        saveResult({
          won,
          elapsedSeconds: elapsed,
          points,
          username,
          weekKey: week,
          scoreSaved: true,
          answers,
          fillAnswers: {
            a1: 'neon',
            a3: 'horn',
          },
          collectible,
        });
      }
    } catch (err) {
      console.warn('Score save failed', err);
    }
  }
</script>

{#if blocked}
  <main class="page page-center">
    <p class="feedback muted">Redirecting…</p>
  </main>
{:else}
<main class="page">
  <div class="puzzle-container">
    <header class="header">
      <div class="title-row">
        <h1>Gist</h1>
        <button
          type="button"
          class="help-btn"
          aria-label="How to play"
          {...tap(() => {
            showHowTo = true;
          })}
        >ⓘ</button>
      </div>
      <div class="hud">
        <span class="hud-item" title="Lives">
          {#each Array(MAX_LIVES) as _, i}
            <span class="life" class:lost={i >= lives}>♥</span>
          {/each}
        </span>
        <span class="hud-item timer">{formatTime(elapsedSeconds)}</span>
      </div>
    </header>

    <!-- Top strip: car → knee → bull (solved or hinted) -->
    <div class="word-strip" aria-label="Answer strip">
      {#each slots as slot, i}
        <div
          class="word-slot"
          class:filled={!!slot.word}
          class:hinted={slot.hinted}
          class:solved-slot={slot.solved}
        >
          {#if slot.word}
            <Icon word={slot.word} size={44} label={false} />
          {:else}
            <span class="slot-num">{i + 1}</span>
          {/if}
        </div>
      {/each}
    </div>

    <div class="hint-row">
      <p class="play-tip">Tap a dashed tile to fill it. Swipe 3 icons to combine.</p>
      <button
        type="button"
        class="hint-btn"
        disabled={phase !== 'playing' || hintsLeft <= 0}
        aria-label={hintsLeft > 0 ? `Use hint, ${hintsLeft} left` : 'No hints left'}
        {...(phase === 'playing' && hintsLeft > 0 ? tap(useHint) : {})}
      >
        <span class="hint-label">Hint</span>
        <span class="hint-dots" aria-hidden="true">
          {#each Array(MAX_HINTS) as _, i}
            <span class="hint-dot" class:used={i < hintsUsed}></span>
          {/each}
        </span>
      </button>
    </div>

    <!-- 3×3 board — icons only -->
    <div
      class="board"
      class:swiping
      role="grid"
      aria-label="Puzzle board"
    >
      {#each BOARD as cell}
        {@const word = displayWord(cell.id)}
        {@const isFill = cell.type === 'fill'}
        {@const isSelected = selected.includes(cell.id)}
        {@const solved = isSolvedCell(cell.id)}
        {@const inAttemptHint = !!attemptHint?.cellIds.includes(cell.id)}
        {@const attemptTint =
          inAttemptHint && attemptHint ? colorForGroup(attemptHint.groupId) : ''}
        {@const selectIndex = selected.indexOf(cell.id)}
        <div
          class="tile"
          class:selected={isSelected}
          class:solved
          class:empty-fill={!word && isFill}
          class:filled-fill={!!word && isFill}
          class:attempt-hint={inAttemptHint}
          class:tint-knee={attemptHint?.groupId === 'knee' && inAttemptHint}
          class:tint-car={attemptHint?.groupId === 'car' && inAttemptHint}
          class:tint-bull={attemptHint?.groupId === 'bull' && inAttemptHint}
          style={attemptTint ? `--group-tint: ${attemptTint}` : ''}
          data-cell-id={cell.id}
          role="gridcell"
          aria-label={word ? word : `Fill-in ${cell.id}`}
          onpointerdown={(e) => onTilePointerDown(e, cell.id)}
        >
          {#if isSelected}
            <span class="swipe-order">{selectIndex + 1}</span>
          {/if}
          {#if word}
            <Icon {word} size={56} label={false} tint={attemptTint || ''} />
          {:else}
            <span class="blank-frame" aria-hidden="true"></span>
          {/if}
        </div>
      {/each}
    </div>

    {#if feedback}
      <p class="feedback">{feedback}</p>
    {:else}
      <p class="feedback muted">&nbsp;</p>
    {/if}

    <div class="actions">
      <button
        type="button"
        class="btn-secondary"
        disabled={selected.length === 0 && !attemptHint}
        {...(selected.length === 0 && !attemptHint
          ? {}
          : tap(() => {
              selected = [];
              clearAttemptHint();
              feedback = '';
            }))}
      >Clear</button>
      <button type="button" class="btn-secondary" {...tap(() => goto('/'))}>Home</button>
    </div>
  </div>

  {#if openFillId}
    {@const fillCell = cellById(openFillId)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal-backdrop"
      role="presentation"
      {...tap(() => {
        openFillId = null;
      })}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Choose an icon"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        ontouchend={(e) => e.stopPropagation()}
      >
        <h2>Choose one</h2>
        <div class="choices">
          {#each fillCell.options ?? [] as option}
            <button type="button" class="choice" {...tap(() => pickFill(option))}>
              <Icon word={option} size={64} label={false} />
            </button>
          {/each}
        </div>
        <button
          type="button"
          class="modal-close"
          {...tap(() => {
            openFillId = null;
          })}
        >Cancel</button>
      </div>
    </div>
  {/if}

  {#if showHowTo}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal-backdrop howto-backdrop"
      role="presentation"
      {...tap(() => {
        showHowTo = false;
      })}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="modal howto-modal"
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        ontouchend={(e) => e.stopPropagation()}
      >
        <HowToPlay onClose={() => (showHowTo = false)} />
      </div>
    </div>
  {/if}
</main>
{/if}

<style>
  .puzzle-container {
    max-width: 480px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0 1rem;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--gist-text);
  }

  .help-btn {
    background: var(--gist-bg);
    color: #33566b;
    border: 1px solid var(--gist-border);
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1;
    min-width: 2.25rem;
    min-height: 2.25rem;
    cursor: pointer;
  }

  @media (hover: hover) and (pointer: fine) {
    .help-btn:hover {
      background: #d8e8f3;
    }
  }

  .hud {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hud-item {
    font-weight: 700;
    color: var(--gist-text-muted);
    font-size: 0.95rem;
  }

  .life {
    color: #c45b5b;
    margin-left: 0.15rem;
  }

  .life.lost {
    opacity: 0.25;
  }

  .timer {
    font-variant-numeric: tabular-nums;
    min-width: 3rem;
    text-align: right;
  }

  .word-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .word-slot {
    aspect-ratio: 1;
    border: 1.5px solid #e5e5e5;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .word-slot.filled {
    border-color: #1a1a1a;
    background: #fff;
  }

  .word-slot.hinted {
    border-color: var(--gist-border-strong);
    border-style: dashed;
    background: #f4f9fc;
  }

  .word-slot.solved-slot {
    border-style: solid;
    border-color: #1a1a1a;
    background: #fff;
  }

  .slot-num {
    color: #ccc;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .hint-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0 0 0.85rem;
  }

  .play-tip {
    margin: 0;
    color: var(--gist-text-muted);
    font-size: 0.82rem;
    line-height: 1.3;
    flex: 1;
    min-width: 0;
  }

  .hint-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    min-height: 40px;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    border: 1.5px solid var(--gist-border-strong);
    background: #fff;
    color: var(--gist-text);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
  }

  @media (hover: hover) and (pointer: fine) {
    .hint-btn:hover:not(:disabled) {
      background: var(--gist-bg);
    }

    .choice:hover {
      background: #fff;
    }
  }

  .hint-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .hint-dots {
    display: inline-flex;
    gap: 0.28rem;
  }

  .hint-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    border: 1.5px solid var(--gist-primary);
    background: transparent;
  }

  .hint-dot.used {
    background: var(--gist-primary);
  }

  @media (max-width: 420px) {
    .hint-row {
      flex-wrap: wrap;
    }

    .play-tip {
      flex-basis: 100%;
      order: 2;
      text-align: center;
    }

    .hint-btn {
      margin-left: auto;
    }
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin: 0 auto 0.5rem;
    touch-action: none;
    user-select: none;
  }

  .board.swiping {
    cursor: grabbing;
  }

  .tile {
    aspect-ratio: 1;
    border: 1.5px solid #1a1a1a;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    position: relative;
    touch-action: none;
    transition: box-shadow 0.12s ease, background 0.12s ease, opacity 0.12s ease;
  }

  .tile.empty-fill {
    background: #f0f0f0;
    border-style: dashed;
    border-color: #999;
  }

  .blank-frame {
    width: 42%;
    height: 42%;
    border: 1.5px dashed #bbb;
    border-radius: 4px;
  }

  .tile.selected {
    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.2);
    background: #f5f5f5;
  }

  .swipe-order {
    position: absolute;
    top: 0.35rem;
    right: 0.4rem;
    width: 1.15rem;
    height: 1.15rem;
    border-radius: 50%;
    background: #1a1a1a;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tile.solved {
    opacity: 0.4;
  }

  .tile.attempt-hint {
    border-color: var(--group-tint, #1a1a1a);
    background: color-mix(in srgb, var(--group-tint, #fff) 18%, white);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--group-tint, transparent) 40%, white);
  }

  .tile.tint-knee {
    --group-tint: #00008b;
  }

  .tile.tint-car {
    --group-tint: #0000cd;
  }

  .tile.tint-bull {
    --group-tint: #add8e6;
  }

  .feedback {
    text-align: center;
    font-weight: 650;
    color: var(--gist-primary-dark);
    min-height: 1.4em;
    margin: 0 0 0.75rem;
  }

  .feedback.muted {
    opacity: 0;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
  }

  .howto-backdrop {
    align-items: flex-start;
    overflow-y: auto;
    padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
    z-index: 60;
  }

  .modal {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    width: min(400px, 100%);
    text-align: center;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  }

  .howto-modal {
    width: min(440px, 100%);
    text-align: left;
    margin: 1rem 0;
    padding: 1.25rem 1.25rem 1.5rem;
  }

  .modal h2 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #1a1a1a;
  }

  .choices {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .choice {
    border: 1.5px solid #1a1a1a;
    border-radius: 12px;
    background: #fafafa;
    padding: 0.85rem 0.4rem;
    cursor: pointer;
  }

  .modal-close {
    margin-top: 1rem;
    background: none;
    border: none;
    color: #777;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.95rem;
  }

  @media (max-width: 420px) {
    .header h1 {
      font-size: 1.4rem;
    }
  }
</style>
