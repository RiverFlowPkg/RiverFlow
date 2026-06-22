(function () {

  /* ── highlight.js does all the tokenising ───────────────────── */
  /* Loaded from CDN once, then used for every editor on the page. */

  let hlReady = false;
  let hlQueue = [];

  function loadHL(cb) {
    if (hlReady) { cb(); return; }
    hlQueue.push(cb);
    if (document.getElementById('hl-script')) return;
    const s = document.createElement('script');
    s.id = 'hl-script';
    s.src = '../editor/highlight.min.js';
    s.onload = () => { hlReady = true; hlQueue.forEach(fn => fn()); hlQueue = []; };
    document.head.appendChild(s);
  }

  /* Map hljs token classes → our e-* classes for theming + glow */
  const CLASS_MAP = {
    'hljs-keyword':        'e-kw',
    'hljs-built_in':       'e-fn',
    'hljs-string':         'e-str',
    'hljs-number':         'e-num',
    'hljs-comment':        'e-cmt',
    'hljs-tag':            'e-tag',
    'hljs-attr':           'e-attr',
    'hljs-attribute':      'e-attr',
    'hljs-value':          'e-val',
    'hljs-punctuation':    'e-punc',
    'hljs-selector-class': 'e-cls',
    'hljs-selector-id':    'e-cls',
    'hljs-selector-tag':   'e-sel',
    'hljs-property':       'e-prop',
    'hljs-title':          'e-fn',
    'hljs-name':           'e-tag',
    'hljs-literal':        'e-num',
    'hljs-type':           'e-kw',
    'hljs-symbol':         'e-str',
    'hljs-meta':           'e-cmt',
    'hljs-operator':       'e-punc',
    'hljs-variable':       'e-str',
    'hljs-params':         'e-num',
    'hljs-class':          'e-fn',
    'hljs-function':       'e-fn',
  };

  function remapClasses(html) {
    return html.replace(/class="([^"]+)"/g, (_, cls) => {
      const mapped = cls.trim().split(/\s+/).map(c => CLASS_MAP[c] || c).join(' ');
      return `class="${mapped}"`;
    });
  }

  function highlight(text, lang) {
    try {
      const result = lang && window.hljs.getLanguage(lang)
        ? window.hljs.highlight(text, { language: lang, ignoreIllegals: true })
        : window.hljs.highlightAuto(text);
      return remapClasses(result.value);
    } catch (_) {
      return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  }

  /* ── Utilities ──────────────────────────────────────────────── */
  function buildLineNums(n) {
    let s = '';
    for (let i = 1; i <= n; i++) s += `<span>${i}</span>`;
    return s;
  }

  function saveCaret(root) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const r = sel.getRangeAt(0).cloneRange();
    r.selectNodeContents(root);
    r.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
    return r.toString().length;
  }

  function restoreCaret(root, offset) {
    if (offset == null) return;
    const sel = window.getSelection();
    if (!sel) return;
    const r = document.createRange();
    let count = 0, found = false;
    function walk(n) {
      if (found) return;
      if (n.nodeType === 3) {
        if (count + n.length >= offset) { r.setStart(n, offset - count); r.collapse(true); found = true; }
        else count += n.length;
      } else n.childNodes.forEach(walk);
    }
    walk(root);
    if (found) { sel.removeAllRanges(); sel.addRange(r); }
  }

  function placeFakeCursor(root, cursor) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const r = sel.getRangeAt(0).cloneRange();
    r.collapse(true);
    const rect = r.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    if (!rect.height) return;
    cursor.style.left   = (rect.left - rootRect.left + root.scrollLeft) + 'px';
    cursor.style.top    = (rect.top  - rootRect.top  + root.scrollTop)  + 'px';
    cursor.style.height = rect.height + 'px';
  }

  /* ── Main initialiser ───────────────────────────────────────── */
  function initEditor(el) {
    if (el.dataset.editorInit) return;
    el.dataset.editorInit = '1';

    const rawText  = el.textContent.trim();
    const lang     = el.dataset.lang || null; /* null = auto-detect */
    const isRead   = el.classList.contains('editor-read');
    const hasNums  = el.classList.contains('editor-number');
    const isMotion = el.classList.contains('editor-motion');

    el.innerHTML = '';
    el.style.cssText = 'display:flex;flex-direction:column;border-radius:10px;overflow:hidden;position:relative;';

    /* header */
    const header = document.createElement('div');
    header.className = 'e-header';
    const langLabel = document.createElement('span');
    langLabel.className = 'e-lang';
    langLabel.textContent = lang ? lang.toUpperCase() : '...';
    header.innerHTML = `<span class="e-dot e-dot-r"></span><span class="e-dot e-dot-y"></span><span class="e-dot e-dot-g"></span>`;
    header.appendChild(langLabel);
    el.appendChild(header);

    /* body */
    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex:1;overflow:auto;';

    const nums = document.createElement('div');
    nums.className = 'e-nums';
    if (!hasNums) nums.style.display = 'none';

    const code = document.createElement('div');
    code.className = 'e-code' + (isMotion ? ' e-motion' : '');
    code.contentEditable = isRead ? 'false' : 'true';
    code.spellcheck = false;
    code.setAttribute('autocorrect', 'off');
    code.setAttribute('autocapitalize', 'off');

    body.appendChild(nums);
    body.appendChild(code);
    el.appendChild(body);

    if (isRead) {
      const b = document.createElement('div');
      b.className = 'e-badge e-badge-read';
      b.textContent = 'read-only';
      el.appendChild(b);
    }

    /* fake cursor for motion mode */
    let fakeCursor = null;
    if (isMotion && !isRead) {
      fakeCursor = document.createElement('span');
      fakeCursor.className = 'e-fake-cursor';
    }

    /* render */
    let prevText = rawText;
    let detectedLang = lang;

    function render(text, newCharOffset) {
      const offset = saveCaret(code);
      const html = highlight(text, detectedLang);

      /* update auto-detected lang label */
      if (!lang && window.hljs) {
        try {
          const r = window.hljs.highlightAuto(text);
          if (r.language) {
            detectedLang = r.language;
            langLabel.textContent = r.language.toUpperCase();
          }
        } catch (_) {}
      }

      if (isMotion && newCharOffset != null) {
        const before = highlight(text.slice(0, newCharOffset), detectedLang);
        const delta  = highlight(text.slice(newCharOffset), detectedLang);
        code.innerHTML = before + `<span class="e-new">${delta}</span>`;
      } else {
        code.innerHTML = html;
      }

      nums.innerHTML = buildLineNums(text.split('\n').length);
      if (!isRead) restoreCaret(code, offset);
      if (fakeCursor && document.activeElement === code) placeFakeCursor(code, fakeCursor);
    }

    /* wait for hljs then do first render */
    loadHL(() => render(rawText));

    /* input */
    let busy = false;
    code.addEventListener('input', () => {
      if (busy) return;
      busy = true;
      const cur = code.innerText || '';
      let diffAt = 0;
      while (diffAt < prevText.length && diffAt < cur.length && prevText[diffAt] === cur[diffAt]) diffAt++;
      const added = cur.length > prevText.length;
      render(cur, isMotion && added ? diffAt : null);
      prevText = cur;
      busy = false;
    });

    /* fake cursor events */
    if (fakeCursor) {
      code.addEventListener('focus',  () => { code.appendChild(fakeCursor); placeFakeCursor(code, fakeCursor); });
      code.addEventListener('blur',   () => fakeCursor.remove());
      code.addEventListener('keyup',  () => placeFakeCursor(code, fakeCursor));
      code.addEventListener('mouseup',() => placeFakeCursor(code, fakeCursor));
      code.addEventListener('click',  () => placeFakeCursor(code, fakeCursor));
    }
  }

  /* ── Styles ─────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('editor-styles')) return;
    const s = document.createElement('style');
    s.id = 'editor-styles';
    s.textContent = `
.editor{display:flex;flex-direction:column;font-family:monospace;font-size:13.5px;line-height:1.65;position:relative;}
.editor-dark{background:#1a1a2e;color:#e2e8f0;border:0.5px solid #333;}
.editor-light{background:#f8f8fc;color:#2d2d45;border:0.5px solid #ddd;}

.e-header{display:flex;align-items:center;gap:8px;padding:8px 14px;}
.editor-dark .e-header{border-bottom:0.5px solid rgba(255,255,255,0.07);}
.editor-light .e-header{border-bottom:0.5px solid rgba(0,0,0,0.08);}
.e-dot{width:11px;height:11px;border-radius:50%;display:inline-block;}
.e-dot-r{background:#ff5f57}.e-dot-y{background:#febc2e}.e-dot-g{background:#28c840}
.e-lang{margin-left:auto;font-size:11px;opacity:0.4;letter-spacing:0.04em;}

.e-nums{padding:12px 0;min-width:40px;text-align:right;user-select:none;font-size:12px;line-height:1.65;flex-shrink:0;}
.editor-dark .e-nums{color:#e2e8f0;opacity:0.3;}
.editor-light .e-nums{color:#2d2d45;opacity:0.3;}
.e-nums span{display:block;padding:0 10px 0 6px;}

.e-code{flex:1;padding:12px 16px;outline:none;white-space:pre;overflow-x:auto;caret-color:#7c85ff;}
.e-code[contenteditable="false"]{cursor:default;}
.e-motion{caret-color:transparent;position:relative;}

.e-fake-cursor{position:absolute;width:2px;pointer-events:none;background:#7c85ff;border-radius:1px;animation:e-blink 1s steps(1) infinite;z-index:10;}
@keyframes e-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.e-new{animation:e-fadeIn 0.22s ease both;}
@keyframes e-fadeIn{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}

.e-badge{position:absolute;top:8px;right:50px;font-size:10px;padding:2px 7px;border-radius:4px;letter-spacing:0.05em;pointer-events:none;}
.e-badge-read{background:rgba(255,150,50,0.12);color:#f78c6c;}

/* Dark tokens */
.editor-dark .e-kw{color:#c792ea}.editor-dark .e-fn{color:#82aaff}
.editor-dark .e-str{color:#c3e88d}.editor-dark .e-num{color:#f78c6c}
.editor-dark .e-cmt{color:#546e7a;font-style:italic}
.editor-dark .e-tag{color:#f07178}.editor-dark .e-attr{color:#ffcb6b}
.editor-dark .e-val{color:#c3e88d}.editor-dark .e-punc{color:#89ddff}
.editor-dark .e-cls{color:#ffcb6b}.editor-dark .e-sel{color:#82aaff}
.editor-dark .e-prop{color:#c792ea}.editor-dark .e-unit{color:#f78c6c}

/* Light tokens */
.editor-light .e-kw{color:#7c3aed}.editor-light .e-fn{color:#1d4ed8}
.editor-light .e-str{color:#15803d}.editor-light .e-num{color:#c2410c}
.editor-light .e-cmt{color:#94a3b8;font-style:italic}
.editor-light .e-tag{color:#b91c1c}.editor-light .e-attr{color:#b45309}
.editor-light .e-val{color:#15803d}.editor-light .e-punc{color:#0369a1}
.editor-light .e-cls{color:#b45309}.editor-light .e-sel{color:#1d4ed8}
.editor-light .e-prop{color:#7c3aed}.editor-light .e-unit{color:#c2410c}

/* Glow */
.editor-glow.editor-dark .e-kw{text-shadow:0 0 8px #c792ea88}
.editor-glow.editor-dark .e-fn{text-shadow:0 0 8px #82aaff88}
.editor-glow.editor-dark .e-str{text-shadow:0 0 8px #c3e88d88}
.editor-glow.editor-dark .e-num{text-shadow:0 0 8px #f78c6c88}
.editor-glow.editor-dark .e-tag{text-shadow:0 0 8px #f0717888}
.editor-glow.editor-dark .e-attr{text-shadow:0 0 8px #ffcb6b88}
.editor-glow.editor-dark .e-punc{text-shadow:0 0 8px #89ddff88}
.editor-glow.editor-dark .e-prop{text-shadow:0 0 8px #c792ea88}
.editor-glow.editor-light .e-kw{text-shadow:0 0 6px #7c3aed55}
.editor-glow.editor-light .e-fn{text-shadow:0 0 6px #1d4ed855}
.editor-glow.editor-light .e-str{text-shadow:0 0 6px #15803d55}
.editor-glow.editor-light .e-tag{text-shadow:0 0 6px #b91c1c55}
`;
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('.editor').forEach(initEditor);
    new MutationObserver(muts => muts.forEach(m =>
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList.contains('editor')) initEditor(n);
        n.querySelectorAll?.('.editor').forEach(initEditor);
      })
    )).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();