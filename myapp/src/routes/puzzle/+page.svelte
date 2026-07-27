<script lang="ts">
  /**
   * PUZZLE PAGE (/puzzle)
   * Empty board shell — build your new puzzle UI inside .board-shell below.
   */
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
</script>

<main class="page">
  <div class="puzzle-container">
    <div class="header">
      <h1>Gist</h1>
      <p class="subtitle">Puzzle board</p>
    </div>

    <div class="puzzle-content">
      <table>
      <tr>
        <th></th>
      </table>
      <table>
      </table>
      <!-- ========== EDIT HERE: put your new puzzle board in this div ========== -->
      <div class="board-shell"></div>
      <!-- ===================================================================== -->

      <div class="actions">
        <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
      </div>
    </div>
  </div>
</main>

<style>
  .puzzle-container {
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
  }

  .header {
    padding: 2rem;
    text-align: center;
    color: var(--gist-text);
  }

  .header h1 {
    margin: 0;
    font-size: 2.8rem;
    font-weight: 700;
    letter-spacing: -1px;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    font-size: 1.1rem;
    color: var(--gist-text-muted);
  }

  .puzzle-content {
    padding: 2rem;
  }

  .board-shell {
    min-height: 280px;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .header {
      padding: 1.25rem 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .puzzle-content {
      padding: 1rem 0.75rem;
    }
  }
</style>
