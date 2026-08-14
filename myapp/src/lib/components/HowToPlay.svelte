<script>
  /**
   * How to Play — shared directions with demos.
   */
  import { tap } from '$lib/iosTap.js';

  let { onClose = undefined } = $props();

  const linkParts = [
    { src: '/howto/grass.png', label: 'grass' },
    { src: '/howto/moss.png', label: 'moss' },
    { src: '/howto/vines.png', label: 'vines' },
  ];
  const linkResult = { src: '/howto/green-plants.png', label: 'green plants' };

  const rebusParts = [
    { src: '/howto/car.png', label: 'car' },
    { src: '/howto/tea.png', label: 'tea' },
    { src: '/howto/gun.png', label: 'gun' },
  ];
  const rebusResult = { src: '/howto/cardigan.png', label: 'cardigan' };

  const wordplayParts = [
    { src: '/howto/letter-i.png', label: 'I' },
    { src: '/howto/scream.png', label: 'scream' },
  ];
  const wordplayResult = { src: '/howto/ice-cream.png', label: 'ice cream' };

  /** Top strip — three icons that combine into one rebus. */
  const topStripIcons = rebusParts;

  /**
   * 3×3 schematic matching a real board layout:
   *   rebus | link-a | fill
   *   link-b | fill  | link-a
   *   link-b | link-b | rebus
   */
  const boardCells = [
    { group: 'rebus' },
    { group: 'link-a' },
    { group: 'fill' },
    { group: 'link-b' },
    { group: 'fill' },
    { group: 'link-a' },
    { group: 'link-b' },
    { group: 'link-b' },
    { group: 'rebus' },
  ];
</script>

