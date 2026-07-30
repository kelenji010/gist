<script lang="ts">
  /**
   * RESULT PAGE (/result)
   * Shows username, score, collectible, and answer key.
   */
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import { loadResult, formatTime } from '$lib/resultStore.js';
  import { getUsername, getLocalCollectibles } from '$lib/player.js';

  let result = $state<{
    won: boolean;
    elapsedSeconds: number;
    points?: number;
    username?: string;
    weekKey?: string;
    answers: { word: string; cells: string[]; icons: string[] }[];
    collectible?: { number: string; word: string } | null;
  } | null>(null);
  let username = $state('');
  let collectibles = $state<{ number: string; word: string }[]>([]);

  onMount(() => {
    result = loadResult();
    username = result?.username || getUsername();
    collectibles = getLocalCollectibles();
  });
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
      <p class="sub">
        Time: <strong>{formatTime(result.elapsedSeconds)}</strong>
        {#if result.points != null}
          · Score: <strong>{result.points}</strong>
        {/if}
      </p>

      {#if username}
        <p class="username-line">
          Playing as <strong>{username}</strong>
        </p>
      {/if}

      {#if result.won && result.collectible}
        <div class="card">
          <p class="card-label">Collector card: #{result.collectible.number}</p>
          <div class="card-icon">
            <Icon word={result.collectible.word} size={96} label={false} />
          </div>
          <p class="card-time">Saved to {username || 'your profile'}</p>
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
    margin: 0 0 0.5rem;
    color: var(--gist-text-muted);
  }

  .username-line {
    margin: 0 0 1.25rem;
    color: var(--gist-text);
    font-size: 0.95rem;
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
