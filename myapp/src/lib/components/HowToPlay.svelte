<script>
  /**
   * How to Play — shared directions with demos.
   * Link/rebus examples use non-puzzle art from /howto/.
   */
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
</script>

<div class="howto">
  <div class="howto-top">
    <h2>How to Play</h2>
    {#if onClose}
      <button type="button" class="close" aria-label="Close" onclick={onClose}>×</button>
    {/if}
  </div>

  <section class="step">
    <h3>What’s on every board</h3>
    <p>
      Each week has <strong>2 fill-ins</strong>, <strong>2 rebuses</strong>, and
      <strong>2 links</strong>.
    </p>
    <ul class="board-facts">
      <li><strong>Fill-ins</strong> — dashed tiles you complete by picking an icon.</li>
      <li>
        <strong>Rebuses</strong> — sounds stack into a new word. One rebus result always sits
        in the <strong>top strip</strong>; the other rebus is found on the puzzle board.
      </li>
      <li><strong>Links</strong> — three icons that belong to the same idea or category.</li>
    </ul>
  </section>

  <section class="step">
    <h3>1. Fill the blanks</h3>
    <p>There are always 2 fill-ins. Tap a dashed tile and pick an icon. Tap again to change it.</p>
    <div class="demo demo-fill" aria-hidden="true">
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
  </section>

  <section class="step">
    <h3>2. Combine three</h3>
    <p>
      Swipe <strong>orthogonally</strong> (up, down, left, or right — edges only, no diagonals)
      across 3 icons that form a <strong>link</strong> or a <strong>rebus</strong>.
    </p>

    <div class="ortho" aria-hidden="true">
      <p class="caption">Orthogonal moves</p>
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
      <p class="caption muted">Corners of the board are fine — just stay on shared edges.</p>
    </div>

    <div class="examples">
      <div class="example">
        <p class="caption">Link</p>
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
        <p class="example-note">Icons that belong to one idea or category.</p>
      </div>

      <div class="example">
        <p class="caption">Rebus</p>
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
        <p class="example-note">Sounds stack into a new word (car + tea + gun → cardigan).</p>
      </div>
    </div>
  </section>

  <section class="step">
    <h3>3. One play per week</h3>
    <p>Finish to earn a collectible and climb the weekly scoreboard. Points come from speed and lives left.</p>
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

  p {
    margin: 0 0 0.75rem;
    font-size: 0.88rem;
    line-height: 1.45;
    color: var(--gist-text-muted);
  }

  .board-facts {
    margin: 0;
    padding: 0 0 0 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: 0.88rem;
    line-height: 1.45;
    color: var(--gist-text-muted);
  }

  .board-facts strong {
    color: var(--gist-text);
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
    margin-top: 0.4rem;
    margin-bottom: 0;
  }

  .demo-fill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5rem 0 0.25rem;
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

  .examples {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .example {
    border: 1px solid var(--gist-border);
    border-radius: 12px;
    padding: 0.7rem 0.75rem;
    background: #fff;
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
  }
</style>
