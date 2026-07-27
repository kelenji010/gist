<script lang="ts">
  /**
   * RESULT PAGE (/result)
   * Shown after the player finishes a puzzle.
   * Later you can show score, time, answers, etc. here.
   */
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
</script>

<main class="page page-center">
  <div class="finish-panel">
    <h1>Congratulations!</h1>
    <p class="finish-sub">You completed the puzzle.</p>

    <div class="actions">
      <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
    </div>
  </div>
</main>

<style>
  .finish-panel {
    max-width: 640px;
    width: 100%;
    background: linear-gradient(135deg, var(--gist-primary-light) 0%, var(--gist-primary) 100%);
    color: white;
    padding: 2.5rem;
    border-radius: 16px;
    text-align: center;
  }

  .finish-panel h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
  }

  .finish-sub {
    margin: 0 0 1.5rem;
    opacity: 0.95;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .finish-panel {
      padding: 1.75rem 1.25rem;
    }

    .finish-panel h1 {
      font-size: 1.75rem;
    }
  }
</style>
