<script lang="ts">
  /**
   * HOME PAGE (/)
   * Lobby screen: logo, difficulty toggle, Play / Result buttons.
   * Edit the look here; game logic lives on /puzzle.
   */
  import { Tooltip, Button } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { hasPlayedToday } from '$lib/player.js';

  let selectedMode = $state<'easy' | 'hard'>('easy');
  let playedToday = $state(false);

  onMount(() => {
    playedToday = hasPlayedToday();
  });

  function play(mode: 'easy' | 'hard') {
    // If they already played today, send them to practice mode.
    if (playedToday) {
      goto(`/puzzle?mode=${mode}&practice=1`);
      return;
    }
    goto(`/puzzle?mode=${mode}`);
  }
</script>

<main>
  <div class="container">
    <div class="border">
      <div class="top-border">
        <Button class="icon-btn" id="info">ⓘ</Button>
        <Tooltip triggeredBy="#info" placement="bottom" strategy="fixed" class="minimal-tooltip">
          <div class="tooltip-container">
            <div class="tooltip-header">How to Play</div>
            <div class="step">
              <span class="step-label">Open the puzzle</span>
              <p>Tap Play Now to open today's board.</p>
            </div>
            <div class="step">
              <span class="step-label">Solve it</span>
              <p>Follow the rules on the puzzle screen.</p>
            </div>
            <div class="step">
              <span class="step-label">See your result</span>
              <p>When you finish, you'll land on the result page.</p>
            </div>
          </div>
        </Tooltip>

        <div class="top-actions">
          <div class="toggle" role="group" aria-label="Difficulty">
            <button
              class="toggle-option"
              class:active={selectedMode === 'easy'}
              aria-pressed={selectedMode === 'easy'}
              onclick={() => (selectedMode = 'easy')}
            >Easy</button>
            <button
              class="toggle-option"
              class:active={selectedMode === 'hard'}
              aria-pressed={selectedMode === 'hard'}
              onclick={() => (selectedMode = 'hard')}
            >Not so easy</button>
          </div>

          <Button class="icon-btn" id="leaderboard" onclick={() => goto('/leaderboard')}>🜲</Button>
          <Tooltip triggeredBy="#leaderboard" placement="bottom" strategy="fixed" class="minimal-tooltip">
            <div class="tooltip-container">
              <div class="tooltip-header">Scoreboard</div>
              <div class="step">
                <span class="step-label">See top scores</span>
                <p>Play a puzzle and add your username to join!</p>
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      <div class="inner-border">
        <div class="center">
          <img src="/gistv4.png" width="250" alt="Gist Logo" />
        </div>

        <h3 class="text">Combine icons until <br /> one remains!</h3>

        <div class="center">
          <div class="split">
            <button onclick={() => play(selectedMode)} class="btn-group btn-primary">
              {playedToday ? 'Play Practice' : 'Play Now'}
            </button>
            <button onclick={() => goto('/result')} class="btn-group btn-secondary">
              {playedToday ? 'View Result' : 'Result'}
            </button>
          </div>
        </div>

        {#if playedToday}
          <p class="daily-note">
            Official puzzle done for today — practice rounds don't count toward the daily limit.
          </p>
        {/if}
      </div>

      <footer class="footer">
        <p>© 2026 Gist | <a href="/terms">Terms</a> · <a href="/login">Log in</a></p>
      </footer>
    </div>
  </div>
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
  }

  .border {
    background: white;
    overflow: hidden;
  }

  .top-border {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    color: var(--gist-text);
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .inner-border {
    padding: 3rem 2rem;
    text-align: center;
  }

  .center {
    margin: 2rem 0;
  }

  .split {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  :global(.icon-btn) {
    background: var(--gist-bg) !important;
    color: #33566b !important;
    border: 1px solid var(--gist-border) !important;
    border-radius: 8px !important;
    font-size: 1rem !important;
    line-height: 1 !important;
    padding: 0.4rem 0.7rem !important;
    box-shadow: none !important;
  }

  :global(.icon-btn:hover) {
    background: #d8e8f3 !important;
  }

  .toggle {
    display: inline-flex;
    gap: 0.2rem;
    padding: 0.2rem;
    background: var(--gist-bg);
    border: 1px solid var(--gist-border);
    border-radius: 9px;
  }

  .toggle-option {
    border: none;
    background: transparent;
    color: #33566b;
    padding: 0.32rem 0.75rem;
    border-radius: 7px;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .toggle-option.active {
    background: linear-gradient(135deg, #a8c5e0, #6f9fc4);
    color: #fff;
  }

  .text {
    font-size: 1.5rem;
    color: var(--gist-text);
    margin: 1.5rem 0;
    font-weight: 600;
  }

  .daily-note {
    text-align: center;
    color: var(--gist-text-muted);
    font-weight: 600;
    margin: 0.25rem 0 0;
  }

  :global(.btn-group) {
    padding: 0.9rem 2rem;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
  }

  :global(.btn-group.btn-primary) {
    background: linear-gradient(135deg, var(--gist-primary-light), var(--gist-primary));
    color: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(94, 143, 182, 0.35);
  }

  :global(.btn-group.btn-secondary) {
    background: #fff;
    color: var(--gist-text-muted);
    border: 2px solid var(--gist-border-strong);
  }

  .footer {
    background: var(--gist-surface-alt);
    border-top: 1px solid var(--gist-border);
    padding: 1.5rem;
    text-align: center;
    color: var(--gist-text-muted);
    font-size: 0.9rem;
  }

  .footer a {
    color: var(--gist-text-muted);
    text-decoration: none;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .container {
      padding: max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right))
        max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
    }

    .inner-border {
      padding: 2rem 1.5rem;
    }

    .text {
      font-size: 1.3rem;
    }
  }
</style>
