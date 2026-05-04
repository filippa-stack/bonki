# Intro mock — credentials pill + collapsible dev panel

Two adjustments to `src/components/ProductIntroMock.tsx`. No other files touched.

## 1. Credentials line — dark pill backing

The illustration backdrop is 42% viewport height with a 50% gradient fade, so the credentials line sits in the transition zone where contrast is uneven. Pushing it further down would compress body copy and the CTA region into the bottom nav. The pill approach is cleaner.

Replace the bare `<p>` with a centered `<p>` wrapped in a flex container so the pill hugs the text:

- background: `rgba(15,23,39,0.85)` (midnight ink at 85%)
- padding: `6px 16px`
- border-radius: `999px`
- backdropFilter: `blur(4px)` (and `-webkit-` variant) — softens any creature shapes peeking through
- opacity bumped from `0.65` to `0.85` since the pill provides ground; copy can read at full strength
- `marginTop: 24` on the wrapper (was `40` on the bare `<p>`)

All other styling unchanged (Inter 12px, lantern-glow, centered, copy unchanged).

## 2. Dev panel — collapsible toggle

The expanded panel covers the CTA region. Make it default-collapsed.

Change `DevPanel` to track local `expanded` state (default `false`).

**Collapsed state** — small pill at the same anchor:
- `position: fixed; bottom: calc(env(safe-area-inset-bottom, 0px) + 76px); left: 12px; z-index: 9998;`
- Single button labeled `Mock · {resolved} ▾` with caret
- Compact: `padding: 6px 10px`, `borderRadius: 999px`, same dark glass styling (`rgba(0,0,0,0.55)` + 0.5px border + blur)
- Tapping expands

**Expanded state** — current full panel, plus:
- Header row shows `Mock state · {resolved}` with a `▴` collapse affordance
- Tapping the header (or the caret) collapses back
- Three state buttons unchanged (Free / Locked (i Jag i Mig) / Purchased)
- Selecting a state still calls `onSelect` and clears flags as today; panel can stay open or auto-collapse — keep it open so rapid state-switching still works

Z-index stays `9998` (was `9999`); MOCK badge in top-right is untouched.

## What stays unchanged

- Headline (40px), subhead, body copy, sample question card, CTA region, copy strings
- State machine, localStorage flags, navigation handlers
- MOCK badge top-right, back arrow, illustration backdrop
- Live `ProductIntro.tsx`

## Verification

- `/intro-mock/jag_i_varlden` (free): credentials pill reads cleanly against any background; CTA region fully visible with no dev panel overlap.
- Dev toggle "Mock · free ▾" sits at bottom-left as a small pill; tapping expands the panel; tapping the header collapses it again.
- Switching to Locked state via the expanded panel updates label to "Mock · locked ▾" when collapsed.
