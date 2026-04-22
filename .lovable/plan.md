

## Act 1 empty state — corrected markup locked in

Using your corrected markup verbatim. Single edit to `src/pages/Journal.tsx`, plus removing the now-orphan `BonkiButton` import.

### Edit 1 — Replace empty-state JSX

In `src/pages/Journal.tsx`, inside the `(isEmpty && !hasRenderedContent.current) ? (` branch (around line 1112), replace the existing empty-state markup (the `Inga samtal ännu` block with svg, h2, p, BonkiButton) with:

```tsx
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
  {/* Act 1 — hero line + sub */}
  <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'left', width: '100%' }}>
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 300,
        lineHeight: 1.22,
        letterSpacing: '-0.022em',
        color: LANTERN_GLOW,
        margin: 0,
      }}
    >
      Det första de säger.
      <br />
      Och <em style={{ fontStyle: 'italic', fontWeight: 400, color: DEEP_SAFFRON }}>allt</em> de säger sen.
    </h2>
    <p
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: '14px',
        fontWeight: 300,
        lineHeight: 1.6,
        color: 'rgba(253, 246, 227, 0.55)',
        margin: '16px 0 0',
      }}
    >
      Varje svar sparas här. Om tre månader eller tre år kan du bläddra tillbaka och se ditt barn växa.
    </p>
  </div>
  {/* Bottom spacer — Act 2 is added in Prompt 2 */}
  <div style={{ height: '120px' }} aria-hidden />
</div>
```

The condition `(isEmpty && !hasRenderedContent.current)` and the closing `) : (` boundary stay exactly as written.

### Edit 2 — Remove orphan `BonkiButton` import

After Edit 1, `BonkiButton` has zero remaining references in `Journal.tsx`. Remove the line:

```ts
import BonkiButton from '@/components/BonkiButton';
```

### Imports verified

`LANTERN_GLOW` and `DEEP_SAFFRON` are already in the existing `@/lib/palette` import block. No import additions needed.

### Untouched (protected patterns)

- `(isEmpty && !hasRenderedContent.current)` condition — unchanged
- `hasRenderedContent.current` ref pattern — unchanged, still appears exactly twice
- Hero header (`Era samtal` + italic subtitle) lines ~1013–1038 — unchanged
- Stats narrative + filter pills lines ~1041–1107 — unchanged
- Data-fetching `useEffect` lines ~637–694 — unchanged
- All `useMemo` blocks (`allTimelineItems`, `visibleItems`, `groupedItems`, `monthGroups`) — unchanged
- Populated-state branch starting at the `) : (` after the empty branch — unchanged
- `AnimatePresence mode="wait"` — unchanged
- No `key={location.pathname}` added
- No `100dvh` introduced
- No changes to `useSessionReflections.ts`, `CardView.tsx`, `useNormalizedSessionState.ts`, `SessionStepReflection.tsx`

### Post-edit verification

1. `hasRenderedContent.current` appears exactly twice in `Journal.tsx`.
2. TypeScript compiles cleanly, no orphan import warning.
3. Empty state renders: hero `Era samtal` at top, then the new headline (Lantern Glow display, `allt` italic in Deep Saffron), then the italic Lantern-at-55% sub line, with a 120px bottom spacer reserving room for Prompt 2's Act 2.
4. Completing one reflection brings the populated timeline back — the new empty state does not flash.

