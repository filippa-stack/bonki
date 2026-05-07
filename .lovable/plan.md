## Fix 3 — Remove body-level safe-area padding

**`src/index.css`** — in the `body` rule, remove only this line:
```css
padding-bottom: env(safe-area-inset-bottom, 0px);
```
All other body styles preserved.

## Fix 6 — Shared bottom-nav clearance tokens

**`src/index.css`** — inside the existing `:root` block under `@layer base`, add:

```css
--bottom-nav-clearance: calc(56px + env(safe-area-inset-bottom, 0px));
--bottom-nav-clearance-loose: calc(72px + env(safe-area-inset-bottom, 0px));
```

**Find/replace by exact content** across `src/pages/Journal.tsx`, `src/pages/Diary.tsx`, `src/pages/ProductHome.tsx`, `src/pages/CardView.tsx`:

1. `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` → `paddingBottom: 'var(--bottom-nav-clearance-loose)'`
2. `paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))'` → `paddingBottom: 'var(--bottom-nav-clearance)'`
3. `height: 'calc(72px + env(safe-area-inset-bottom, 0px))'` → `height: 'var(--bottom-nav-clearance-loose)'`

**Untouched (won't match find targets):**
- `calc(80px + env(...))` in CardView
- `calc(140px + env(...))` in CardView
- `calc(56px + max(env(...), 16px))` in KontoSheet

## Verification

- Library, Journal, Diary, ProductHome, CardView visually identical (minus the previously-doubled body padding gap).
- After edit, `grep "calc(80px"` and `grep "calc(140px"` in `src/pages/CardView.tsx` should still return matches (canary).
- KontoSheet `max()` floor preserved.
