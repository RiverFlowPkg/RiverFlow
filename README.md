# riverflow

Drop-in vanilla JS browser widgets — no build step, no bundler. Grab a script,
drop it in a `<script>` tag, and it wires itself up.

## Install

```
npm install @riverflowpkg/riverflow@1.0.9
```

## Linking

UNPKG
```
https://unpkg.com/@riverflowpkg/riverflow@1.0.9/all.min.js
```

JSDelivr
```
https://cdn.jsdelivr.net/npm/@riverflowpkg/riverflow/all.min.js
```

Files live in `node_modules/riverflow/`. Copy the ones you need into your
public/static folder, or reference them directly.

## Widgets

### Top loading bar (`bar/bar.js`)
```html
<script>window.BarConfig = { color: '#00c9ff' };</script>
<script src="bar/bar.js"></script>
```
Optional config: `color`, `gradient`, `height`, `duration`.

### Smooth scroll (`scroll/scroll.js`)
```html
<body scroll-speed="0.6">
<script src="scroll/scroll.js"></script>
```

### Typing effect (`effects/typing.js`)
```html
<div class="typing">Hello world</div>
<script src="effects/typing.js"></script>
```

### Underwater overlay (`effects/underwater.js`)
```html
<div class="effect-underwater"></div>
<script src="effects/underwater.js"></script>
```

### Sunshine overlay (`effects/sunshine.js`)
```html
<div class="effect-sunshine"></div>
<script src="effects/sunshine.js"></script>
```

### Code editor (`editor/editor.js`)
Syntax-highlighted code editor built on highlight.js (bundled as
`editor/highlight.min.js`).
```html
<div class="editor editor-dark editor-number">
  const hello = () => "world";
</div>
<script src="editor/editor.js"></script>
```

### Toast Message (`toast/toast.js`)
Toast message with different Themes, Modes, and animations.
```html
<script src="toast/toast.js"></script>
<script>
toast("Hello world!");
</script>
```

## License

MIT
