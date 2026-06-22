(function () {
  function injectStyles() {
    if (document.getElementById('underwater-styles')) return;
    const s = document.createElement('style');
    s.id = 'underwater-styles';
    s.textContent = `
#effect-underwater {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: linear-gradient(180deg,
    rgba(0,60,120,0.38) 0%,
    rgba(0,100,160,0.22) 50%,
    rgba(0,40,80,0.42) 100%);
}
#effect-underwater-caustics {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  overflow: hidden;
}
#effect-underwater-caustics canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.13;
}
#effect-underwater-blur {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  backdrop-filter: blur(0.6px) saturate(1.3);
  -webkit-backdrop-filter: blur(0.6px) saturate(1.3);
}
`;
    document.head.appendChild(s);
  }

  function init() {
    if (!document.querySelector('.effect-underwater')) return;
    injectStyles();

    const overlay = document.createElement('div');
    overlay.id = 'effect-underwater';
    document.body.appendChild(overlay);

    const blurLayer = document.createElement('div');
    blurLayer.id = 'effect-underwater-blur';
    document.body.appendChild(blurLayer);

    const causticWrap = document.createElement('div');
    causticWrap.id = 'effect-underwater-caustics';
    const canvas = document.createElement('canvas');
    causticWrap.appendChild(canvas);
    document.body.appendChild(causticWrap);

    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 10 }, () => ({
      x: Math.random() * 1.2 - 0.1, y: Math.random() * 1.2 - 0.1,
      vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006,
      r: 0.12 + Math.random() * 0.2,
    }));

    let scrollOffset = 0;
    window.addEventListener('scroll', () => { scrollOffset = window.scrollY; }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const shift = scrollOffset * 0.3;
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -0.2 || n.x > 1.2) n.vx *= -1;
        if (n.y < -0.2 || n.y > 1.2) n.vy *= -1;
        const cx = n.x * W, cy = n.y * H - shift;
        const rx = n.r * W, ry = n.r * H * 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0,   'rgba(100,200,255,0.55)');
        grad.addColorStop(0.4, 'rgba(60,160,220,0.2)');
        grad.addColorStop(1,   'rgba(0,80,160,0)');
        ctx.save();
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }

    /* SVG wave distortion */
    const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFilter.style.cssText = 'position:fixed;width:0;height:0;';
    svgFilter.innerHTML = `<defs><filter id="underwater-wave">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="5" result="noise">
        <animate attributeName="baseFrequency" values="0.012 0.018;0.014 0.020;0.012 0.018" dur="8s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>`;
    document.body.appendChild(svgFilter);
    overlay.style.filter = 'url(#underwater-wave)';

    requestAnimationFrame(draw);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();