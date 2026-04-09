

## Journal card styling — solid product-colored backgrounds

### Summary
Update rendering styles in `Journal.tsx` so conversation cards use solid product-colored backgrounds instead of transparent overlays. Text colors adjusted for readability on the new backgrounds. No data/logic changes.

### Changes in `src/pages/Journal.tsx`

**`getProductAccent` fallback** — Change fallback `mid` to `MIDNIGHT_INK` (#1A1A2E) so cards without a product match still look intentional.

**`NoteEntryCard` styling:**
- Background: `accent.mid` (solid) instead of `${accent.light}22`
- Border: `${accent.deep}44`
- Top color bar: `accent.deep`
- Product name + card title: `LANTERN_GLOW` / `${LANTERN_GLOW}88`
- Date: `${LANTERN_GLOW}66`
- Question text ("—" lines): `accent.deep`
- Reflection text: `LANTERN_GLOW` (#FDF6E3)
- "Läs mer" button: `${LANTERN_GLOW}aa`

**`SessionGroupCard` styling:**
- Same background/border/text pattern as NoteEntryCard
- Takeaway block bg: `${accent.deep}33`
- Divider lines: `${LANTERN_GLOW}22`
- "Visa alla" toggle: `${LANTERN_GLOW}88`

### Post-implementation verification
Confirm these four protected patterns are still present and unmodified:
- `suppressUntilRef` → `src/hooks/useNormalizedSessionState.ts`
- `prevServerStepRef` → `src/pages/CardView.tsx`
- `clearTimeout(pendingSave.current)` → `src/hooks/useSessionReflections.ts` + `src/hooks/useCardTakeaway.ts`
- `hasSyncedRef` → `src/components/SessionStepReflection.tsx`

### Files changed
- `src/pages/Journal.tsx` — rendering styles only

### What stays untouched
- All data fetching, session queries, status filters
- Timeline grouping, month markers, spine
- Pulse card, bookmark cards
- All protected refs (in their actual files listed above)

