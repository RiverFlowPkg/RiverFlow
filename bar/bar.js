(function () {

  /* ── Config ─────────────────────────────────────────────────── */
  /* Developer sets window.BarConfig before loading this script.
     Example:
       window.BarConfig = { color: '#ff6b6b' }
       window.BarConfig = { gradient: 'linear-gradient(to right, #f093fb, #f5576c)' }
       window.BarConfig = { height: 3, color: '#00c9ff' }
  */
  const cfg = window.BarConfig || {};
  const HEIGHT   = cfg.height   || 3;
  const COLOR    = cfg.color    || '#3b82f6';
  const GRADIENT = cfg.gradient || null;
  const DURATION = cfg.duration || 600; /* ms for the finish animation */

  /* ── Create bar element ─────────────────────────────────────── */
  const bar = document.createElement('div');
  bar.id = 'bar-top';
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: ${HEIGHT}px;
    background: ${GRADIENT || COLOR};
    z-index: 99999;
    transition: width 0.1s linear;
    pointer-events: none;
    border-radius: 0 ${HEIGHT}px ${HEIGHT}px 0;
  `;

  /* subtle glow under the bar */
  bar.style.boxShadow = GRADIENT
    ? `0 0 8px 1px rgba(255,255,255,0.25)`
    : `0 0 8px 1px ${COLOR}88`;

  document.documentElement.appendChild(bar);

  /* ── Animation ──────────────────────────────────────────────── */
  let current  = 0;
  let rafId    = null;
  let finished = false;

  /* Eased trickle — moves fast at first, then slows as it
     approaches 90%, never quite reaching it until finish() */
  function trickle() {
    if (finished) return;
    const remaining = 90 - current;
    const step = remaining * 0.08 + 0.4;
    current = Math.min(current + step, 90);
    bar.style.width = current + '%';
    rafId = setTimeout(trickle, 120 + Math.random() * 80);
  }

  function start() {
    current  = 0;
    finished = false;
    bar.style.transition = 'width 0.1s linear';
    bar.style.opacity    = '1';
    bar.style.width      = '0%';
    trickle();
  }

  function finish() {
    finished = true;
    clearTimeout(rafId);
    /* snap to 100% */
    bar.style.transition = `width ${DURATION * 0.4}ms ease`;
    bar.style.width      = '100%';
    /* then fade out */
    setTimeout(() => {
      bar.style.transition = `opacity ${DURATION * 0.6}ms ease`;
      bar.style.opacity    = '0';
      setTimeout(() => {
        bar.style.width = '0%';
        bar.style.opacity = '1';
      }, DURATION * 0.7);
    }, DURATION * 0.4);
  }

  /* ── Hook into page load ────────────────────────────────────── */
  start();

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish, { once: true });
  }

})();