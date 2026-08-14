<script>
  // Root layout — wraps every page. Keep global head tags here.
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/gist.png';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { initTheme } from '$lib/theme.js';

  let { children } = $props();

  onMount(() => {
    initTheme();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Gist</title>
</svelte:head>

{@render children()}
<ThemeToggle />
