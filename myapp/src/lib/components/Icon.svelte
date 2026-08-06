<script>
  /**
   * Puzzle icon from /static/icons/*.png (user's reference art).
   * Soft-clue `tint` uses a border wash — not a CSS mask — so colorful
   * icons (neon, photos) stay visible instead of disappearing.
   */
  import { iconSrc, iconLabel } from '$lib/icons.js';

  let { word = '', size = 48, label = false, tint = '' } = $props();

  const src = $derived(iconSrc(word));
  const text = $derived(iconLabel(word));
</script>

<span
  class="icon"
  class:has-tint={!!tint}
  style="--size: {size}px; --tint: {tint || 'transparent'}"
>
  {#if src}
    <img class="art" src={src} alt="" width={size} height={size} draggable="false" />
  {/if}
  {#if label && text}
    <span class="word">{text}</span>
  {/if}
</span>

<style>
  .icon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    pointer-events: none;
  }

  .art {
    display: block;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    flex-shrink: 0;
    user-select: none;
    -webkit-user-drag: none;
  }

  .icon.has-tint .art {
    border-radius: 8px;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--tint) 70%, transparent);
    background: color-mix(in srgb, var(--tint) 14%, white);
  }

  .word {
    font-size: clamp(0.55rem, 2vw, 0.7rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    color: var(--gist-text-muted, #5e8fb6);
    text-align: center;
    max-width: 5.5rem;
    line-height: 1.2;
  }
</style>
