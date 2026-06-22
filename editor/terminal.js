(function () {

  /* ── Styles ─────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('terminal-styles')) return;
    const s = document.createElement('style');
    s.id = 'terminal-styles';
    s.textContent = `
.terminal {
  display: flex;
  flex-direction: column;
  font-family: 'Consolas', 'Fira Code', 'Menlo', monospace;
  font-size: 13.5px;
  line-height: 1.65;
  background: #0d0d0d;
  color: #e2e8f0;
  border: 0.5px solid #2a2a2a;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

/* ── Header ── */
.t-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #161616;
  border-bottom: 0.5px solid #222;
  flex-shrink: 0;
}
.t-dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.t-dot-r { background: #ff5f57; }
.t-dot-y { background: #febc2e; }
.t-dot-g { background: #28c840; }
.t-title {
  margin-left: 8px;
  font-size: 12px;
  color: #4a5568;
  letter-spacing: 0.04em;
  flex: 1;
  text-align: center;
  margin-right: 30px; /* optical center past the dots */
}

/* ── Body ── */
.t-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  min-height: 120px;
}

.t-body::-webkit-scrollbar { width: 4px; }
.t-body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

/* ── Lines ── */
.t-line {
  display: flex;
  gap: 8px;
  white-space: pre-wrap;
  word-break: break-all;
}

.t-line-output { padding-left: 4px; }

/* Output types */
.t-info    { color: #e2e8f0; }
.t-success { color: #c3e88d; }
.t-error   { color: #f07178; }
.t-warn    { color: #ffcb6b; }
.t-system  { color: #4a5568; font-style: italic; }
.t-cmd     { color: #82aaff; }

/* Prompt */
.t-prompt { color: #c792ea; user-select: none; flex-shrink: 0; }

/* ── Input row (interactive mode) ── */
.t-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 14px;
  flex-shrink: 0;
}

.t-input-prompt { color: #c792ea; user-select: none; flex-shrink: 0; }

.t-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #82aaff;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  caret-color: #c792ea;
}

/* motion mode — animated caret */
.terminal-motion .t-input { caret-color: transparent; }
.terminal-motion .t-fake-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #c792ea;
  border-radius: 1px;
  vertical-align: text-bottom;
  margin-left: 1px;
  animation: t-blink 1s steps(1) infinite;
}
@keyframes t-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }

/* motion — new output lines fade in */
.terminal-motion .t-line {
  animation: t-fadeIn 0.18s ease both;
}
@keyframes t-fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
`;
    document.head.appendChild(s);
  }

  /* ── Token colours for command echo ─────────────────────────── */
  function colorizeCommand(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/^(\S+)/, '<span style="color:#c3e88d">$1</span>')          /* command */
      .replace(/ (-{1,2}[\w-]+)/g,' <span style="color:#ffcb6b">$1</span>') /* flags */
      .replace(/ ("([^"]*)")/g,' <span style="color:#f78c6c">$1</span>');    /* strings */
  }

  /* ── Build terminal ──────────────────────────────────────────── */
  function initTerminal(el) {
    if (el.dataset.termInit) return;
    el.dataset.termInit = '1';

    const isInteractive = el.classList.contains('terminal-interactive');
    const isMotion      = el.classList.contains('terminal-motion');
    const prompt        = el.dataset.prompt  || '~$';
    const title         = el.dataset.title   || 'bash';

    /* parse initial lines from innerHTML */
    const rawLines = el.innerHTML
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length);

    el.innerHTML = '';

    /* header */
    const header = document.createElement('div');
    header.className = 't-header';
    header.innerHTML = `
      <span class="t-dot t-dot-r"></span>
      <span class="t-dot t-dot-y"></span>
      <span class="t-dot t-dot-g"></span>
      <span class="t-title">${title}</span>`;
    el.appendChild(header);

    /* body */
    const body = document.createElement('div');
    body.className = 't-body';
    el.appendChild(body);

    /* ── Render a line ── */
    /*
      Line syntax for the developer:
        $ command args        → shown with prompt + blue text
        > output text         → plain output (info)
        + success message     → green
        ! error message       → red
        ? warn message        → yellow
        # system / comment    → muted italic
        (anything else)       → plain info
    */
    function parseLine(raw) {
      const first = raw[0];
      const rest  = raw.slice(1).trimStart();
      if (first === '$') return { type: 'cmd',     text: rest };
      if (first === '>') return { type: 'info',    text: rest };
      if (first === '+') return { type: 'success', text: rest };
      if (first === '!') return { type: 'error',   text: rest };
      if (first === '?') return { type: 'warn',    text: rest };
      if (first === '#') return { type: 'system',  text: rest };
      return { type: 'info', text: raw };
    }

    function appendLine(raw) {
      const { type, text } = parseLine(raw);
      const row = document.createElement('div');
      row.className = 't-line';

      if (type === 'cmd') {
        row.innerHTML = `<span class="t-prompt">${prompt}</span><span class="t-cmd">${colorizeCommand(text)}</span>`;
      } else {
        row.className += ' t-line-output';
        row.innerHTML = `<span class="t-${type}">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>`;
      }

      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }

    /* render preset lines */
    rawLines.forEach(l => appendLine(l));

    /* ── Interactive mode ── */
    if (isInteractive) {
      const inputRow = document.createElement('div');
      inputRow.className = 't-input-row';

      const inputPrompt = document.createElement('span');
      inputPrompt.className = 't-input-prompt';
      inputPrompt.textContent = prompt;

      const input = document.createElement('input');
      input.className = 't-input';
      input.type = 'text';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.placeholder = 'type a command...';

      inputRow.appendChild(inputPrompt);
      inputRow.appendChild(input);

      /* fake caret for motion mode */
      if (isMotion) {
        const fakeCaret = document.createElement('span');
        fakeCaret.className = 't-fake-caret';
        inputRow.appendChild(fakeCaret);
      }

      el.appendChild(inputRow);

      /* command history */
      const history = [];
      let histIdx   = -1;

      /* built-in commands */
      const builtins = {
        clear() { body.innerHTML = ''; },
        help()  {
          ['+ Available commands:', '> clear — clears the terminal', '> help  — shows this message'].forEach(appendLine);
        },
      };

      /* custom commands — developer sets window.TerminalCommands */
      function runCommand(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        /* echo the command */
        appendLine(`$ ${trimmed}`);

        history.unshift(trimmed);
        histIdx = -1;

        const [name, ...args] = trimmed.split(/\s+/);

        if (builtins[name]) {
          builtins[name](args);
        } else if (window.TerminalCommands && window.TerminalCommands[name]) {
          const result = window.TerminalCommands[name](args, appendLine);
          if (typeof result === 'string') appendLine(`> ${result}`);
        } else {
          appendLine(`! command not found: ${name}`);
        }
      }

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          runCommand(input.value);
          input.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          histIdx = Math.min(histIdx + 1, history.length - 1);
          input.value = history[histIdx] || '';
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          histIdx = Math.max(histIdx - 1, -1);
          input.value = histIdx === -1 ? '' : history[histIdx];
        }
      });

      /* click anywhere on terminal focuses input */
      el.addEventListener('click', () => input.focus());
    }
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.querySelectorAll('.terminal').forEach(initTerminal);
    new MutationObserver(muts => muts.forEach(m =>
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList.contains('terminal')) initTerminal(n);
        n.querySelectorAll?.('.terminal').forEach(initTerminal);
      })
    )).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();