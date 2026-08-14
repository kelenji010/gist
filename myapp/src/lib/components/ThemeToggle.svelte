<script>
  import { onMount } from 'svelte';
  import { getTheme, toggleTheme } from '$lib/theme.js';
  import { tap } from '$lib/iosTap.js';

  let theme = $state('light');

  function sync() {
    theme = getTheme();
  }

  if (typeof document !== 'undefined') {
    theme = getTheme();
  }

  onMount(() => {
    sync();
    const root = document.documentElement;
    const mo = new MutationObserver(() => {
      theme = getTheme();
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  });
</script>

<button
  type="button"
  class="theme-toggle"
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
  {...tap(() => {
    toggleTheme();
    theme = getTheme();
  })}
>
  {theme === 'dark' ? '☀' : '☾'}
</button>

<style>
  .theme-toggle {
    position: fixed;
    top: max(0.85rem, env(safe-area-inset-top));
    right: max(0.85rem, env(safe-area-inset-right));
    z-index: 40;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.85rem;
    height: 2.85rem;
    border-radius: 999px;
    border: 1px solid var(--gist-border);
    background: var(--gist-surface);
    color: var(--gist-icon-btn-fg);
    font-size: 1.15rem;
    line-height: 1;
    box-shadow: 0 4px 16px var(--gist-shadow);
  }

  @media (hover: hover) and (pointer: fine) {
    .theme-toggle:hover {
      background: var(--gist-icon-btn-hover);
    }
  }
</style>
