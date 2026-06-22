(function () {

  function injectStyles() {
    if (document.getElementById('typing-styles')) return;
    const s = document.createElement('style');
    s.id = 'typing-styles';
    s.textContent = `
/* cursor */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  border-radius: 1px;
  margin-left: 2px;
  vertical-align: text-bottom;
}

/* default cursor — hard blink */
.typing .typing-cursor {
  animation: cur-blink 1s steps(1) infinite;
}
@keyframes cur-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* smooth cursor — fade blink */
.typing-smooth .typing-cursor {
  animation: cur-fade 1s ease-in-out infinite;
}
@keyframes cur-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* smooth char fade-in */
.typing-smooth .typing-char {
  display: inline-block;
  animation: char-fade 0.12s ease both;
}
@keyframes char-fade {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
    document.head.appendChild(s);
  }

  function initTyping(el) {
    if (el.dataset.typingInit) return;
    el.dataset.typingInit = '1';

    const fullText  = el.textContent.trim();
    const isSmooth  = el.classList.contains('typing-smooth');
    const speed     = parseInt(el.dataset.speed) || 50;   /* ms per character */
    const delay     = parseInt(el.dataset.delay) || 0;    /* ms before starting */

    el.textContent = '';

    /* cursor element */
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);

    let i = 0;

    function typeNext() {
      if (i >= fullText.length) return; /* done — cursor stays */

      const ch = fullText[i];
      i++;

      if (isSmooth) {
        const span = document.createElement('span');
        span.className = 'typing-char';
        span.textContent = ch;
        el.insertBefore(span, cursor);
      } else {
        const text = document.createTextNode(ch);
        el.insertBefore(text, cursor);
      }

      setTimeout(typeNext, speed);
    }

    setTimeout(typeNext, delay);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('.typing').forEach(initTyping);
    new MutationObserver(muts => muts.forEach(m =>
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList.contains('typing')) initTyping(n);
        n.querySelectorAll?.('.typing').forEach(initTyping);
      })
    )).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();