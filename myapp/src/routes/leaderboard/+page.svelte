<script lang="ts">
  /**
   * LEADERBOARD PAGE (/leaderboard)
   * Loads scores from GET /api/scoreboard (Supabase).
   */
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';

  interface ScoreEntry {
    id: string;
    username: string;
    points: number;
    date: number;
  }

  let entries = $state<ScoreEntry[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const response = await fetch('/api/scoreboard');
      if (!response.ok) throw new Error('Failed to load scoreboard');
      entries = await response.json();
    } catch {
      error = 'Could not load scoreboard. Check that Supabase is set up in .env.';
    } finally {
      loading = false;
    }
  });

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<main class="page">
  <div class="leaderboard">
    <div class="header">
      <h1>Scoreboard</h1>
      <p class="subtitle">Top scores</p>
    </div>

    {#if loading}
      <p class="status">Loading scores...</p>
    {:else if error}
      <p class="status error">{error}</p>
    {:else if entries.length === 0}
      <div class="status">
        <p>No scores yet. Be the first to play!</p>
        <Button onclick={() => goto('/puzzle')} class="btn-primary">Play Now</Button>
      </div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Points</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {#each entries as entry, i}
              <tr class:top-three={i < 3}>
                <td class="rank">{i + 1}</td>
                <td class="name">{entry.username}</td>
                <td class="points">{entry.points}</td>
                <td class="date">{formatDate(entry.date)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="actions">
      <Button onclick={() => goto('/puzzle')} class="btn-primary">Play Puzzle</Button>
      <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
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
    font-size: 2.2rem;
    color: var(--gist-text);
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: var(--gist-text-muted);
  }

  .status {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--gist-text-muted);
  }

  .status.error {
    color: var(--gist-primary-dark);
  }

  .table-wrap {
    padding: 1.5rem 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gist-text-muted);
    border-bottom: 2px solid var(--gist-border);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--gist-bg);
  }

  tr.top-three .rank {
    font-weight: 800;
    color: var(--gist-primary);
  }

  .rank {
    width: 40px;
    font-weight: 700;
    color: var(--gist-border-strong);
  }

  .name {
    font-weight: 600;
    color: var(--gist-text);
  }

  .points {
    font-weight: 700;
    color: var(--gist-primary-dark);
  }

  .date {
    color: var(--gist-text-muted);
    font-size: 0.9rem;
  }
</style>
