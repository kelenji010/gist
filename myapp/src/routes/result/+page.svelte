<script lang="ts">
  /**
   * RESULT PAGE (/result)
   * Shows username, score, collectible, and answer key.
   * Lets players claim/retry scoreboard save with their username.
   */
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import { loadResult, saveResult, formatTime } from '$lib/resultStore.js';
  import {
    getUsername,
    setUsername,
    generateUsername,
    validateUsername,
    getLocalCollectibles,
  } from '$lib/player.js';

  let result = $state<{
    won: boolean;
    elapsedSeconds: number;
    points?: number;
    username?: string;
    weekKey?: string;
    scoreSaved?: boolean;
    answers: { word: string; cells: string[]; icons: string[] }[];
    collectible?: { number: string; word: string } | null;
  } | null>(null);
  let usernameDraft = $state('');
  let usernameError = $state('');
  let scoreSaved = $state(false);
  let saving = $state(false);
  let saveMessage = $state('');
  let collectibles = $state<{ number: string; word: string }[]>([]);

  onMount(() => {
    result = loadResult();
    usernameDraft = result?.username || getUsername() || '';
    scoreSaved = !!result?.scoreSaved;
    collectibles = getLocalCollectibles();
  });

  function randomName() {
    usernameDraft = generateUsername();
    usernameError = '';
  }

  async function submitScore() {
    if (!result || saving) return;
    const v = validateUsername(usernameDraft);
    if (!v.ok) {
      usernameError = v.error || 'Invalid username';
      return;
    }

    saving = true;
    usernameError = '';
    saveMessage = '';
    const username = setUsername(v.username);

    try {
      const res = await fetch('/api/scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          points: result.points ?? 0,
          weekKey: result.weekKey,
          collectible: result.collectible,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        usernameError = 'That username already played this week. Try another.';
        return;
      }

      if (!res.ok) {
        usernameError = data.error || 'could not save score';
        return;
      }

      scoreSaved = true;
      saveMessage = `Saved ${result.points ?? 0} points as ${username}`;
      const next = { ...result, username, scoreSaved: true };
      result = next;
      saveResult(next);
    } catch {
      usernameError = 'could not save score';
    } finally {
      saving = false;
    }
  }
</script>

