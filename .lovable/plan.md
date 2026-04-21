

## Fix KontoSheet readability

The text in the sheet is washing out because of three issues — not the color tokens themselves (Header.tsx uses the same tokens and reads fine).

### Root causes

1. **Title "Konto"** uses `font-serif` at weight 500 — the serif renders too thin at 18px on cream.
2. **Email row** stacks `opacity: 0.7` on top of `--color-text-secondary` (already a muted Driftwood `#6B5E52`), pushing it near-invisible.
3. **"Integritetspolicy" button** has no font class, so it inherits the surrounding serif and renders thin.

### Changes — `src/components/KontoSheet.tsx` only

- **Title "Konto"**: bump `fontWeight` from `500` → `600`. Keep `font-serif`, keep size 18px, keep color.
- **Email row**: remove `opacity: 0.7`. Color stays `var(--color-text-secondary)` (already the appropriate muted tone — no further dimming needed).
- **Integritetspolicy button**: add `className="font-sans"` and `fontWeight: 500`. Color stays `var(--color-text-primary)`.
- **Logga ut button**: add `className="font-sans"` and `fontWeight: 500` for consistency with the Integritetspolicy row (color `#8B3A3A` already reads).
- **Radera konto button**: add `className="font-sans"` and `fontWeight: 500`. Keeps `opacity: 0.4` so it still reads as disabled.

No changes to backdrop, layout, padding, dividers, sheet container, navigation behavior, or any other file. KontoIcon, Header.tsx, and the four host pages stay untouched.

### Result

Title sits with proper weight; email reads at full secondary-token tone instead of being doubly-faded; menu items render in the same crisp sans the rest of the app uses, matching the visual weight of "Logga ut" in the screenshot — which is the only line that currently reads.

### Note on faster iteration

Quick visual changes like font weight, opacity, and color on a static element can be done for free using **Visual Edits** (the Edit button at the bottom-left of the chat) — select the element on the canvas and tweak directly without spending a prompt.

