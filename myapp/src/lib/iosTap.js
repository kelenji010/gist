/**
 * Reliable tap handler for iOS Safari.
 * iOS often treats the first tap as "hover" and drops the click when
 * hover styles, preloading, or synthetic mouse events are involved.
 *
 * Usage: <button type="button" {...tap(() => { ... })}>
 */
export function tap(handler) {
  let armed = false;

  return {
    ontouchend(/** @type {TouchEvent} */ e) {
      if (e.changedTouches?.length !== 1) return;
      armed = true;
      e.preventDefault();
      handler(e);
      // Allow a later click (desktop / stylus) after a short window.
      setTimeout(() => {
        armed = false;
      }, 400);
    },
    onclick(/** @type {MouseEvent} */ e) {
      if (armed) {
        e.preventDefault();
        e.stopPropagation();
        armed = false;
        return;
      }
      handler(e);
    },
  };
}
