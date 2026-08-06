<script lang="ts">
  /**
   * LEADERBOARD PAGE (/leaderboard)
   * Weekly scoreboard from GET /api/scoreboard.
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getUsername, hasPlayedThisWeek } from '$lib/player.js';
  import { tap } from '$lib/iosTap.js';

  interface ScoreEntry {
    id: string;
    username: string;
    points: number;
    date: number;
    weekKey?: string;
    collectible?: { number: string; word: string } | null;
  }

  let entries = $state<ScoreEntry[]>([]);
  let weekKey = $state('');
  let loading = $state(true);
  let error = $state('');
  let me = $state('');
  let played = $state(false);

  onMount(async () => {
    me = getUsername();
    played = hasPlayedThisWeek();
    try {
      const response = await fetch('/api/scoreboard');
      if (!response.ok) throw new Error('Failed to load scoreboard');
      const data = await response.json();
      // Support both new { entries } and legacy array shapes
      if (Array.isArray(data)) {
        entries = data;
      } else {
        entries = data.entries ?? [];
        weekKey = data.weekKey ?? '';
      }
    } catch {
      error = 'could not load scoreboard';
    } finally {
      loading = false;
    }
  });

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<main class="page">
  <div class="leaderboard">
    <div class="header">
      <h1>Scoreboard</h1>
      <p class="subtitle">
        This week’s top scores
        {#if weekKey}
          <span class="week">· week of {weekKey}</span>
        {/if}
      </p>
      {#if me}
        <p class="you">You are <strong>{me}</strong></p>
      {/if}
    </div>

    {#if loading}
      <p class="status">Loading scores...</p>
    {:else if error}
      <p class="status error">{error}</p>
    {:else if entries.length === 0}
      <div class="status">
        <p>No scores yet this week. Be the first!</p>
        {#if !played}
          <button type="button" class="btn-primary" {...tap(() => goto('/puzzle'))}>Play Now</button>
        {/if}
      </div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Card</th>
              <th>Points</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {#each entries as entry, i}
              <tr class:top-three={i < 3} class:me={entry.username === me}>
                <td class="rank">{i + 1}</td>
                <td class="name">{entry.username}</td>
                <td class="card">
                  {#if entry.collectible}
                    <span class="card-chip">#{entry.collectible.number}</span>
                  {:else}
                    <span class="muted">—</span>
                  {/if}
                </td>
                <td class="points">{entry.points}</td>
                <td class="date">{formatDate(entry.date)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="actions">
      {#if !played}
        <button type="button" class="btn-primary" {...tap(() => goto('/puzzle'))}>Play Puzzle</button>
      {:else}
        <button type="button" class="btn-primary" {...tap(() => goto('/result'))}>View Result</button>
      {/if}
      <button type="button" class="btn-secondary" {...tap(() => goto('/'))}>Home</button>
    </div>
  </div>
</main>

<style>
  .leaderboard {
    max-width: 700px;
    margin: 0 auto;
    padding-bottom: 2rem;
  }

  .header {
    text-align: center;
    padding: 2rem 1rem 1.5rem;
  }

  .header h1 {
    margin: 0;
    font-size: clamp(1.75rem, 5vw, 2.2rem);
    color: var(--gist-text);
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: var(--gist-text-muted);
  }

  .week {
    font-size: 0.9em;
  }

  .you {
    margin: 0.65rem 0 0;
    color: var(--gist-text);
    font-size: 0.95rem;
  }

  .status {
    text-align: center;
    padding: 3rem 1.5rem;
    color: var(--gist-text-muted);
  }

  .status.error {
    color: var(--gist-primary-dark);
  }

  .table-wrap {
    padding: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 320px;
  }

  th {
    text-align: left;
    padding: 0.8rem 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gist-text-muted);
    border-bottom: 2px solid var(--gist-border);
  }

  td {
    padding: 0.85rem 0.75rem;
    border-bottom: 1px solid var(--gist-bg);
  }

  tr.top-three .rank {
    font-weight: 800;
    color: var(--gist-primary);
  }

  tr.me {
    background: #f0f7fc;
  }

  .rank {
    width: 40px;
    font-weight: 700;
    color: var(--gist-border-strong);
  }

  .name {
    font-weight: 600;
    color: var(--gist-text);
    word-break: break-word;
  }

  .card {
    min-width: 4.5rem;
  }

  .card-chip {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--gist-text);
    letter-spacing: 0.02em;
  }

  .muted {
    color: var(--gist-text-muted);
  }

  .points {
    font-weight: 700;
    color: var(--gist-primary-dark);
  }

  .date {
    color: var(--gist-text-muted);
    font-size: 0.9rem;
    white-space: nowrap;
  }
</style>
