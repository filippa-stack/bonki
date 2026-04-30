# Screen 1 (PreAuthIntroSlide1) — four-fix patch

All changes are visual only. No handlers, navigation, or auth touched. Two files modified.

## Root cause for issue #1 (font not loading)

`index.html` requests Google Fonts with `display=optional`. With that strategy the browser is allowed to skip the webfont entirely on slower connections and stay on the fallback (Georgia) for the lifetime of the page — which matches what's rendering. The italic 400 cut IS in the URL (`Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500`), so the URL is fine; the swap behaviour is the problem.

Two-part fix so we don't risk regressing other surfaces that already rely on `display=optional`:

1. Add a dedicated `<link>` for just `Cormorant Garamond` with `display=swap` to `index.html`. This guarantees the italic gets applied as soon as it arrives, on the one screen that needs it. The existing combined link stays exactly as is, so no other typography on the site changes behaviour.
2. Preload the italic 400 woff2 so it's available before first paint of the recognition sentence.

## Files to change (2)

### 1. `index.html`

Just below the existing Google Fonts `<link>`, add:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
```

Nothing else in `index.html` changes. The existing combined font link stays untouched so no other surface's typography behaviour shifts.

### 2. `src/components/PreAuthIntroSlide1.tsx`

Full rewrite of the JSX layout to match the spec. Handler (`onContinue`), import, and component signature stay byte-identical.

New top-to-bottom structure:

```text
[ safe-area-inset-top ]
  ↓ 48px
[ BONKI wordmark — Bebas Neue 14px / 3px tracking / 85% opacity / centered ]
  ↓ flex: 1 (centers recognition sentence in remaining space)
[ Recognition sentence — Cormorant Garamond italic 26px ]
  ↓ flex: 1
[ Bar indicator (orange + cream-25%) ]
  ↓ 16px
[ Fortsätt CTA — filled #E85D2C pill, 44px ]
  ↓ 24px + safe-area-inset-bottom
```

#### Wordmark (top)

Render as text (not image) so we can apply Bebas Neue / 14px / 3px tracking exactly per spec:

- `fontFamily: "'Bebas Neue', sans-serif"`, weight 400, size 14, letter-spacing 3px
- color `#FDF6E3`, opacity 0.85, centered
- 48px below `safe-area-inset-top`
- The existing `bonkiWordmark` import is removed (no longer used).

#### Recognition sentence (vertically centered)

- Copy unchanged: "Samtalet som dagen inte gav plats för."
- `fontFamily: "'Cormorant Garamond', Georgia, serif"`, italic, weight 400
- size 26px, line-height 1.1, letter-spacing 0
- color `#FDF6E3`, text-align center, max-width 320px
- Wrapped in a `flex: 1` container with `align-items: center` so it sits in the visual middle of the remaining vertical space.

#### Bar indicator (16px above CTA)

Unchanged shape: two 18×2 pills, gap 6px, active orange `#E85D2C`, inactive `rgba(253,246,227,0.25)`. Now sits in the bottom cluster directly above the CTA with a 16px gap.

#### Fortsätt CTA (filled orange)

- Background `#E85D2C`, no border
- Border-radius 22px, height 44px, width 100% within the 24px horizontal page padding
- Text "Fortsätt", DM Sans 500 / 14px, color `#FDF6E3`
- Same `onClick={onContinue}` — no behavioural change
- Pointer feedback: subtle darken on press (background `#D8531E`) instead of the previous transparent hover

#### Removed

- Large bottom `<img src={bonkiWordmark} />` block — gone.
- The `bonkiWordmark` import — gone.

## Behavioural preservation

- `onContinue` handler signature, props interface, and component name unchanged.
- iOS PWA rules preserved: `min-height: calc(100vh)` (never `100dvh`), `transform: translateZ(0)`, both safe-area insets respected.
- No changes to Login.tsx, the legacy native branch, auth logic, routes, or i18n keys.

## iPhone SE viewport check (375×667)

`safe-area + 48 + 14 wordmark + flex + 26 sentence (single or two-line ≈ 58) + flex + 2 indicator + 16 + 44 CTA + 24 + safe-area`
≈ 230px of fixed content + two flex spacers fills the rest cleanly. Comfortable fit on 667px.

## Post-implementation verification

1. Open the deployed site, inspect the h1 in DevTools, confirm computed `font-family` resolves to `Cormorant Garamond` (not Georgia). If it still falls back, report back rather than work around.
2. Confirm wordmark renders at top, CTA is filled orange, bar indicator sits 16px above CTA.
3. Confirm `onContinue` still fires and routes to the redesigned Login screen.
