# riverflow.

Drop-in vanilla JS browser widgets — no build step, no bundler. Grab a script,
drop it in a `<script>` tag, and it wires itself up.

## Install

```
npm install @riverflowpkg/riverflow
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

### Code editor (`editor/editor.js`)
Syntax-highlighted code editor built on highlight.js (bundled as
`editor/highlight.min.js`).
```html
<script src="editor/editor.js"></script>
```

## License

MIT
