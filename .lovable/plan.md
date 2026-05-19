# Vårt Vi tile redesign — remove medallion, add lifted shadow (finalized)

Two changes across four surfaces. Shadow values, Surface 4 semantics, `getCircleColor` cleanup, and Surface 3 `objectPosition` confirmed.

## Shadow translation

Web equivalent of the iOS/Android shadow specs, applied only to the illustration `<img>` (transparent PNG → `filter: drop-shadow` follows the alpha shape):

- Surfaces 1, 2, 3 (full-size): `filter: drop-shadow(0 8px 10px rgba(0,0,0,0.35))`
- Surface 4 (56×56 resume): `filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35))`

## Surface 1 — `src/components/AdultProductCardTile.tsx`

In Zone A (`flex: 0 0 65%`):
- Delete the medallion `<div>` (78% wide, `borderRadius: 50%`, `backgroundColor: getCircleColor(...)`, hairline border).
- Render `<img>` directly inside Zone A.
- Image: `width: 66%`, `height: auto`, `objectFit: contain`, `objectPosition: center`, plus full-size drop-shadow.
- Keep saffron checkmark, inner bottom shadow gradient, warm-gold accent line, title strip.

## Surface 2 — `src/components/ProductLibrary.tsx` (`StillUsMarquee`, ~158–184)

- Remove circular wrapper `<div>` (`borderRadius: '50%'`, `background: '#5A85D5'`, hairline border).
- Render `<img>` directly in the 40% left flex slot.
- Image: `width: 100%`, `aspectRatio: '1 / 1'`, `maxWidth: 130`, `maxHeight: 130`, `objectFit: contain`, `objectPosition: center`, plus full-size drop-shadow.

## Surface 3 — `src/pages/AdultCardPortal.tsx` (portal preview, ~335–352)

- Remove the inner circular `<div>` (`width: '60%'`, `borderRadius: '50%'`, `backgroundColor: getCircleColor(cardColor)`).
- `<PortalCardImage>` renders `<img>` directly inside Zone A.
- Image: `width: 66%`, `height: auto`, `objectFit: contain`, **`objectPosition: 'center'`** (explicit, for consistency with Surfaces 1 and 4), plus full-size drop-shadow.
- Remove the now-unused `import { getCircleColor }` line.

## Surface 4 — `src/components/LibraryResumeCard.tsx` (~300–341)

`isStillUs` branch only:
- **Keep** `borderRadius: '50%'` on the outer 56×56 wrapper (semantic signifier — round = Vårt Vi resume, rounded-square = kids resume).
- Remove the inner 70% circular `<div>` (`borderRadius: '50%'`, `background: innerColor`).
- Render `<img src={ILLUSTRATIONS.still_us}>` directly inside the outer round mat: `width: 100%`, `height: 100%`, `objectFit: contain`, `objectPosition: center`, plus the smaller drop-shadow.
- Kids `else` branch untouched.

## `getCircleColor` dead-export cleanup

After Surface 3 removes its import, run `rg "getCircleColor" src/` and:
- **Zero remaining usages** → delete the export (and the helper) from `AdultProductCardTile.tsx`.
- **One or more remaining usages** → keep it and add above the export:
  `// Retained for <filename(s)> — do not remove without checking call sites.`

(Earlier grep found usages only in `AdultProductCardTile.tsx` and `AdultCardPortal.tsx`, so deletion is the expected outcome — but I'll re-verify before deleting.)

## Out of scope (untouched)

`KidsTileFrame`, all kids tiles/portals/resume branch, palette tokens, fonts, copy, routing, animations, auth/Stripe/Supabase.

## Verification

- TypeScript build clean.
- Visual: all six Vårt Vi anchor colors render as mat on product home tiles; no circular shape on Surfaces 1–3 and no inner circle on Surface 4; warm-gold accent line + LANTERN_GLOW serif title intact; illustration appears lifted via drop-shadow.
- Kids surfaces visually unchanged.
- Resume banner still functional at 56×56 with outer round mat; library marquee still navigates to Vårt Vi.
