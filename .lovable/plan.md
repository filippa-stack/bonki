# Marketing screens — illustration mounts + reflection copy

## Issue 1 — Mount production illustration layers

Production source of truth (verified):

- **CardView question screen** (`src/pages/CardView.tsx` ~3161–3190 and ~3472–3490): Renders `useCardImage(cardId)` as a sibling `<img>` *behind* the cream card inside the content area, with:
  ```
  position: absolute; inset: -32%; width: 164%; height: 164%;
  objectFit: contain; objectPosition: 50% 45%;
  opacity: 0.7; pointerEvents: none; zIndex: 0;
  ```
  The cream card sits at `zIndex: 1` above it.
- **CompletedSessionView** (`src/components/CompletedSessionView.tsx` ~248–268): Renders `useCardImage(cardId)` once, full-width, top-anchored:
  ```
  position: absolute; top: 0; left: 0; width: 100%; height: 50%;
  objectFit: contain; objectPosition: 50% 30%;
  opacity: 0.3; pointerEvents: none; zIndex: 0;
  ```
  All page content sits in a `position: relative; zIndex: 1` wrapper above it.
- **Journal `SessionGroupCard`** (`src/pages/Journal.tsx` ~482–500): Renders the per-product `PRODUCT_ILLUSTRATION` PNG as a circular 56×56 thumbnail in the upper-right of the card at opacity 0.22. Marketing screen 6 already mounts the real `SessionGroupCard` with `productId: 'still_us'`, so this is already wired correctly — the faded thumbnail visible in the current export is the production behavior. **No change for screen 6.**

### Wrapper edits

**Screen 1 — `MarketingVvQuestion.tsx`**
- Import `useCardImage` and call it with `'smallest-we'`.
- Inside the cream-card container (the `<div>` at `margin: '20px 16px 0', flex: 1, display:flex, alignItems:center` that already wraps the warm-glow halo + cream card), insert the `<img>` BEFORE the halo and BEFORE the cream card, using the production CardView style block above (`inset: -32%`, `opacity: 0.7`, `zIndex: 0`). Add `zIndex: 1` on the cream card and the halo so layering matches production.

**Screen 2 — `MarketingVardagQuestion.tsx`**
- Same change, with `useCardImage('vk-hur-var-din-dag')`. Same exact production style block.

**Screen 3 — `MarketingVvCompletion.tsx`**
- Import `useCardImage` and call it with `'smallest-we'`.
- Inside the outer `ScaledScreen`'s absolute child, insert the illustration `<img>` as the FIRST child (before the hairline) using the production CompletedSessionView style block (`top:0; left:0; width:100%; height:50%; objectFit:contain; objectPosition:50% 30%; opacity:0.3; zIndex:0`).
- Wrap the existing column content in `position: relative; zIndex: 1` so it sits above the illustration. The flex column already exists — only add the two style props.

**Screen 6** — confirmed no change; production `SessionGroupCard` already renders its corner thumbnail.

### Notes
- All four wrappers continue using direct img tags (no SessionFocusShell/CompletedSessionView mounts) — only the illustration `<img>` and zIndex layering are added. Smallest possible diff.
- `useCardImage` is synchronous and returns a `/card-images/<id>.webp` path; no loading state to gate.
- `exportNodeToPng` already awaits `<img>` load before snapshotting (`waitForImages` in `src/lib/exportScreenshot/exportPng.ts`), so no capture-timing changes needed.

## Issue 2 — Reflection copy update

Replace the `REFLECTION` constant in **both**:
- `src/pages/export/marketing/MarketingVvCompletion.tsx`
- `src/pages/export/marketing/MarketingJournalSingle.tsx` (the `notes[0].text` field)

Exact string (em-dash is U+2014, straight quotes, no other changes):

```
Vi pratade om vem som bär vad — och hur det märks även när vi inte säger det. Jag visste inte att Johan faktiskt såg det. Att han förstått hur tungt det är att alltid vara den som planerar.
```

In source these will be JS string literals using `\u2014` for the em-dash to keep the codepoint unambiguous.

## Re-export

After both fixes, re-export PNGs for screens 1, 2, 3, 6 only (4 and 5 unchanged). Same spec: 1079×1689, bezel only, transparent outside rounded corners, 9:41 status bar.

## Files touched

- `src/pages/export/marketing/MarketingVvQuestion.tsx` — add illustration img + zIndex
- `src/pages/export/marketing/MarketingVardagQuestion.tsx` — add illustration img + zIndex
- `src/pages/export/marketing/MarketingVvCompletion.tsx` — add illustration img + zIndex + new REFLECTION string
- `src/pages/export/marketing/MarketingJournalSingle.tsx` — new REFLECTION string only

No production component edits. No new props. No state.
