<script>
  // Root layout — wraps every page. Keep global head tags here.
  import favicon from '$lib/assets/gist.png';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Gist</title>
</svelte:head>

{@render children()}
