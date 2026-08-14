<script lang="ts">
  /**
   * Compact weekly scoreboard — used on the home page popup and leaderboard page.
   */
  import { onMount } from 'svelte';

  interface ScoreEntry {
    id: string;
    username: string;
    points: number;
    date: number;
    weekKey?: string;
    collectible?: { number: string; word: string } | null;
  }

  let {
    compact = false,
    highlightUsername = '',
    autoLoad = true,
    open = false,
  } = $props<{
    compact?: boolean;
    highlightUsername?: string;
    autoLoad?: boolean;
    open?: boolean;
  }>();

  let entries = $state<ScoreEntry[]>([]);
  let weekKey = $state('');
  let loading = $state(false);
  let error = $state('');

  export async function refresh() {
    loading = true;
    error = '';
    try {
      const response = await fetch('/api/scoreboard');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not load scoreboard');
      }
      if (Array.isArray(data)) {
        entries = data;
      } else {
        entries = data.entries ?? [];
        weekKey = data.weekKey ?? '';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Could not load scoreboard';
      entries = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (autoLoad) refresh();
  });

  $effect(() => {
    if (open) refresh();
  });

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  const visibleEntries = $derived(compact ? entries.slice(0, 8) : entries);
</script>

<div class="scoreboard-panel" class:compact>
  {#if weekKey}
    <p class="week-label">Week of {weekKey}</p>
  {/if}

  {#if loading}
    <p class="status">Loading scores…</p>
  {:else if error}
    <p class="status error">{error}</p>
  {:else if visibleEntries.length === 0}
    <p class="status">No scores yet this week. Be the first!</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            {#if !compact}
              <th>Card</th>
            {/if}
            <th>Pts</th>
            {#if !compact}
              <th>Date</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each visibleEntries as entry, i}
            <tr class:top-three={i < 3} class:me={entry.username === highlightUsername}>
              <td class="rank">{i + 1}</td>
              <td class="name">{entry.username}</td>
              {#if !compact}
                <td class="card">
                  {#if entry.collectible}
                    <span class="card-chip">#{entry.collectible.number}</span>
                  {:else}
                    <span class="muted">—</span>
                  {/if}
                </td>
              {/if}
              <td class="points">{entry.points}</td>
              {#if !compact}
                <td class="date">{formatDate(entry.date)}</td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .scoreboard-panel {
    text-align: left;
    padding: 0 1rem;
  }

  .scoreboard-panel.compact {
    padding: 0;
  }

  .week-label {
    margin: 0 0 0.65rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--gist-text-muted);
  }

  .status {
    margin: 0;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    color: var(--gist-text-muted);
    line-height: 1.4;
  }

  .status.error {
    color: var(--gist-primary-dark);
  }

  .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 0;
  }

  th {
    text-align: left;
    padding: 0.45rem 0.35rem;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--gist-text-muted);
    border-bottom: 1.5px solid var(--gist-border);
  }

  td {
    padding: 0.5rem 0.35rem;
    border-bottom: 1px solid var(--gist-bg);
    font-size: 0.85rem;
  }

  tr.top-three .rank {
    font-weight: 800;
    color: var(--gist-primary);
  }

  tr.me {
    background: color-mix(in srgb, var(--gist-primary) 18%, var(--gist-surface));
  }

  .rank {
    width: 1.75rem;
    font-weight: 700;
    color: var(--gist-border-strong);
  }

  .name {
    font-weight: 600;
    color: var(--gist-text);
    word-break: break-word;
  }

  .points {
    font-weight: 700;
    color: var(--gist-primary-dark);
    white-space: nowrap;
  }

  .card-chip {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--gist-text);
  }

  .muted {
    color: var(--gist-text-muted);
  }

  .date {
    color: var(--gist-text-muted);
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .compact th,
  .compact td {
    padding: 0.42rem 0.3rem;
  }
</style>
