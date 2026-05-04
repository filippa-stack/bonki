# Product home mock — `/product-home-mock/:productId`

Sandboxed mock to evaluate the redesigned product home surface. Mirrors `/library-mock`, `/intro-mock`, `/paywall-mock`, `/onboarding-mock`. Live `ProductHome.tsx` is untouched.

## Files

**New**
- `src/components/ProductHomeMock.tsx` — the surface
- `src/pages/ProductHomeMock.tsx` — page wrapper (mirrors `LibraryMock.tsx`: `useThemeSwitcher`, MOCK badge, renders `<ProductHomeMock />`)

**Modified**
- `src/App.tsx` — register `<Route path="/product-home-mock/:productId" element={<ProductHomeMockPage />} />` inside `ProtectedContent`, alongside the other mock routes (after `/paywall-mock/:productId`).

## Route + supported productIds

`jag_i_mig`, `jag_med_andra`, `jag_i_varlden`, `vardagskort`, `syskonkort`, `still_us`. Unknown id → centered "Okänt produkt-id" + link back to `/library-mock`. `sexualitetskort` deferred.

## Layout (top → bottom)

### 1. Atmospheric tint zone (~28% viewport)
Full-width gradient at top of page, behind back arrow + KontoIcon (existing styling untouched):

```
background: linear-gradient(to bottom,
  {productColor} 0%,
  {productColor}80 6%,
  {productColor}40 14%,
  {productColor}10 20%,
  #1A1A2E 28%
);
```

Per-product `productColor`:
- `jag_i_mig` `#2A6B65`
- `jag_med_andra` `#8C3D69`
- `jag_i_varlden` `#7A8019`
- `vardagskort` `#549478`
- `syskonkort` `#9D7FB8`
- `still_us` `#7989A0`

Page background below the gradient = `#1A1A2E` (MIDNIGHT_INK). Back arrow (top-left, navigates to `/library-mock`) and KontoIcon (top-right) sit on the tint, in their existing styling.

### 2. Title + subtitle (centered, on the tint)
- Title: Fraunces 36px wt 500, `#FFFFFF`, `text-shadow: 0 1px 10px rgba(0,0,0,0.5)`. Just the product name (e.g. "Jag i Mig").
- Subtitle: Fraunces italic 16px, `rgba(255,255,255,0.85)`, line-height 1.3.

Subtitles per product:
- jag_i_mig: "21 samtal om känslor som får ord."
- jag_med_andra: "21 samtal om det trygga och det svåra."
- jag_i_varlden: "20 samtal om en värld som vidgas."
- vardagskort: "15 samtal om det vanliga, på djupet."
- syskonkort: "13 samtal om band för livet."
- still_us: "21 samtal om att förbli ett vi."

### 3. Resume / start banner
~24px margin-top under subtitle. Visual = redesigned library resume banner (Phase A.1.4).

Container:
- bg `#2A2D3A` (DEEP_DUSK)
- border `0.5px solid rgba(255,255,255,0.06)`
- border-radius `14px`
- padding `12px 16px`
- horizontal layout: ghost-glow dot (`#D4F5C0`, ~8px) left · text block (headline + subhead) center · `ChevronRight` right (50% opacity)
- entire element tappable → navigates to `/library-mock`

Two states (driven by dev panel):
- **Resume**: headline = paused card title (e.g. "Starka känslor"), subhead = `Pausad vid Fråga {n} av {total}`
- **Start**: headline = first card title, subhead = "Börja här"

In "Just purchased" state, the banner shows the **Start** state. (Spec describes "no resume banner" but also describes a start banner; we render the start banner here so the start affordance is always present.)

### 4. Card thumbnails grid
~24px margin-top under banner. 2-column CSS grid, gap `12px`, horizontal padding `20px`.

