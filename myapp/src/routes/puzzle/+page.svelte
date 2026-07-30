<script lang="ts">
  /**
   * PUZZLE PAGE (/puzzle)
   *
   * - Tap a dashed fill-in tile → choose an icon
   * - Swipe across 3 icons to combine them
   * - Board shows icons only (no words)
   */
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import {
    BOARD,
    GROUPS,
    THEME,
    COLLECTIBLE,
    MAX_LIVES,
    matchGroup,
    isSequenceStillValid,
    sameCellSet,
    iconsForGroup,
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

  /** Swipe tracking */
  let swiping = $state(false);
  let swipeMoved = false;
  let swipeStartId: string | null = null;
  let activePointerId: number | null = null;

  const solvedWords = $derived(
    solvedOrder.map((id) => GROUPS.find((g) => g.id === id)?.word ?? id)
  );
  const slots = $derived([0, 1, 2].map((i) => solvedWords[i] ?? null));

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

  /** True if two cells share an edge (no diagonals). */
  function isOrthogonalNeighbors(a: string, b: string) {
    const A = cellCoords(a);
    const B = cellCoords(b);
    return Math.abs(A.col - B.col) + Math.abs(A.row - B.row) === 1;
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
    // Only allow up / down / left / right from the last tile
    const last = selected[selected.length - 1];
    if (last && !isOrthogonalNeighbors(last, cellId)) return;

    selected = [...selected, cellId];
  }

  function onTilePointerDown(event: PointerEvent, cellId: string) {
    if (phase !== 'playing' || isSolvedCell(cellId)) return;

    const cell = cellById(cellId);

    // Empty fill-in: prepare for tap → picker (no swipe until filled)
    if (cell.type === 'fill' && !displayWord(cellId)) {
      swiping = true;
      swipeMoved = false;
      swipeStartId = cellId;
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

    // Don't swipe-select empty fill-ins
    if (!displayWord(id)) return;

    tryAddToSwipe(id);
  }

  function onBoardPointerUp(event: PointerEvent) {
    if (!swiping || event.pointerId !== activePointerId) return;

    const startId = swipeStartId;
    const moved = swipeMoved;
    const path = [...selected];

    swiping = false;
    swipeMoved = false;
    swipeStartId = null;
    activePointerId = null;

    // Tap on fill-in (empty or filled) → open picker to set/change icon
    if (startId && !moved) {
      const cell = cellById(startId);
      if (cell.type === 'fill' && !isSolvedCell(startId)) {
        selected = [];
        openFillId = startId;
        return;
      }
    }

    if (path.length === 3) {
      selected = path;
      checkSelection();
    } else {
      // Fewer than 3 (including swipe-back cancel) — clear quietly
      selected = [];
      if (moved && path.length > 0) feedback = '';
    }
  }

  function checkSelection() {
    const group = matchGroup(selected, solvedOrder, fillAnswers);

    if (!group) {
      const maybe = GROUPS.find(
        (g) => !solvedOrder.includes(g.id) && sameCellSet(selected, g.cells)
      );
      lives -= 1;
      feedback = maybe ? 'Check your fill-ins.' : 'Not a match.';
      selected = [];
      if (lives <= 0) endGame(false);
      return;
    }

    const nextOrder = [...solvedOrder, group.id];
    if (!isSequenceStillValid(nextOrder)) {
      lives -= 1;
      feedback = 'Not a match.';
      selected = [];
      if (lives <= 0) endGame(false);
      return;
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
    const points = computePoints({
      won,
      elapsedSeconds: elapsed,
      livesLeft: Math.max(0, lives),
      groupsSolved: solvedOrder.length,
    });
    const collectible = won ? COLLECTIBLE : null;
    const week = weekKey();

    markPlayedThisWeek();
    if (collectible) addLocalCollectible(collectible);

    // Persist score + collectible (server enforces one play / username / week)
    try {
      let res = await fetch('/api/scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, points, weekKey: week, collectible }),
      });

      if (res.status === 409) {
        username = setUsername(generateUsername());
        await fetch('/api/scoreboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, points, weekKey: week, collectible }),
        });
      }
    } catch (err) {
      console.warn('Score save failed', err);
    }

    saveResult({
      won,
      elapsedSeconds: elapsed,
      points,
      username,
      weekKey: week,
      answers: [
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
      ],
      fillAnswers: {
        a1: 'athena',
        c1: 'himantes1',
      },
      collectible,
    });

    goto('/result');
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
      <h1>Gist</h1>
      <div class="hud">
        <span class="hud-item" title="Lives">
          {#each Array(MAX_LIVES) as _, i}
            <span class="life" class:lost={i >= lives}>♥</span>
          {/each}
        </span>
        <span class="hud-item timer">{formatTime(elapsedSeconds)}</span>
      </div>
    </header>

    <!-- Top strip: result icons appear as groups are solved (icons only) -->
    <div class="word-strip" aria-label="Solved words">
      {#each slots as word, i}
        <div class="word-slot" class:filled={!!word}>
          {#if word}
            <Icon {word} size={44} label={false} />
          {:else}
            <span class="slot-num">{i + 1}</span>
          {/if}
        </div>
      {/each}
    </div>

    <p class="hint">Tap a dashed tile to fill or change it. Swipe across 3 icons to combine them.</p>

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
        {@const selectIndex = selected.indexOf(cell.id)}
        <div
          class="tile"
          class:selected={isSelected}
          class:solved
          class:empty-fill={!word && isFill}
          class:filled-fill={!!word && isFill}
          data-cell-id={cell.id}
          role="gridcell"
          aria-label={word ? word : `Fill-in ${cell.id}`}
          onpointerdown={(e) => onTilePointerDown(e, cell.id)}
        >
          {#if isSelected}
            <span class="swipe-order">{selectIndex + 1}</span>
          {/if}
          {#if word}
            <Icon {word} size={56} label={false} />
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
      <Button
        onclick={() => {
          selected = [];
          feedback = '';
        }}
        class="btn-secondary"
        disabled={selected.length === 0}
      >Clear</Button>
      <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
    </div>
  </div>

  {#if openFillId}
    {@const fillCell = cellById(openFillId)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-backdrop" role="presentation" onclick={() => (openFillId = null)}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Choose an icon"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
      >
        <h2>Choose one</h2>
        <div class="choices">
          {#each fillCell.options ?? [] as option}
            <button type="button" class="choice" onclick={() => pickFill(option)}>
              <Icon word={option} size={64} label={false} />
            </button>
          {/each}
        </div>
        <button type="button" class="modal-close" onclick={() => (openFillId = null)}>Cancel</button>
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

  .header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--gist-text);
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

  .slot-num {
    color: #ccc;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .hint {
    text-align: center;
    color: var(--gist-text-muted);
    font-size: 0.88rem;
    margin: 0 0 0.85rem;
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

  .modal {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    width: min(400px, 100%);
    text-align: center;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
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

  .choice:hover {
    background: #fff;
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
