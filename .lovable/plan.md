

## Brighten Library Tiles — Per-Product Colored Glow

The tiles feel heavy due to three compounding dark layers: a strong black scrim, black-only box shadows, and heavy text shadows. Here's the fix.

### Changes (all in `src/components/ProductLibrary.tsx`)

**1. Reduce bottom scrim opacity** (lines 364-372)
- Change from `rgba(0,0,0,0.55)` / `rgba(0,0,0,0.25)` to `rgba(0,0,0,0.35)` / `rgba(0,0,0,0.12)`
- Keeps text readable but lets the saturated tile color shine through

**2. Add per-tile colored glow to boxShadow** (lines 282-285)
- Use each tile's own `bg` color (which is already the product accent — teal for Jag i Mig, pink for Jag med Andra, mint for Vardag, etc.) via the existing `hexToRgba(bg, 0.20)` helper
- New shadow: `0 4px 28px ${hexToRgba(bg, 0.20)}, 0 2px 8px rgba(0,0,0,0.08)`
- Every tile radiates its own accent color — no shared/hardcoded color

**3. Soften text shadows** (lines 396, 411)
- Title: reduce from `0.9/0.7/0.5/0.3` to `0.5/0.3` (two layers instead of four)
- Tagline: same reduction — still readable, no longer a dark blanket

### What stays untouched
- All tile colors, illustrations, positions, sizes, heights
- Page background (`#0B1026`)
- All existing components, hooks, contexts, routes
- No new files or dependencies

### Result
Each tile emits its own colored glow against the dark background — teal for Jag i Mig, pink for Jag med Andra, mint for Vardag, purple for Syskon, coral for Närhet & Intimitet, lime for Jag i Världen. The reduced scrim and softer text shadows let the saturated backgrounds breathe.

