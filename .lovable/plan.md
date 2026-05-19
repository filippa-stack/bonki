# Restore CardView showStartScreen gate

Default the in-CardView "Starta samtal" gate back to **true** for live card entries, except when arriving from a portal Starta CTA, the resume banner, archive, dev, or demo. ~6 lines across 4 files. Render JSX, dismissal handlers, and all session/reflection logic untouched.

## File 1 — `src/pages/CardView.tsx`

Replace lines 708–713 (preserve a comment block above the const):

```tsx
// ─── Session start screen — ritual gate before first question ───
// Suppress the in-CardView gate when arriving from:
//   - the category portal's Starta button (portal already gated us)
//   - the library resume banner (we want to land in-session)
//   - archive, dev, demo modes
const arrivedFromPortal =
  (location.state as { fromPortal?: boolean } | null)?.fromPortal === true;
const [showStartScreen, setShowStartScreen] = useState(
  () => !isFromArchive && !isResumed && !arrivedFromPortal && !devState && !isDemoMode()
);
```

`isFromArchive`, `isResumed`, `devState`, `location`, `isDemoMode` are all already in scope (verified: `isDemoMode` imported line 34).

## File 2 — `src/components/LibraryResumeCard.tsx`

Line 268:

```tsx
onClick={() => navigate(`/card/${display.cardId}`, { state: { resumed: true } })}
```

CardView already reads `location.state.resumed` at line 137 and clears it via `history.replaceState`.

## File 3 — `src/pages/AdultCardPortal.tsx`

Line 177 (inside `startSession` callback):

```tsx
navigate(`/card/${card.id}`, { state: { fromPortal: true } });
```

Leave line 528 (freeCardId entry) untouched — free card first-touch should see the gate.

## File 4 — `src/pages/KidsCardPortal.tsx`

Lines 228 and 241 (both inside the portal-animation `setTimeout` chains):

```tsx
setTimeout(() => navigate(`/card/${card.id}`, { state: { fromPortal: true } }), 350);
// and
setTimeout(() => navigate(`/card/${card.id}`, { state: { fromPortal: true } }), 250);
```

Leave line 753 (freeCardId entry) untouched.

## Not changed

- `src/components/ProductLibrary.tsx` line 901 — preview tile keeps bare `navigate('/card/:id')`; the gate **should** appear.
- CardView lines 2270–2746 — render JSX and `setShowStartScreen(false)` dismissal handlers untouched.
- Lines 137, 140–145 — existing `isResumed` read and `history.replaceState` clear reused as-is.
- All session/reflection/navigation logic.

## Verification

1. Vårt Vi preview tile (never-started) → threshold appears
2. Vårt Vi preview tile (revisit completed) → threshold appears
3. Resume banner → no threshold, mounts at paused step
4. Category portal Starta → no threshold (already gated), goes to Q1
5. Kids card via category portal Starta → no threshold on second tap
6. Kids resume banner (if any) → no threshold
7. Free card deep entry → threshold appears
8. Archive view → unchanged (bypassed via existing `isLive` guard)

## Out of scope

Within-step prompt-index resume (server stores step only), start-screen UI redesign, preview-tile redesign, freeCardId entry paths, anything else.
