# Correct v4 Mocks to Spec

The current `/onboarding-mock` and `/library-mock` deviate from the v4 spec on copy, layout, color register, pill content, and the logo SVG itself. This plan corrects all listed deviations. Every Swedish string is treated as immutable and copied character-for-character.

Scope is strictly the mock files. The live `Onboarding.tsx` and `ProductLibrary.tsx` are not touched. The four protected ref patterns are not touched.

## 1. BonkiLogoMark.tsx — replace SVG body

Replace the current "speech bubble" placeholder with the verbatim two-figures-in-oval SVG from the v4 mockup HTML (oval frame + parent figure + child figure + 4 eye dots, viewBox `0 0 100 100`, stroke widths 3 / 2.5 / 2.5 / 1.5 / 1.2 as specified).

Keep the existing component API (`size`, `color`, `className`, `style`, `aria-hidden`) so all current call sites continue to work. Stroke widths stay literal as in the spec — they already scale visually with `width`/`height`.

## 2. OnboardingMock.tsx — three screens rebuilt to spec

Rewrite the three screens. CTA color register matters: orange on screens 1 + 2 (transactional/advance), ghost-glow `#D4F5C0` on screen 3 (receptive/accept-the-gift). Do not unify.

### Screen 1 — Igenkänning

- Top: "BONKI" wordmark — Inter 700, 12px, letter-spacing 4px, lantern-glow (`#FDF6E3`), centered ~56px below safe-area top.
- Vertical center: Fraunces *italic* 22px / 400, lantern-glow, line-height 1.4, centered, two lines exactly:
  > Samtalet som dagen
  > inte gav plats för.
- No subhead. Remove the invented "BONKI är ett rum för samtalen som annars blir kvar inombords."
- Above CTA: 3-dot progress as **dashes** — three 16×2px bars, 6px gap. Dash 1 active = `#E85D2C`, dashes 2–3 inactive = `rgba(253,246,227,0.20)`.
- CTA: orange `#E85D2C`, full-width minus 28px side margin, 50px tall, 14px radius, Inter 14/600 white "Fortsätt".
- Background: flat `#0F1727` (note: midnight ink updated to `#0F1727` per spec, not `#0B1026`).

### Screen 2 — Löfte & login

Top → bottom:

- ~70% top spacer.
- BonkiLogoMark 32px, lantern-glow @ 0.85 opacity, centered. mb 18px.
- Promise — Fraunces *italic* 19/400, lantern-glow, lh 1.4, centered:
  > De små samtalen är de som bär.
  > De som faktiskt blir av.
- mb 14px.
- Credentials — Inter 11.5px, `rgba(253,246,227,0.55)`, lh 1.55, centered:
  > Utvecklat av leg. psykolog och psykoterapeut med 29 års klinisk erfarenhet.
- mb 8px.
- Pace line — Inter 11.5px, `rgba(253,246,227,0.55)`, centered:
  > Ni bestämmer takten.
- mb 18px.
- Divider: 100×0.5px, `rgba(253,246,227,0.20)`, centered. mb 18px.
- Two price rows, full-width flex space-between, 8px vertical padding, lantern-glow:
  - `För dig och din partner` (Inter 13 regular) … `249 kr` (Fraunces 14)
  - `För dig och ditt barn` (Inter 13 regular) … `195 kr` (Fraunces 14)
- mt 22px → CTA block:
  - Primary: orange `#E85D2C`, full-width, 50px, 14px radius, Inter 14/600 white: `Fortsätt med Google`
  - 12px gap.
  - Secondary text-only: Inter 12.5 lantern-glow, centered: `Logga in med e-post`
- mt 16px.
- Legal — Inter 10px, `rgba(253,246,227,0.45)`, lh 1.55, centered, with `Villkor` → `/terms` and `Integritetspolicy` → `/privacy` underlined:
  > Genom att fortsätta godkänner du våra Villkor och Integritetspolicy.

Remove the invented bullet list ("Korta, varma samtal …", "Inga prestationer …", "Det ni delar stannar mellan er").

### Screen 3 — Welcome gift (receptive register, ghost-glow)

Top → bottom:

- 50px from top safe area.
- Eyebrow — Inter 11/600, `#D4F5C0`, letter-spacing 3px, uppercase, centered:
  > EN GÅVA TILL ER