<div class="howto">
  <div class="howto-top">
    <h2>How to Play</h2>
    {#if onClose}
      <button type="button" class="close" aria-label="Close" {...tap(onClose)}>×</button>
    {/if}
  </div>

  <section class="step">
    <h3>1. How do you move?</h3>
    <p>
      Swipe across tiles <strong>orthogonally</strong> — only horizontal or vertical moves along
      shared edges. Diagonals do not count.
    </p>

    <div class="ortho" aria-hidden="true">
      <div class="ortho-grid">
        <span class="cell ghost"></span>
        <span class="cell ok">↑</span>
        <span class="cell ghost"></span>
        <span class="cell ok">←</span>
        <span class="cell center">●</span>
        <span class="cell ok">→</span>
        <span class="cell ghost"></span>
        <span class="cell ok">↓</span>
        <span class="cell ghost"></span>
      </div>
      <p class="caption muted">Valid moves from any tile</p>
    </div>

    <div class="swipe-demo" aria-hidden="true">
      <p class="caption">Example swipe on the board</p>
      <div class="mini-board">
        {#each Array(9) as _, i}
          {@const row = Math.floor(i / 3)}
          {@const col = i % 3}
          {@const onPath =
            (row === 2 && col === 0) || (row === 2 && col === 1) || (row === 1 && col === 1)}
          {@const order =
            row === 2 && col === 0 ? 1 : row === 2 && col === 1 ? 2 : row === 1 && col === 1 ? 3 : 0}
          <span class="mini-tile" class:on-path={onPath}>
            {#if order}<span class="swipe-num">{order}</span>{/if}
          </span>
        {/each}
      </div>
      <p class="caption muted good">✓ L-shaped swipe — each step moves along a shared edge</p>
      <div class="mini-board bad">
        {#each Array(9) as _, i}
          {@const row = Math.floor(i / 3)}
          {@const col = i % 3}
          {@const onPath = row === col}
          <span class="mini-tile" class:on-path={onPath} class:bad-path={onPath}></span>
        {/each}
      </div>
      <p class="caption muted bad">✗ Diagonal swipes are not allowed</p>
    </div>
  </section>

  <section class="step">
    <h3>2. The puzzle board</h3>
    <p>
      Every week has <strong>2 rebuses</strong>, <strong>2 links</strong>, and
      <strong>2 fill-ins</strong>. The <strong>top strip</strong> is three icons that combine
      into a rebus. The <strong>3×3 board</strong> has one rebus, two links, and two fill-ins.
    </p>

    <div class="board-diagram" aria-hidden="true">
      <p class="caption">Top strip — rebus</p>
      <div class="strip-row">
        {#each topStripIcons as icon, i}
          {#if i > 0}<span class="strip-plus">+</span>{/if}
          <div class="diagram-slot strip-icon">
            <img src={icon.src} alt="" />
          </div>
        {/each}
      </div>

      <p class="caption board-caption">3×3 board</p>
      <div class="diagram-board">
        {#each boardCells as cell}
          <div
            class="diagram-tile"
            class:is-fill={cell.group === 'fill'}
            class:group-rebus={cell.group === 'rebus'}
            class:group-link-a={cell.group === 'link-a'}
            class:group-link-b={cell.group === 'link-b'}
          ></div>
        {/each}
      </div>

      <ul class="board-legend">
        <li><span class="swatch rebus"></span> Rebus</li>
        <li><span class="swatch link-a"></span> Link</li>
        <li><span class="swatch link-b"></span> Link</li>
        <li><span class="swatch fill"></span> Fill-in</li>
      </ul>
    </div>
  </section>

  <section class="step">
    <h3>3. Puzzle pieces</h3>

    <div class="piece">
      <h4>Fill-ins</h4>
      <p>
        Dashed tiles with a missing icon. Tap one, pick from three choices, and tap again to
        change your pick before you combine that group.
      </p>
      <div class="demo demo-fill">
        <div class="demo-tile dashed">
          <span class="blank"></span>
          <span class="tap-ring"></span>
        </div>
        <span class="demo-arrow">→</span>
        <div class="demo-choices">
          <div class="demo-choice pop-1">
            <img src="/howto/mushroom.png" alt="" />
          </div>
          <div class="demo-choice pop-2">
            <img src="/howto/yeast.png" alt="" />
          </div>
          <div class="demo-choice pop-3 highlight">
            <img src="/howto/grass.png" alt="" />
          </div>
        </div>
        <span class="demo-arrow">→</span>
        <div class="demo-tile filled">
          <img src="/howto/grass.png" alt="" />
        </div>
      </div>
    </div>

    <div class="piece">
      <h4>Rebus</h4>
      <p>
        Three icons that combine into a new word — by stacking sounds, math, symbols, or a play
        on words. One rebus answer appears in the top strip; the other is solved on the board.
      </p>
      <div class="example">
        <p class="caption">Sound stack</p>
        <div class="example-row">
          {#each rebusParts as part, i}
            {#if i > 0}<span class="plus">+</span>{/if}
            <span class="ex-icon">
              <img src={part.src} alt="" />
              <span class="ex-label">{part.label}</span>
            </span>
          {/each}
          <span class="eq">=</span>
          <span class="ex-icon">
            <img src={rebusResult.src} alt="" />
            <span class="ex-label">{rebusResult.label}</span>
          </span>
        </div>
        <p class="example-note">car + tea + gun → cardigan</p>
      </div>
      <div class="example">
        <p class="caption">Play on words</p>
        <div class="example-row">
          {#each wordplayParts as part, i}
            {#if i > 0}<span class="plus">+</span>{/if}
            <span class="ex-icon">
              <img src={part.src} alt="" />
              <span class="ex-label">{part.label}</span>
            </span>
          {/each}
          <span class="eq">=</span>
          <span class="ex-icon">
            <img src={wordplayResult.src} alt="" />
            <span class="ex-label">{wordplayResult.label}</span>
          </span>
        </div>
        <p class="example-note">I + scream → ice cream</p>
      </div>
    </div>

    <div class="piece">
      <h4>Links</h4>
      <p>Three icons that share one idea, category, or theme.</p>
      <div class="example">
        <div class="example-row">
          {#each linkParts as part, i}
            {#if i > 0}<span class="plus">+</span>{/if}
            <span class="ex-icon">
              <img src={part.src} alt="" />
              <span class="ex-label">{part.label}</span>
            </span>
          {/each}
          <span class="eq">=</span>
          <span class="ex-icon">
            <img src={linkResult.src} alt="" />
            <span class="ex-label">{linkResult.label}</span>
          </span>
        </div>
        <p class="example-note">grass + moss + vines → green plants</p>
      </div>
    </div>
  </section>

  <section class="step">
    <h3>4. One play per week</h3>
    <p>
      Finish to earn a collectible and climb the weekly scoreboard. Score is based on correct
      answers without hints (best), answers with hints, and lives lost.
    </p>
  </section>
</div>

<style>
  .howto {
    text-align: left;
    color: var(--gist-text);
  }

  .howto-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
    letter-spacing: 0.02em;
  }

  .close {
    background: var(--gist-bg);
    border: 1px solid var(--gist-border);
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 8px;
    font-size: 1.4rem;
    line-height: 1;
    color: var(--gist-text);
    cursor: pointer;
  }

  .step {
    padding: 0.85rem 0;
    border-top: 1px solid var(--gist-border);
  }

  .step:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  h3 {
    margin: 0 0 0.35rem;
    font-size: 0.95rem;
  }

  h4 {
    margin: 0 0 0.3rem;
    font-size: 0.88rem;
    color: var(--gist-text);
  }

  p {
    margin: 0 0 0.75rem;
    font-size: 0.88rem;
    line-height: 1.45;
    color: var(--gist-text-muted);
  }

  .caption {
    margin: 0 0 0.45rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gist-text);
  }

  .caption.muted {
    color: var(--gist-text-muted);
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
    margin-top: 0.35rem;
    margin-bottom: 0;
    font-size: 0.78rem;
  }

  .caption.muted.good {
    color: #3d7a5c;
  }

  .caption.muted.bad {
    color: #b85c5c;
  }

  .ortho {
    background: var(--gist-surface-alt, #f4f9fc);
    border: 1px solid var(--gist-border);
    border-radius: 12px;
    padding: 0.75rem;
    margin-bottom: 0.85rem;
  }

  .ortho-grid {
    display: grid;
    grid-template-columns: repeat(3, 36px);
    gap: 0.3rem;
    justify-content: center;
  }

  .ortho-grid .cell {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .ortho-grid .ok {
    background: #fff;
    border: 1.5px solid var(--gist-primary);
    color: var(--gist-primary-dark);
  }

  .ortho-grid .center {
    background: #1a1a1a;
    color: #fff;
    border: 1.5px solid #1a1a1a;
  }

  .ortho-grid .ghost {
    background: transparent;
    border: 1.5px dashed #d5e2ec;
    color: transparent;
  }

  .swipe-demo {
    margin-top: 0.5rem;
  }

  .mini-board {
    display: grid;
    grid-template-columns: repeat(3, 42px);
    gap: 0;
    justify-content: center;
    width: fit-content;
    margin: 0 auto 0.65rem;
    border: 1.5px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
  }

  .mini-board.bad {
    margin-top: 0.5rem;
  }

  .mini-tile {
    width: 42px;
    height: 42px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    background: #fafafa;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .mini-tile:nth-child(3n) {
    border-right: none;
  }

  .mini-tile:nth-child(n + 7) {
    border-bottom: none;
  }

  .mini-tile.on-path {
    background: #eef5fb;
    box-shadow: inset 0 0 0 2px var(--gist-primary);
  }

  .mini-tile.bad-path {
    background: #fdf0f0;
    box-shadow: inset 0 0 0 2px #c45b5b;
  }

  .swipe-num {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: #1a1a1a;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .board-diagram {
    background: var(--gist-surface-alt, #f4f9fc);
    border: 1px solid var(--gist-border);
    border-radius: 12px;
    padding: 0.85rem;
    margin-top: 0.25rem;
  }

  .strip-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    max-width: 240px;
    margin: 0 auto 0.85rem;
  }

  .strip-plus {
    color: #999;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .diagram-slot,
  .diagram-tile {
    aspect-ratio: 1;
    border-radius: 8px;
    border: 1.5px solid #ccc;
    background: #fff;
  }

  .diagram-slot.strip-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    border-color: #00008b;
    background: #f0f0ff;
  }

  .diagram-slot.strip-icon img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    display: block;
  }

  .board-caption {
    margin-top: 0.25rem;
  }

  .diagram-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    max-width: 220px;
    margin: 0 auto 0.75rem;
    border: 1.5px solid #bbb;
    border-radius: 10px;
    overflow: hidden;
  }

  .diagram-tile {
    min-height: 52px;
    border-right: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
    border-radius: 0;
  }

  .diagram-tile:nth-child(3n) {
    border-right: none;
  }

  .diagram-tile:nth-child(n + 7) {
    border-bottom: none;
  }

  .diagram-tile.group-rebus {
    background: #e8e8ff;
  }

  .diagram-tile.group-link-a {
    background: #e8eeff;
  }

  .diagram-tile.group-link-b {
    background: #eef4ff;
  }

  .diagram-tile.is-fill {
    background: #f0f0f0;
    box-shadow: inset 0 0 0 1.5px #999;
  }

  .board-legend {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.65rem 1rem;
    font-size: 0.78rem;
    color: var(--gist-text-muted);
  }

  .board-legend li {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .swatch {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    flex-shrink: 0;
  }

  .swatch.rebus {
    background: #e8e8ff;
  }

  .swatch.link-a {
    background: #e8eeff;
  }

  .swatch.link-b {
    background: #eef4ff;
  }

  .swatch.fill {
    background: #f0f0f0;
    border-style: dashed;
    border-color: #999;
  }

  .piece {
    margin-bottom: 1rem;
  }

  .piece:last-child {
    margin-bottom: 0;
  }

  .demo-fill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.25rem 0;
  }

  .demo-tile {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    border: 1.5px solid #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    position: relative;
  }

  .demo-tile.dashed {
    border-style: dashed;
    border-color: #999;
    background: #f0f0f0;
  }

  .demo-tile img,
  .demo-choice img,
  .ex-icon img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    display: block;
  }

  .demo-tile.filled img {
    width: 40px;
    height: 40px;
  }

  .blank {
    width: 42%;
    height: 42%;
    border: 1.5px dashed #bbb;
    border-radius: 4px;
  }

  .tap-ring {
    position: absolute;
    inset: -4px;
    border: 2px solid rgba(94, 143, 182, 0.7);
    border-radius: 12px;
    animation: tap-pulse 1.6s ease-out infinite;
  }

  @keyframes tap-pulse {
    0% {
      transform: scale(0.92);
      opacity: 0.9;
    }
    70% {
      transform: scale(1.12);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .demo-arrow {
    color: #99b4c8;
    font-weight: 700;
  }

  .demo-choices {
    display: flex;
    gap: 0.3rem;
  }

  .demo-choice {
    width: 48px;
    height: 48px;
    border: 1.5px solid #1a1a1a;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    opacity: 0;
    animation: choice-in 2.4s ease infinite;
  }

  .demo-choice.pop-1 {
    animation-delay: 0.2s;
  }
  .demo-choice.pop-2 {
    animation-delay: 0.45s;
  }
  .demo-choice.pop-3 {
    animation-delay: 0.7s;
  }

  .demo-choice.highlight {
    box-shadow: 0 0 0 2px rgba(94, 143, 182, 0.55);
  }

  @keyframes choice-in {
    0%,
    15% {
      opacity: 0;
      transform: translateY(6px);
    }
    30%,
    70% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0.35;
    }
  }

  .example {
    border: 1px solid var(--gist-border);
    border-radius: 12px;
    padding: 0.7rem 0.75rem;
    background: #fff;
    margin-bottom: 0.55rem;
  }

  .example-row {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .ex-icon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    min-width: 3.2rem;
  }

  .ex-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--gist-text-muted);
    text-align: center;
    line-height: 1.15;
  }

  .plus,
  .eq {
    color: #999;
    font-weight: 700;
  }

  .example-note {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
    color: var(--gist-text-muted);
  }
</style>
