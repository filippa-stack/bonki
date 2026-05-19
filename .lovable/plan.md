## Ticket 2 Follow-up: Fix VartViHero composition and resume banner spacing

**File:** `src/components/ProductLibrary.tsx` (only)

### Fix 1 — VartViHero vertical poster

Replace the entire `return ( ... )` block inside the `VartViHero` function (currently a horizontal flex with split image/text zones) with a vertical column layout:

- `<button>` with `flexDirection: 'column'`, `alignItems: 'center'`, `justifyContent: 'center'`, padding `24px 18px 22px`, radius 16, `VI_TAB_HERO_COLOR` background, hairline box-shadow border, centered text.
- Children stacked top-to-bottom:
  1. Eyebrow `"För er som par"` — body font, 11px, uppercase, 0.16em tracking, `LANTERN_GLOW` @ 0.55, marginBottom 18.
  2. `illustrationStillUs` — max 150×150, contain, drop-shadow, marginBottom 16.
  3. `<h3>Vårt Vi</h3>` — display font 30px, weight 500, `LANTERN_GLOW`, line-height 1, marginBottom 16, `opsz` 30.
  4. Conditional footer:
     - If `isPurchased && completedCount > 0`: 60% width (max 180) container with 2px gold progress track + uppercase `"{completed} av {total}"` count below.
     - Else: uppercase `"{totalCards} samtal"`.

No changes to props, no changes outside the return.

### Fix 2 — Resume banner spacing

In the `ProductLibrary` default export JSX, change the wrapper around `<LibraryResumeCard global />`:

```
<div className="px-5" style={{ marginBottom: 24 }}>
  <LibraryResumeCard global />
</div>
```

(`marginBottom: 8` → `marginBottom: 24`.)

### Out of scope / untouched

TabBar, LibraryResumeCard internals, LibraryKidsTile, all hooks/data/state, barnen tab content, routing, typography migration.

### Verification

- TS build clean.
- Vi tab: vertical poster — eyebrow / illustration (~150px) / "Vårt Vi" 30px serif / progress or count, all centered, noticeably taller than before.
- 24px gap between resume banner and Vårt Vi hero (Vi tab) / disclaimer (Barnen tab).
