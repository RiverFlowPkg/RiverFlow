# Riverflow

Lightweight, zero-dependency JS modules for the web. Drop a file in, add a class or a script tag — done. No build step, no npm, no framework.

---

## Modules

| Module | File | What it does |
|---|---|---|
| Loading Bar | `bar/bar.js` | Slim progress bar across the top on page load |
| Code Editor | `editor/editor.js` | Syntax-highlighted code editor, 190+ languages |
| Terminal | `editor/terminal.js` | Terminal emulator — log mode or interactive shell |
| Typing Effect | `effects/typing.js` | Typewriter animation for any text element |
| Underwater | `effects/underwater.js` | Full-page underwater atmosphere effect |
| Smooth Scroll | `scroll/scroll.js` | Inertia-based smooth scrolling |

---

## File Structure

```
project/
├── bar/
│   └── bar.js
├── editor/
│   ├── editor.js
│   ├── terminal.js
│   └── highlight.min.js
├── effects/
│   ├── underwater.js
│   └── typing.js
├── scroll/
│   ├── scroll.js
│   └── scroll.css
├── docs/
│   └── index.html
└── index.html
```

---

## bar.js

A slim progress bar that trickles across the top of the page during load, snaps to 100% when ready, then fades out.

```html
<!-- default: solid blue, 3px -->
<script src="bar/bar.js"></script>

<!-- custom color -->
<script>
  window.BarConfig = { color: '#f43f5e' }
</script>
<script src="bar/bar.js"></script>

<!-- gradient -->
<script>
  window.BarConfig = {
    gradient: 'linear-gradient(to right, #f093fb, #f5576c, #4facfe)'
  }
</script>
<script src="bar/bar.js"></script>
```
