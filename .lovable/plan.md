

## Act 2 — Preview timeline in Journal empty state

Single edit to `src/pages/Journal.tsx`. Pure JSX, no new imports, no new hooks. Teal `jag_i_mig` accent confirmed intentional.

### Edit — Replace the bottom spacer with Act 2

In `src/pages/Journal.tsx`, find the spacer added in Prompt 1:

```tsx
{/* Bottom spacer — Act 2 is added in Prompt 2 */}
<div style={{ height: '120px' }} aria-hidden />
```

Replace it with the Act 2 block from your prompt verbatim:

- **Heading:** `En röst som växer.` (display, Lantern Glow, italic saffron `växer`) + sub `Olika frågor, olika år. Ett barn som blir sig själv framför dig.` (italic Lantern at 55%).
- **`Exempel` pill:** top-right, uses `getProductAccent('jag_i_mig').light` for tint/border/text (renders teal — intentional).
- **Spine:** 1px Lantern-at-12% vertical line at `left: 2.05rem`.
- **Four preview rows** (`i år`, `om ett år`, `om två år`, `om tre år`) with year-dot in `#E9C890`, `1 samtal` meta-label, and a reflection card matching `NoteEntryCard` 1:1: `${accent.light}22` background, 22px radius, 56×56 illustration top-right at 22% opacity, `Jag i Mig` name in `accent.light`, date label, card-name sub, italicized question prefix, serif answer in `#E9C890` 16px Fraunces.
- **Opacity fade:** card + dot + year-label step `1.0 → 0.85 → 0.70 → 0.55`.
- **Closing:** `Börja nu så finns det sen.` (display, italic saffron `sen`) + italic sub `Ett samtal i taget. Ingen bakgrund att ta igen.` + underlined `Så börjar det →` button wired to `navigate('/')`.
- **Tail:** 100px spacer.

The wrapping `</div>` of the empty-state flex container and the `) : (` boundary stay exactly as they are.

### Preconditions verified (no import changes)

- `getProductAccent` defined in-file (line ~229), returns `{ light: '#27A69C', mid, deep }` for `jag_i_mig` — confirmed teal, intentional.
- `PRODUCT_ILLUSTRATION['jag_i_mig']` resolves to `jimImage` (line ~35).
- `LANTERN_GLOW`, `DEEP_SAFFRON`, `navigate` already in scope.
- `NoteEntryCard` (lines 263–393) structure matches the preview cards 1:1 — same background formula, border, radius, shadow, illustration positioning, metadata row, question prefix, serif answer typography.

### Untouched (protected patterns)

- `(isEmpty && !hasRenderedContent.current)` condition + ref pattern (still appears exactly twice)
- Loading branch, populated branch, hero header, stats narrative, filter pills
- Data-fetching `useEffect`, all `useMemo` blocks, `AnimatePresence mode="wait"`
- `getProductAccent` and `PRODUCT_ILLUSTRATION` definitions
- No new imports, no `motion.*`, no new `useState`/`useEffect`/`useMemo`
- No `100dvh`, no `key={location.pathname}`
- No changes to `useSessionReflections.ts`, `CardView.tsx`, `useNormalizedSessionState.ts`, `SessionStepReflection.tsx`

### Post-edit verification

1. TypeScript compiles cleanly.
2. `getProductAccent` appears multiple times in `Journal.tsx` (definition + existing `NoteEntryCard` usage + new Act 2 usages for pill and four card rows).
3. `hasRenderedContent.current` still appears exactly twice.
4. Empty state for a fresh user: Act 1 hero → Act 2 heading → teal `Exempel` pill → four teal Jag i Mig cards with faded illustration top-right and serif `#E9C890` answers, fading 1.0 → 0.55 → closing line + `Så börjar det →` link.
5. Tapping `Så börjar det →` navigates to `/`.
6. Completing one real reflection swaps the empty state for the populated timeline; preview cards' visual structure is identical to real ones.

