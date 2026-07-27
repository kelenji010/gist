<script>
  // Root layout — wraps every page. Keep global head tags here.
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Gist</title>
</svelte:head>

{@render children()}