- mb 24px.
- BonkiLogoMark 120px in ghost-glow `#D4F5C0`, drop-shadow `0 4px 18px rgba(212,245,192,0.35)`, wrapped in a 132×132 div with a pulsing radial halo `::before` (3s ease-in-out infinite, scale 1 → 1.10, opacity 0.85 → 0.4). Implemented as a styled div with a keyframe block emitted in the same component.
- mb 22px.
- Headline — Fraunces 26/500, lantern-glow, lh 1.18, ls -0.01em, centered, two lines:
  > Ett samtal,
  > från oss till er.
  - The word `er` rendered as `<em>` styled italic + ghost-glow.
- mb 12px.
- Body — Cormorant Garamond *italic* 15px, `rgba(253,246,227,0.78)`, lh 1.55, centered:
  > Välj vilket — där det betyder mest just nu.
- mb 22px.
- Promise card — bg `rgba(212,245,192,0.06)`, border `0.5px solid rgba(212,245,192,0.20)`, radius 18px, padding 14×16px, mb 22px. Three rows, Inter 12.5 `rgba(253,246,227,0.78)`, each prefixed by a ghost-glow `✓`:
  - `Det första samtalet i en produkt — gratis`
  - `Engångsköp · Tillgång för alltid`
  - `Ingen prenumeration`
- mt auto → CTA: ghost-glow `#D4F5C0` background, midnight-ink text (`#0F1727`), full-width, 50px, 14px radius, Inter 14/600:
  > Visa biblioteket
- mt 16px.
- 3-dot progress at bottom (same dash style as screen 1), dot 3 active in ghost-glow.

Onclick of `Visa biblioteket` → `window.location.href = '/library-mock'` (unchanged).

## 3. ProductLibraryMock.tsx — tile + pill + resume corrections

This file is large; the corrections are surgical. Most of the existing structure (audience grouping, `useAllProductAccess`, gating, KontoSheet, etc.) stays.

### 3a. Add gradient tokens

Inject the six per-product CSS custom properties into the mock page only (a `<style>` block inside `LibraryMock.tsx` or `ProductLibraryMock.tsx` root) — avoids touching global `themes.css`:

```text
--vartvi-bg-1:#A8B5C9; --vartvi-bg-2:#7989A0;
--jim-bg-1:#2A6B65;    --jim-bg-2:#1F5550;
--jma-bg-1:#B85A8A;    --jma-bg-2:#8C3D69;
--varlden-bg-1:#BAC03E; --varlden-bg-2:#8E9425;
--vardag-bg-1:#6FB498;  --vardag-bg-2:#549478;
--syskon-bg-1:#C4A5D6;  --syskon-bg-2:#9D7FB8;
```

