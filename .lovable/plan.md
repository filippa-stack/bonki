

## Plan: Prompt 5.1 — CompletionCeremony Screens 1–2 (Revised)

### Corrections applied from review

1. **Node circles: 16px** (not 10px)
2. **No dot indicators** — removed entirely; ceremony is intentionally minimal
3. **Already-completed skip targets index 4** (fifth panel, Screen 5) — confirmed correct per prompt
4. **PageTransition: keep** — all 12 existing Still Us routes at lines 108–120 in App.tsx use `<PageTransition>` wrapper, so this is consistent

### Changes

**1. Create `src/pages/CompletionCeremony.tsx`**

- Entry guard: fetch `couple_state`, redirect to `/` if phase is `program` or invalid; skip to `setCurrentScreen(4)` (Screen 5) if ceremony already completed
- 5 horizontal panels via `transform: translateX(-${currentScreen * 100}vw)` with touch swipe (50px threshold)
- **Screen 1**: 3s hold before swipe enabled (skipped with `prefers-reduced-motion`). Centered "Ni har gått hela vägen." — Deep Saffron `COLORS.deepSaffron`, DM Serif Display, 32px, on `COLORS.emberNight` background. No CTA, no dots.
- **Screen 2**: "Er resa" headline (Lantern Glow). Vertically scrollable timeline of 22 nodes:
  - **16px diameter** circles colored per `getLayerForCard(index).color`
  - Vertical line segments between nodes in layer color
  - Layer label (e.g. "Grunden") rendered only at first node of each layer group
  - Week number: uppercase, `COLORS.driftwood`, 11px
  - Card title: DM Serif Display, 16px, `COLORS.lanternGlow`
  - Placeholder takeaway on alternating nodes: italic, `COLORS.driftwoodBody`
- **Screens 3–5**: placeholder divs with "Screen N — coming soon" text
- Reduced motion: instant transitions (no CSS transition), Screen 1 hold skipped
- All colors from `COLORS` in `stillUsTokens.ts` — zero imports from `palette.ts`

**2. Update `src/App.tsx` (line 120 only)**

- Replace existing `CeremonyPage` import/route with:
  ```tsx
  import CompletionCeremony from './pages/CompletionCeremony';
  // Route:
  <Route path="/ceremony" element={<PageTransition><CompletionCeremony /></PageTransition>} />
  ```
- Remove the `CeremonyPage` from the still-us-routes import block if it becomes unused

