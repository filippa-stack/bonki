

## Fix: Cream Flash on Page Reload

**File:** `src/index.css` only

### Change 1 — Body background (line 246-250)

Replace:
```css
body {
  @apply bg-background text-foreground font-sans;
  font-family: var(--font-body);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: var(--surface-base, hsl(46, 64%, 89%));
```

With:
```css
body {
  @apply text-foreground font-sans;
  font-family: var(--font-body);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: #0B1026;
```

Removes `bg-background` (resolves to cream) and changes explicit background from cream-fallback to dark.

### Change 2 — `#root` fallback inside `@layer base` (line 259)

Change:
```css
background-color: var(--surface-base, hsl(46, 64%, 89%));
```
To:
```css
background-color: var(--surface-base, #0B1026);
```

### Change 3 — `--page-bg` default in `:root` (line 228)

Change:
```css
--page-bg: var(--color-bg);
```
To:
```css
--page-bg: #0B1026;
```

This sets the initial default to dark. React's `useThemeVars` hook will override `--page-bg` at runtime to the correct product/page color once mounted — so light-themed pages still work, but the pre-React flash is dark.

### Not changed
- `:root` CSS variables (neutrals, background, etc.)
- `#root` rule on line 6
- Component styles, theme hooks, protected patterns

