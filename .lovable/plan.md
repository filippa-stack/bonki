# Paywall Mock — `/paywall-mock/:productId`

A new sandbox route to evaluate the paywall surface that appears after a user completes her free welcome session. Mirrors the architectural pattern of `/intro-mock` and `/library-mock`. Live `ProductPaywall.tsx` and the production paywall logic are untouched.

## Files

### New
- **`src/components/PaywallMock.tsx`** — full paywall layout component + collapsible dev panel.
- **`src/pages/PaywallMock.tsx`** — page wrapper rendering the component plus a top-right MOCK badge linking to `/library-mock`.

### Modified
- **`src/App.tsx`** — register `<Route path="/paywall-mock/:productId" element={<PaywallMockPage />} />` inside `ProtectedContent`, alongside the other mock routes (intro / library / onboarding).

## Routing & state

- URL param `productId`. Supported: `jag_i_mig`, `jag_med_andra`, `jag_i_varlden`, `vardagskort`, `syskonkort`, `still_us`. Unknown id → simple "Okänt produkt-id" fallback (mirrors intro mock).
- No state machine — paywall is a single state. The page assumes welcome session was just spent on this product and product is not yet purchased.
- Orange CTA → sets `bonki-mock-purchased-{productId}` in localStorage and navigates to `/library-mock` so the post-purchase library state is verifiable.
- "Inte just nu" → navigates to `/library-mock` (no flag set).
- Dev panel (Se intro / Tillbaka till biblioteket) for navigating between the three connected surfaces.

## Layout (top → bottom)

```text
┌─────────────────────────────────┐
│ [←]    illustration backdrop    │  full-bleed, 42% vh, fades to midnight ink
│        (reuses ILLUSTRATIONS)   │
│                                 │
│   FÖRSTA SAMTALET · KLART       │  eyebrow, lantern-glow @90%, tracked uppercase
│                                 │
│      Ni har börjat något.       │  headline, Fraunces 36 wt500
│                                 │
│  ┌───────────────────────────┐  │
│  │       NÄSTA SAMTAL        │  │  next-session card (elevated surface)
│  │      Det jag bär          │  │  Fraunces italic 22, dynamic per productId
│  └───────────────────────────┘  │
│                                 │
│ 20 samtal kvar att utforska…   │  scope context, Inter 13 @75%
│                                 │
│ 195 kr · Engångsköp · Tillgång  │  pricing context, Inter 13 @75%
│         för alltid              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Fortsätt med Jag i Mig —    │ │  primary CTA, BONKI_ORANGE, 56h, r14
│ │           195 kr            │ │
│ └─────────────────────────────┘ │
│                                 │
│        Inte just nu             │  soft decline, Inter 12.5 @70%
└─────────────────────────────────┘
```

### Design tokens (reused from intro mock)
- `LANTERN_GLOW = '#FDF6E3'`, `MIDNIGHT_INK = '#0F1727'`, `BONKI_ORANGE = '#E85D2C'`
- Page background via `usePageBackground(MIDNIGHT_INK)`
- Illustration backdrop: same map + positions as `ProductIntroMock` (`PRODUCT_ILLUSTRATION`, `PRODUCT_ILLUSTRATION_POSITION`, opacity 0.5, brightness 1.15, gradient fade to midnight ink at 42% vh)
- Back arrow top-left, lantern-glow @70%

### Element specs

| Element | Font | Size / Weight | Color / Opacity | Notes |
|---|---|---|---|---|
| Eyebrow | Inter | 11 / 600, ls 0.25em uppercase | lantern-glow @90% | Centered on illustration→ink transition |
| Headline | Fraunces | 36 / 500 | lantern-glow, text-shadow `0 2px 12px rgba(0,0,0,0.35)` | Sits on stable midnight ink |
| Next-session card | — | — | bg `rgba(255,255,255,0.04)`, border `0.5px rgba(255,255,255,0.10)`, radius 18, padding 24×20 | — |
| Card eyebrow | Inter | 11 / 600, ls 0.20em uppercase | lantern-glow @65% | "NÄSTA SAMTAL" |
| Card title | Fraunces italic | 22 / 500 | lantern-glow | margin-top 12, dynamic per productId |
| Scope line | Inter | 13 / 500 | lantern-glow @75% | "20 samtal kvar att utforska tillsammans." (hardcoded) |
| Pricing line | Inter | 13 / 500 | lantern-glow @75% | margin-top 32 |
| Primary CTA | Inter | 14 / 600 | text lantern-glow on `#E85D2C` | full-width, h56, r14 |
| Soft decline | Inter | 12.5 | lantern-glow @70% | margin-top 16, text-only |

### Card-2 placeholder titles (hardcoded in mock)
```
jag_i_mig      → Det jag bär
jag_med_andra  → När någon ser mig
jag_i_varlden  → Vad som är mitt
vardagskort    → Det som var idag
syskonkort     → När vi delar
still_us       → Det vi inte sa
```

### CTA copy fallback
Default single-line: `Fortsätt med {productName} — 195 kr`. If a product name pushes the line past one line at 14px on iPhone 14/15/16 widths (~340px button width), fall back to two-line variant:
- Button: `Fortsätt med {productName}`
- Below CTA, Inter 12 lantern-glow @70%, centered: `195 kr · Engångsköp`

Verify visually for `Jag med Andra` and `Jag i Världen`; use single-line where it fits.

## Dev panel

Collapsible bottom-left pill, identical pattern to `ProductIntroMock`'s `DevPanel`:
- Position: `bottom: calc(env(safe-area-inset-bottom, 0px) + 76px); left: 12px; z-index: 9998;`
- Collapsed: `Mock · paywall ▾`
- Expanded: header `Mock · paywall ▴` (tap to collapse) + two action buttons:
  - `Se intro` → `navigate('/intro-mock/{productId}')`
  - `Tillbaka till biblioteket` → `navigate('/library-mock')`
- Dark glass styling: `rgba(0,0,0,0.55)` bg, `0.5px solid rgba(255,255,255,0.18)`, backdrop-blur 8

## MOCK badge (in page wrapper)

Top-right fixed pill matching intro/library mocks:
- `top: calc(env(safe-area-inset-top, 0px) + 50px); right: 12px; z-index: 9999;`
- Background `rgba(232, 93, 44, 0.95)`, white text, Inter 11/700
- Label: `MOCK · /paywall-mock → /library-mock`
- Links to `/library-mock`

## Out of scope (documented as comments in the file header)
- Real card-2-title lookup from product card arrays (mock uses hardcoded placeholders)
- Real `welcome_product_id` backend integration
- Testimonials / social proof
- Connection to actual session-completion event (production will route here from session completion; mock is reached only via dev navigation)

## Verification

- `/paywall-mock/jag_i_mig` renders the eight elements top-to-bottom in the correct order with the specified copy.
- Dev panel sits at bottom-left without overlapping the CTA.
- Orange CTA writes `bonki-mock-purchased-jag_i_mig` and lands on `/library-mock` showing the purchased state.
- "Inte just nu" returns to `/library-mock` with no flag changes.
- `Se intro` button in dev panel routes to `/intro-mock/jag_i_mig`.
- Live `ProductPaywall.tsx`, `ProductIntro.tsx`, free-card policy, and library/onboarding/intro mocks remain untouched.
