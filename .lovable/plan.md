

## Kill Cream Flash — Override CSS Variable Defaults

**File:** `src/index.css` — 4 targeted line changes

### Change 1: Line 47
```css
/* FROM */ --background: var(--neutral-50);
/* TO   */ --background: 233 47% 7%;
```

### Change 2: Line 93
```css
/* FROM */ --surface-warm: var(--neutral-50);
/* TO   */ --surface-warm: 233 47% 7%;
```

### Change 3: Line 175
```css
/* FROM */ --surface-base: hsl(var(--neutral-50));
/* TO   */ --surface-base: #0B1026;
```

### Change 4: Lines 187–188
```css
/* FROM */
--color-bg: var(--surface-base);
--color-bg-base: var(--surface-base);
/* TO */
--color-bg: #0B1026;
--color-bg-base: #0B1026;
```

### Not changed
- `--neutral-50/100/200/300` definitions (still available for explicit cream references)
- `body` / `#root` rules, `--page-bg`
- Component styles, other files

