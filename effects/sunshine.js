    (function () {
  function injectStyles() {
    if (document.getElementById('sunshine-styles')) return;
    const s = document.createElement('style');
    s.id = 'sunshine-styles';
    s.textContent = `
#effect-sunshine {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  mix-blend-mode: screen;
}
#effect-sunshine-glow {
  position: absolute;
  width: 140vmax;
  height: 140vmax;
  border-radius: 50%;
  will-change: opacity, transform;
  filter: blur(var(--sunshine-blur, 90px));
}
#effect-sunshine-rays {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  overflow: hidden;
  mix-blend-mode: screen;
  filter: blur(var(--sunshine-blur, 90px));
}
#effect-sunshine-rays canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
`;
    document.head.appendChild(s);
  }

  const CORNERS = {
    'top-left':     { top: '0%',   left: '0%',   right: 'auto', bottom: 'auto', ox: 0, oy: 0 },
    'top-right':    { top: '0%',   right: '0%',  left: 'auto',  bottom: 'auto', ox: 1, oy: 0 },
    'bottom-left':  { bottom: '0%', left: '0%',  top: 'auto',   right: 'auto', ox: 0, oy: 1 },
    'bottom-right': { bottom: '0%', right: '0%', top: 'auto',   left: 'auto', ox: 1, oy: 1 },
  };

  function init() {
    const host = document.querySelector('.effect-sunshine');
    if (!host) return;
    injectStyles();

    const cornerKey  = (host.dataset.corner || 'top-right').toLowerCase();
    const corner     = CORNERS[cornerKey] || CORNERS['top-right'];
    const color      = host.dataset.color || '255,235,180';
    const minOpacity = parseFloat(host.dataset.min) || 0.15;
    const maxOpacity = parseFloat(host.dataset.max) || 0.85;
    const period     = parseFloat(host.dataset.period) || 900;
    const rays       = host.dataset.rays !== 'false';
    const blur       = host.dataset.blur || '90px';
    
    const wrap = document.createElement('div');
    wrap.id = 'effect-sunshine';
    wrap.style.setProperty('--sunshine-blur', blur);
    const glow = document.createElement('div');
    glow.id = 'effect-sunshine-glow';
    glow.style.top = corner.top;
    glow.style.left = corner.left;
    glow.style.right = corner.right;
    glow.style.bottom = corner.bottom;
    glow.style.transform = 'translate(' + (corner.ox ? '30%' : '-30%') + ',' + (corner.oy ? '30%' : '-30%') + ')';
    glow.style.background =
      'radial-gradient(circle, rgba(' + color + ',0.65) 0%, ' +
      'rgba(' + color + ',0.4) 18%, ' +
      'rgba(' + color + ',0.2) 35%, ' +
      'rgba(' + color + ',0.07) 55%, ' +
      'rgba(' + color + ',0) 75%)';
    wrap.appendChild(glow);
    document.body.appendChild(wrap);
    
    let ctx, canvas, W, H;
    if (rays) {
      const rayWrap = document.createElement('div');
      rayWrap.id = 'effect-sunshine-rays';
      rayWrap.style.setProperty('--sunshine-blur', blur);
      canvas = document.createElement('canvas');
      rayWrap.appendChild(canvas);
      document.body.appendChild(rayWrap);
      ctx = canvas.getContext('2d');
    }

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    let current = minOpacity;
    let rayAngle = 0;

    function targetOpacity() {
      const wave = (Math.sin((scrollY / period) * Math.PI * 2) + 1) / 2;
      return minOpacity + wave * (maxOpacity - minOpacity);
    }

    function drawRays(opacity) {
      ctx.clearRect(0, 0, W, H);
      const ox = corner.ox * W;
      const oy = corner.oy * H;
      const count = 7;
      const len = Math.max(W, H) * 1.4;
      rayAngle += 0.0006;
      for (let i = 0; i < count; i++) {
        const spread = 0.55;
        const base = Math.atan2(H * 0.5 - oy, W * 0.5 - ox);
        const a = base - spread + (spread * 2) * (i / (count - 1)) + Math.sin(rayAngle + i) * 0.03;
        const width = 0.05 + 0.02 * Math.sin(rayAngle * 3 + i * 1.7);
        const grad = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len);
        grad.addColorStop(0, 'rgba(' + color + ',' + (0.16 * opacity) + ')');
        grad.addColorStop(0.4, 'rgba(' + color + ',' + (0.06 * opacity) + ')');
        grad.addColorStop(1, 'rgba(' + color + ',0)');
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(a);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -width * len * 0.5);
        ctx.lineTo(len, -width * len * 1.4);
        ctx.lineTo(len, width * len * 1.4);
        ctx.lineTo(0, width * len * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function frame() {
      const target = targetOpacity();
      current += (target - current) * 0.06;

      glow.style.opacity = current.toFixed(3);
      const scale = 0.85 + (current - minOpacity) / (maxOpacity - minOpacity) * 0.3;
      glow.style.transform =
        'translate(' + (corner.ox ? '30%' : '-30%') + ',' + (corner.oy ? '30%' : '-30%') + ') scale(' + scale.toFixed(3) + ')';

      if (ctx) drawRays(current);

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