Tile:
- aspect-ratio `1 / 1.15`
- bg `#2A2D3A`, border `0.5px solid rgba(255,255,255,0.06)`, border-radius `14px`
- vertical flex container, overflow hidden
- click → `/library-mock`

Layout zones:
1. **Title block (top)** — padding `12px 12px 8px`. Title Fraunces 18px wt 500 `#FFFFFF`, no shadow. `position: relative; zIndex: 2`.
2. **Illustration zone (middle)** — `flex: 1; position: relative; overflow: hidden`. `<img>` full-bleed, `objectFit: contain`, `objectPosition: center`. No scrim. Uses the product-level illustration as placeholder for all that product's tiles (no per-card illustration assets exist).
3. **Progress block (bottom)** — padding `8px 12px 12px`, solid DEEP_DUSK.
   - Bar: 3px tall, border-radius 2px, track `rgba(255,255,255,0.1)`, fill width `{percent}%`, fill bg `rgba(253,246,227,0.7)` (LANTERN_GLOW @ 70%). Always rendered (0% width when untouched).
   - Text below bar: Inter 11px wt 500 `rgba(255,255,255,0.65)`, `{completed}/{total} samtal`.

### Mocked card data (titles, total samtal per card)
- jag_i_mig: Mina känslor (5), Starka känslor (5), Stora känslor (5), Att vara jag (6)
- jag_med_andra: Att vara nära (5), Att höra till (5), Bråk (5), Kompisar (3), Ensam (3)
- jag_i_varlden: Omvärlden (5), Vem är jag (5), Jag & andra (5), Vad tror jag på (5)
- vardagskort: Morgon (5), Skola (5), Kväll (5)
- syskonkort: Att vara syskon (5), När det skaver (4), Tillsammans (4)
- still_us: Vi som par (7), Vi som föräldrar (7), Vi i världen (7)

(Titles are illustrative for the mock; exact numbers chosen to sum to subtitle counts.)

### 5. Bottom nav
Existing `<BottomNav>` rendered by `ProtectedContent` — no changes.

## Dev panel (collapsible, bottom-left)
Same pattern as `ProductLibraryMock`:
- Collapsed pill: `Mock · {productName} ▾`
- Expanded card lists three state buttons (active state highlighted in BONKI_ORANGE):
  1. **Just purchased** — start-banner, all cards 0/N
  2. **In progress** — resume-banner pointing to card 2 (paused at Fråga 3 of N), card 1 = full, card 2 = ~40%, rest 0
  3. **Mostly complete** — all cards full, last card ~60%
- Two link buttons: `Tillbaka till biblioteket → /library-mock`, `Se intro → /intro-mock/{productId}`

State held in local `useState<'fresh' | 'progress' | 'mostly'>`.

## MOCK badge
Top-right fixed pill, same styling pattern as other mock badges:
- `position: fixed; top: calc(env(safe-area-inset-top, 0px) + 50px); right: 12px; z-index: 9999;`
- Text: `MOCK · /product-home-mock → /library-mock`
- Tappable → `/library-mock`

## Out of scope
Real progress/session/access wiring · sexualitetskort styling · live `ProductHome.tsx` migration · card-thumbnail navigation to real session UI · bottom-of-page suggestions/related products on live ProductHome.

## Verification
- `/product-home-mock/jag_i_mig` (default "Just purchased"): teal atmospheric tint at top fading to MIDNIGHT_INK by ~28% viewport; title + subtitle on tint; start-banner with ghost-glow dot; 2-col grid of DEEP_DUSK tiles with title-top / illustration-middle / progress-bar-bottom; bars at 0% width.
- "In progress" state: banner switches to resume copy; card 1 bar full, card 2 partial, rest empty.
- "Mostly complete": all bars full or near-full.
- Switching `:productId` swaps tint hue, subtitle copy, and card titles.
- Live `ProductHome.tsx` and other live surfaces untouched; grep for `linear-gradient.*to top.*rgba\(0,0,0` in new files returns zero.