Map product id → slug:
`jag_i_mig→jim`, `jag_med_andra→jma`, `jag_i_varlden→varlden`, `vardagskort→vardag`, `syskonkort→syskon`, `still_us→vartvi`. (Sexualitetskort: not in spec list — keep its current flat color so the mock doesn't break for that audience.)

### 3b. PastelTile structural rewrite

- Aspect ratio: `1 / 1.05` portrait. Replace the per-product `TILE_HEIGHTS` map with `aspectRatio: '1 / 1.05'`.
- Background: `linear-gradient(165deg, var(--{slug}-bg-1), var(--{slug}-bg-2))` instead of flat `bg`.
- Keep illustration full-bleed using existing `ILLUSTRATIONS`, `ILLUSTRATION_SCALE`, `ILLUSTRATION_OFFSET` (these stay).
- Text block: absolute lower-left, 14px from bottom, max-width 75%.
  - Title: Fraunces 26/500 lantern-glow, text-shadow `0 2px 12px rgba(0,0,0,0.35)`, mb 5px.
  - Felt-line: Inter 12px `rgba(253,246,227,0.92)`, lh 1.3, text-shadow `0 1px 6px rgba(0,0,0,0.35)`, mb 9px. Source from existing `TAGLINES` map.
  - Pill directly below felt-line — see 3c.

### 3c. Pill state machine — three states, no decoration

Remove **all** `✦` (`\u2726`) usage and the word `utforskade` from pill rendering. Replace the current pill JSX (the long ternary on lines ~458–467) with:

| Condition | Pill content |
|---|---|
| Untouched (no completed cards, not purchased) | `{N} samtal` (N = `product.cards.length`) |
| Tasted (≥1 completed, not purchased) | 9px `<BonkiLogoMark>` + ` Du har provat` |
| Purchased | `{completed} av {total}` (e.g. `16 av 21`) |

Pill style: 5×11px padding, 999px radius, `rgba(255,255,255,0.18)` bg, `backdrop-filter: blur(8px)`, `0.5px solid rgba(255,255,255,0.25)` border, Inter 11.5/600, lantern-glow text, ls 0.02em.

`completedCount` is already passed in via existing prop wiring; "tasted" is `completedCount > 0 && !isPurchased`. `useKidsProductProgress`-style `status='completed'` filtering is already what feeds these counts in the live lobby — reuse the same source the existing PastelTile calls already provide.

### 3d. Remove tile-corner Resume overlay

Delete the entire `hasActiveSession` corner block (current lines ~327–368: the dot + "Fortsätt" + "X dagar sedan" timestamp). Resume affordance lives only in the top resume banner now.

Also remove the `formatRelativeTime` helper if it has no remaining caller.

### 3e. Resume banner rewrite (top of lobby)

The current top zone uses `LibraryResumeCard`. For the mock, replace its render with a new inline banner (or reuse existing `ResumeBanner.tsx` after correcting it — see below). Spec:

- 64px tall, 14px radius.
- Background: `linear-gradient(90deg, rgba({accent},0.30) 0%, rgba({accent},0.06) 38%, rgba(26,37,56,0.95) 70%), #1A2538`.
- Border: `0.5px solid rgba(253,246,227,0.08)`.
- Padding `0 8px 0 14px`, flex row, gap 10px, align-items center.
- Children:
  1. 8×8 dot, bg = product accent (e.g. `#A8B5C9` for Vårt Vi), box-shadow `0 0 10px rgba({accent},0.6)`.
  2. Text block, flex 1:
     - Headline: Fraunces 14.5/500 lantern-glow, lh 1.15 — **just the product name**, no verb. e.g. `Vårt Vi`. Remove "Fortsätt utforska …".
     - Sub: Inter 10.5 `rgba(253,246,227,0.65)`, lh 1.3 — `Pausad vid Fråga {n} av {total} · {cardTitle}`.
  3. CTA pill: bg `#E85D2C`, lantern-glow text, 9×16 padding, 999px radius, Inter 12.5/600, content `Fortsätt`. Click → `navigate(\`/card/${cardId}\`)`.

Accent map for resume banner = same gradient bg-1 token per product (vartvi `#A8B5C9`, jim `#2A6B65`, etc.).

`ResumeBanner.tsx` is currently a different shape (radial bloom, two-line, `Ert samtal väntar.` headline). Rather than mutate the live component, the mock will use a new local `MockResumeBanner` component inside `ProductLibraryMock.tsx`.

### 3f. Source data for resume banner

Use the existing logic that `LibraryResumeCard` already uses (most-recent active `couple_sessions` row). No new hook required — call the same query inline or extract a tiny helper. The `useResumeSession.ts` hook referenced earlier was never created and is not needed for this correction pass; the existing query in `LibraryResumeCard` is the source of truth.

## 4. Files touched

- `src/components/BonkiLogoMark.tsx` — SVG body replaced (API unchanged).
- `src/components/OnboardingMock.tsx` — three screens rebuilt to spec.
- `src/components/ProductLibraryMock.tsx` — tile gradient + portrait aspect, pill state machine (remove ✦ / "utforskade"), remove tile-corner resume overlay, replace top resume card with `MockResumeBanner` matching spec.

No other files touched. `index.html` already has Fraunces + Cormorant Garamond loaded.

## 5. Verification before shipping

- Grep mock files for `✦` and `\u2726` and `utforskade` — must return zero matches.
- Grep mock files for `Fortsätt utforska` — must return zero matches.
- Confirm Screen 1 contains exactly the two lines `Samtalet som dagen` / `inte gav plats för.` and no other body copy.
- Confirm Screen 3 CTA reads `Visa biblioteket` and is ghost-glow, not orange.
- Confirm BonkiLogoMark renders the oval-with-two-figures structure (viewBox `0 0 100 100`) and no longer the speech bubble.

Anything unresolvable (e.g. `/terms` route does not yet exist) will be surfaced in the build summary rather than silently substituted.
