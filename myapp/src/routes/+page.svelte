<script lang="ts">
  /**
   * HOME PAGE (/)
   * Weekly puzzle lobby — one play per username per week.
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { hasPlayedThisWeek, getUsername } from '$lib/player.js';

  let selectedMode = $state<'easy' | 'hard'>('easy');
  let playedThisWeek = $state(false);
  let username = $state('');
  let openPanel = $state<'info' | 'scoreboard' | null>(null);

  onMount(() => {
    playedThisWeek = hasPlayedThisWeek();
    username = getUsername();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openPanel = null;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function togglePanel(id: 'info' | 'scoreboard') {
    openPanel = openPanel === id ? null : id;
  }

  function play(mode: 'easy' | 'hard') {
    if (playedThisWeek) {
      goto('/result');
      return;
    }
    goto(`/puzzle?mode=${mode}`);
  }
</script>

<main>
  <div class="container">
    <div class="border">
      <div class="top-border">
        <div class="panel-anchor">
          <button
            type="button"
            class="icon-btn"
            aria-label="How to play"
            aria-expanded={openPanel === 'info'}
            onclick={() => togglePanel('info')}
          >ⓘ</button>
          {#if openPanel === 'info'}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="panel-backdrop" role="presentation" onclick={() => (openPanel = null)}></div>
            <div class="panel panel-left" role="dialog" aria-label="How to play">
              <div class="panel-header">How to Play</div>
              <ol class="steps">
                <li>
                  <strong>Fill the blanks</strong>
                  <span>Tap a dashed tile and pick an icon. Tap again to change it.</span>
                </li>
                <li>
                  <strong>Combine three</strong>
                  <span>Swipe across 3 icons that belong together. Swipe back to undo.</span>
                </li>
                <li>
                  <strong>One play per week</strong>
                  <span>Finish to earn a random username, scoreboard entry, and collectible.</span>
                </li>
              </ol>
            </div>
          {/if}
        </div>

        <div class="top-actions">
          <div class="toggle" role="group" aria-label="Difficulty">
            <button
              type="button"
              class="toggle-option"
              class:active={selectedMode === 'easy'}
              aria-pressed={selectedMode === 'easy'}
              onclick={() => (selectedMode = 'easy')}
            >Easy</button>
            <button
              type="button"
              class="toggle-option"
              class:active={selectedMode === 'hard'}
              aria-pressed={selectedMode === 'hard'}
              onclick={() => (selectedMode = 'hard')}
            >Not so easy</button>
          </div>

          <div class="panel-anchor">
            <button
              type="button"
              class="icon-btn"
              aria-label="Scoreboard"
              aria-expanded={openPanel === 'scoreboard'}
              onclick={() => togglePanel('scoreboard')}
            >🜲</button>
            {#if openPanel === 'scoreboard'}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div class="panel-backdrop" role="presentation" onclick={() => (openPanel = null)}></div>
              <div class="panel panel-right" role="dialog" aria-label="Scoreboard">
                <div class="panel-header">Scoreboard</div>
                <p class="panel-body">
                  Weekly top scores. Finish a puzzle to get a random username and join automatically.
                </p>
                <button
                  type="button"
                  class="panel-link"
                  onclick={() => goto('/leaderboard')}
                >Open scoreboard</button>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="inner-border">
        <div class="center">
          <img src="/gistv4.png" width="250" alt="Gist Logo" />
        </div>

        <h3 class="text">Combine icons until <br /> none remain!</h3>

        <div class="center">
          <div class="split">
            <button
              type="button"
              onclick={() => play(selectedMode)}
              class="btn-group btn-primary"
              disabled={playedThisWeek}
            >
              {playedThisWeek ? 'Already played' : 'Play Now'}
            </button>
            <button type="button" onclick={() => goto('/result')} class="btn-group btn-secondary">
              Result
            </button>
          </div>
        </div>

        {#if playedThisWeek}
          <p class="weekly-note">
            You’ve played this week’s puzzle
            {#if username}
              as <strong>{username}</strong>
            {/if}.
            Come back next week!
          </p>
        {:else}
          <p class="weekly-note muted">new puzzle every week</p>
        {/if}
      </div>

      <footer class="footer">
        <p>© 2026 Gist | <a href="/terms">Terms</a></p>
      </footer>
    </div>
  </div>
</main>

<style>
  main {
    width: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .border {
    background: white;
    overflow: visible;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .top-border {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    color: var(--gist-text);
    position: relative;
    z-index: 5;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .panel-anchor {
    position: relative;
  }

  .icon-btn {
    background: var(--gist-bg);
    color: #33566b;
    border: 1px solid var(--gist-border);
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1;
    padding: 0.45rem 0.7rem;
    min-width: 2.5rem;
    min-height: 2.5rem;
    cursor: pointer;
  }

  .icon-btn:hover {
    background: #d8e8f3;
  }

  .panel-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
  }

  .panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    z-index: 30;
    width: min(280px, calc(100vw - 2rem));
    padding: 1rem 1.1rem;
    background: #fff;
    border: 1.5px solid var(--gist-border);
    border-radius: 12px;
    box-shadow: 0 10px 28px rgba(45, 74, 98, 0.12);
    text-align: left;
  }

  .panel-left {
    left: 0;
  }

  .panel-right {
    right: 0;
  }

  .panel-header {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gist-text);
  }

  .steps {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .steps li {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .steps strong {
    font-size: 0.9rem;
    color: var(--gist-text);
  }

  .steps span,
  .panel-body {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--gist-text-muted);
  }

  .panel-link {
    display: inline-flex;
    margin-top: 0.85rem;
    padding: 0.55rem 0.85rem;
    min-height: 44px;
    align-items: center;
    border: 1px solid var(--gist-border-strong);
    border-radius: 8px;
    background: var(--gist-bg);
    color: var(--gist-text);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  .panel-link:hover {
    background: #d8e8f3;
  }

  .inner-border {
    padding: 3rem 2rem;
    text-align: center;
    flex: 1;
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
    padding: 0.4rem 0.75rem;
    min-height: 36px;
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

  .weekly-note {
    text-align: center;
    color: var(--gist-text);
    font-weight: 600;
    margin: 0.25rem 0 0;
    line-height: 1.4;
    padding: 0 0.5rem;
  }

  .weekly-note.muted {
    color: var(--gist-text-muted);
    font-weight: 500;
  }

  :global(.btn-group) {
    padding: 0.9rem 2rem;
    min-height: 48px;
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

  :global(.btn-group.btn-primary:disabled) {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
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
    margin-top: auto;
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

    .top-border {
      padding: 0.85rem 1rem;
    }

    .inner-border {
      padding: 2rem 1rem;
    }

    .text {
      font-size: 1.25rem;
    }

    .center {
      margin: 1.25rem 0;
    }

    .panel {
      width: min(260px, calc(100vw - 1.5rem));
    }
  }
</style>
