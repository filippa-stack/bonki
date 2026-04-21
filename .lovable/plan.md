

## Prompt 3.1 (remaining) — Paywall link discoverability + "29 års" copy fix

Changes 1 and 2 already live in `BuyPage.tsx` (verified — lines 219–224 and 390). This plan covers only the unbuilt work.

### Files touched

- `src/components/ProductPaywall.tsx` — two button restyles (Still Us bottom-sheet variant + kids full-screen variant).
- `src/pages/Paywall.tsx` — one button restyle + add `LANTERN_GLOW` import.
- `src/pages/PaywallFullScreen.tsx` — one button restyle + copy fix.
- `src/components/PaywallBottomSheet.tsx` — copy fix.
- `src/components/ProductIntro.tsx` — copy fix.
- `src/pages/BuyPage.tsx` — copy fix.

No backend, no routes, no edge functions.

### Change 3 — "Utforska andra produkter" link visibility

Verified via grep: exactly 4 occurrences. All four currently use `color: DRIFTWOOD`, `fontWeight: 400`, no underline — they read as ambient grey, not as a tap target. Apply identical restyle to each:

| Property | From | To |
|---|---|---|
| `color` | `DRIFTWOOD` | `LANTERN_GLOW` |
| `opacity` | (none) | `0.75` |
| `fontWeight` | `400` | `500` |
| `textDecoration` | (none) | `'underline'` |
| `textUnderlineOffset` | (none) | `'3px'` |

All other style properties (`background`, `border`, `cursor`, `fontFamily`, `fontSize`, `textAlign`, `marginTop`, `padding`) preserved unchanged.

For `Paywall.tsx`: add `import { LANTERN_GLOW } from '@/lib/palette';`. Background is `COLORS.emberNight` (`#0A1628`) — `LANTERN_GLOW` at 0.75 reads cleanly. The other three files already import `LANTERN_GLOW`.

The orange "Lås upp" CTA stays unchanged — must remain visually dominant.

### Change 4 — Copy fix "25 års" → "29 års"

Verified via grep: exactly 4 occurrences of `25 års klinisk`. Replace `25 års` with `29 års` in:

- `src/components/PaywallBottomSheet.tsx`
- `src/components/ProductIntro.tsx`
- `src/pages/BuyPage.tsx`
- `src/pages/PaywallFullScreen.tsx`

Preserve each file's existing `Utvecklat`/`Utvecklad` form — don't normalize. Pure text edit.

### What is NOT touched

- `TermsConsent.tsx` — unchanged; other callers (Login) unaffected.
- `PaywallBottomSheet.tsx` "Tillbaka" button — correct for a modal dismiss.
- Orange "Lås upp" CTA on every paywall — dominant CTA, stays loud.
- `ClaimPage.tsx`, `App.tsx`, edge functions, regression guards.
- Changes 1 + 2 — already live in source.

### Verify after deploy

1. **Link findability** — visit `/unlock` (Vårt Vi unlock surface), `/paywall-full?product=jag_i_mig`, the in-app paywall on a locked Still Us session, and the kids full-screen paywall. The "Utforska andra produkter" link should now read clearly as a cream, underlined link without competing with the orange CTA.
2. **Copy fix** — open `/buy?product=jag_i_mig` (incognito), kids ProductIntro, the bottom-sheet paywall, `/paywall-full?product=X`. Each should read **"29 års klinisk erfarenhet"**.
3. **Regression** — orange "Lås upp" CTAs visually unchanged. "Tillbaka" button on the bottom-sheet paywall unchanged.

### Rollback

Two pure-text edits + four isolated style-object edits across six files. Each change revertible independently.