<main class="page page-center">
  <div class="result-wrap">
    {#if !result}
      <div class="panel">
        <h1>No result yet</h1>
        <p class="sub">Play this week’s puzzle first.</p>
        <div class="actions">
          <Button onclick={() => goto('/puzzle')} class="btn-primary">Play</Button>
          <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
        </div>
      </div>
    {:else}
      <h1 class="title">{result.won ? 'You won!' : 'Nice try'}</h1>
      <p class="sub">Time: <strong>{formatTime(result.elapsedSeconds)}</strong></p>

      <div class="score-box">
        <p class="score-label">Points</p>
        <p class="score-value">{result.points ?? 0}</p>
        <p class="score-hint">More points for clean solves (no hints). Lives lost lower your score. Time doesn’t count.</p>
      </div>

      {#if scoreSaved}
        <p class="username-line">
          On the scoreboard as <strong>{result.username || usernameDraft}</strong>
        </p>
        {#if saveMessage}
          <p class="save-ok">{saveMessage}</p>
        {/if}
      {:else}
        <div class="username-box">
          <label for="result-username">Username for scoreboard</label>
          <div class="username-row">
            <input
              id="result-username"
              type="text"
              maxlength="20"
              autocomplete="username"
              placeholder="Choose a name"
              bind:value={usernameDraft}
              oninput={() => (usernameError = '')}
            />
            <button type="button" class="ghost-btn" onclick={randomName}>Random</button>
          </div>
          {#if usernameError}
            <p class="field-error">{usernameError}</p>
          {/if}
          <Button onclick={submitScore} class="btn-primary save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save score'}
          </Button>
        </div>
      {/if}

      {#if result.won && result.collectible}
        <div class="card">
          <p class="card-label">Collector card: #{result.collectible.number}</p>
          <div class="card-icon">
            <Icon word={result.collectible.word} size={96} label={false} />
          </div>
          <p class="card-time">
            {scoreSaved ? `Saved to ${result.username || usernameDraft}` : 'Save your score to keep this on the board'}
          </p>
        </div>
      {/if}

      {#if collectibles.length > 1}
        <div class="collection">
          <h2>Your collectibles</h2>
          <div class="collection-row">
            {#each collectibles as c}
              <div class="mini-card">
                <Icon word={c.word} size={40} label={false} />
                <span>#{c.number}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="answers">
        <h2>Answers</h2>
        {#each result.answers as answer}
          <div class="answer-row" class:theme-row={answer.word === 'mythology'}>
            <div class="answer-result">
              {#if answer.word === 'mythology'}
                <span class="theme-word">{answer.word}</span>
              {:else}
                <Icon word={answer.word} size={48} label={true} />
              {/if}
            </div>
            <span class="eq">=</span>
            <div class="answer-parts">
              {#each answer.icons as icon, i}
                {#if i > 0}<span class="plus">+</span>{/if}
                <Icon word={icon} size={40} label={true} />
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="actions">
        <Button onclick={() => goto('/leaderboard')} class="btn-primary">Scoreboard</Button>
        <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
      </div>
    {/if}
  </div>
</main>

<style>
  .result-wrap {
    width: min(480px, 100%);
    text-align: center;
  }

  .title {
    margin: 0 0 0.35rem;
    font-size: clamp(1.6rem, 5vw, 2rem);
    color: var(--gist-text);
  }

  .sub {
    margin: 0 0 1rem;
    color: var(--gist-text-muted);
  }

  .score-box {
    border: 1.5px solid var(--gist-border-strong);
    border-radius: 14px;
    padding: 1rem 1.25rem;
    margin: 0 auto 1.25rem;
    background: var(--gist-surface-alt, #f4f9fc);
    max-width: 280px;
  }

  .score-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gist-text-muted);
  }

  .score-value {
    margin: 0.2rem 0;
    font-size: 2.4rem;
    font-weight: 800;
    color: var(--gist-text);
    line-height: 1.1;
  }

  .score-hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--gist-text-muted);
  }

  .username-line {
    margin: 0 0 1.25rem;
    color: var(--gist-text);
    font-size: 0.95rem;
  }

  .save-ok {
    margin: -0.5rem 0 1.25rem;
    color: var(--gist-primary-dark);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .username-box {
    text-align: left;
    max-width: 340px;
    margin: 0 auto 1.5rem;
  }

  .username-box label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--gist-text-muted);
    margin-bottom: 0.4rem;
  }

  .username-row {
    display: flex;
    gap: 0.45rem;
  }

  .username-row input {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 0.55rem 0.75rem;
    border: 1.5px solid var(--gist-border-strong);
    border-radius: 10px;
    font-size: 1rem;
    color: var(--gist-text);
  }

  .ghost-btn {
    min-height: 44px;
    padding: 0.55rem 0.75rem;
    border-radius: 10px;
    border: 1.5px solid var(--gist-border);
    background: var(--gist-bg);
    color: var(--gist-text);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .field-error {
    margin: 0.4rem 0 0;
    font-size: 0.8rem;
    color: #c45b5b;
    font-weight: 600;
  }

  :global(.save-btn) {
    width: 100%;
    margin-top: 0.75rem !important;
  }

  .panel {
    background: #fff;
    border: 1.5px solid var(--gist-border);
    border-radius: 16px;
    padding: 2rem 1.5rem;
  }

  .panel h1 {
    margin: 0 0 0.5rem;
    color: var(--gist-text);
  }

  .card {
    border: 1.5px solid #1a1a1a;
    border-radius: 4px;
    padding: 1.75rem 1.25rem;
    margin: 0 auto 1.75rem;
    background: #fff;
    max-width: 280px;
  }

  .card-label {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #1a1a1a;
    font-weight: 650;
  }

  .card-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .card-time {
    margin: 0;
    font-size: 0.9rem;
    color: var(--gist-text-muted);
  }

  .collection {
    text-align: left;
    margin-bottom: 1.25rem;
  }

  .collection h2,
  .answers h2 {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: var(--gist-text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .collection-row {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
  }

  .mini-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border: 1px solid var(--gist-border);
    border-radius: 10px;
    font-size: 0.7rem;
    color: var(--gist-text-muted);
    font-weight: 650;
  }

  .answers {
    text-align: left;
    border-top: 1px solid var(--gist-border);
    padding-top: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .answer-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
  }

  .answer-result {
    min-width: 4rem;
  }

  .eq,
  .plus {
    color: #999;
    font-weight: 700;
  }

  .answer-parts {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .theme-row {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gist-border);
    border-bottom: none;
  }

  .theme-word {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    color: var(--gist-text);
  }
</style>
