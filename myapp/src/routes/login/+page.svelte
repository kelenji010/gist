<script lang="ts">
  /**
   * LOGIN PAGE (/login)
   * Empty form shell — add username/password (or auth) fields below.
   */
  import { Button } from 'flowbite-svelte';
  import { goto } from '$app/navigation';
</script>

<main class="page page-center">
  <div class="login-panel">
    <h1>Gist</h1>
    <p class="subtitle">Log in</p>

    <!-- ========== EDIT HERE: put your login form in this div ========== -->
    <div class="login-shell"></div>
    <!-- =============================================================== -->

    <div class="actions">
      <Button onclick={() => goto('/')} class="btn-secondary">Home</Button>
    </div>
  </div>
</main>

<style>
  .login-panel {
    max-width: 480px;
    width: 100%;
    background: var(--gist-surface);
    color: var(--gist-text);
    padding: 2.5rem 2rem;
    border-radius: 16px;
    border: 2px solid var(--gist-border);
    text-align: center;
  }

  .login-panel h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -1px;
  }

  .subtitle {
    margin: 0.5rem 0 1.5rem;
    font-size: 1.1rem;
    color: var(--gist-text-muted);
  }

  .login-shell {
    min-height: 120px;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .login-panel {
      padding: 1.75rem 1.25rem;
    }

    .login-panel h1 {
      font-size: 2rem;
    }
  }
</style>
