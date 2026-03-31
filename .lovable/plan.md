

## Flicker Fix Round 4 — Midnight Ink Background + Back Button

Three files, three small changes.

### Changes

**1. `index.html`**
Add `style="background-color:#1A1A2E"` to the `<body>` tag. This eliminates the white flash before React hydrates by showing Midnight Ink instead.

**2. `src/index.css`**
Add to the base layer:
```css
#root {
  background-color: #1A1A2E;
  min-height: 100vh;
}
```

**3. `src/components/ProductHomeBackButton.tsx`**
Line 14: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`

### Why Midnight Ink
The library page (most common landing) uses a dark background. Using `#1A1A2E` as the pre-hydration default means no visible flash. Light-themed pages set their own background on mount, overriding this instantly.

### Protected patterns — untouched
All four protected ref patterns and AnimatePresence blocks remain unchanged.

