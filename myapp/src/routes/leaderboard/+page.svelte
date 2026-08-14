<script lang="ts">
  /**
   * LEADERBOARD PAGE (/leaderboard)
   * Weekly scoreboard from GET /api/scoreboard.
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getUsername, hasPlayedThisWeek } from '$lib/player.js';
  import ScoreboardPanel from '$lib/components/ScoreboardPanel.svelte';
  import { tap } from '$lib/iosTap.js';

  let me = $state('');
  let played = $state(false);

  onMount(() => {
    me = getUsername();
    played = hasPlayedThisWeek();
  });
</script>

<main class="page">
  <div class="leaderboard">
    <div class="header">
      <h1>Scoreboard</h1>
      <p class="subtitle">This week’s top scores</p>
      {#if me}
        <p class="you">You are <strong>{me}</strong></p>
      {/if}
    </div>

    <ScoreboardPanel highlightUsername={me} />

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
    padding: 2rem 1rem 1rem;
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

  .you {
    margin: 0.65rem 0 0;
    color: var(--gist-text);
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1.5rem 1rem 0;
  }
</style>
