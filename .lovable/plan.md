

## Add "Föregående" Button & Remove Header Back Arrows

### File 1: `src/components/SessionStepReflection.tsx`

**New prop**: `showBackButton?: boolean` (default `false`)

**Layout change**: Wrap the CTA `motion.button` (line 307) and a new "Föregående" button in a **horizontal flex row** (`display: flex`, `flexDirection: row`, `justifyContent: space-between`, `alignItems: center`, `width: 100%`, `gap: 12px`).

- **Left**: "Föregående" text button — `background: none`, `border: none`, `fontFamily: var(--font-sans)`, `fontSize: 14px`, `color` = stillUsMode `hsl(38 20% 82%)` / normal `var(--text-secondary)`, `opacity: 0.7`, `minHeight: 44px`, `cursor: pointer`. Calls `onBack()`.
- **Right**: Existing CTA button — **all styling unchanged**, but change `width` from `100%` to `flex: 1` so it fills remaining space.
- When `!showBackButton || !onBack`: render only the CTA at `width: 100%` exactly as today (no wrapper div).

The `onBack` prop already exists and is **never used in any JSX or effect** — safe to wire up.

### File 2: `src/pages/CardView.tsx`

**All three paths — live session headers**: Remove the back arrow button (`ChevronLeft` / `ArrowLeft`). Keep the × close button and card title untouched.

**All three paths — live session CTA**: Pass `showBackButton={!(currentStepIndex === 0 && localPromptIndex === 0)}` to `SessionStepReflection`. The `onBack` prop is already wired to the correct handler (`handleKidsBack` / `handleFocusBack` / equivalent).

**Kids CTA area** (not using `SessionStepReflection`): Add the same horizontal flex row layout with "Föregående" left, "Fortsätt" right. Calls `handleKidsBack()`. Hidden at first prompt.

**All completion screens**: Remove back arrow from header. Add "Föregående" in horizontal flex row left of primary CTA. Calls handler that does `_setShowCompletion(false)` + sets step/prompt to the last step's last prompt.

### File 3: `src/components/SectionView.tsx`

Remove the back arrow JSX block and `showBackArrow`-dependent padding. `ArrowLeft` import removed if unused.

### Unchanged
- × close/pause button (different DOM element, untouched)
- Protected patterns: `suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave)`, `hasSyncedRef`
- AnimatePresence, routing, pause dialog

