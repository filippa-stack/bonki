# ProductLibrary two-tab restructure

Restructure `src/components/ProductLibrary.tsx` to a "Vi" / "Barnen" tab system. All data fetching, hooks, routing, demo logic, and atmospheric layers remain untouched.

## Scope

**File:** `src/components/ProductLibrary.tsx`
**Untouched:** `useAllProductAccess`, `useCoupleSpaceContext`, `useAuth`, `useDevState`, demo session listeners, `completedCountMap` / `activeProductIds` queries, `sortedKidsProducts` memo, `isProductHiddenOnPlatform` filter, `LibraryResumeCard`, `usePageBackground` + background layers, `KontoIcon`/`KontoSheet`, all `useNavigate` targets, `trackOnboarding`.

## Changes

1. **Imports** — add `CORNFLOWER, DUSTY_ROSE, STORM_GREY, WARM_GOLD` from `@/lib/palette`.
2. **Constant** — add `VI_TAB_HERO_COLOR = STORM_GREY` after existing `TILE_COLORS`.
3. **Replace `LibraryHeader`** with a new `TabBar({ active, onChange })` rendering two display-font buttons (`Vi`, `Barnen`); active tab gets full opacity + a 2px warm-gold underline pill; inactive 0.42 opacity.
4. **Delete `SectionEyebrow`** function entirely.
5. **Replace `StillUsMarquee`** with a new `VartViHero({ totalCards, completedCount, isPurchased, onClick })`. Storm Grey surface, "För er som par" eyebrow, "Vårt Vi" serif title, illustration, and either a progress bar + "X av Y" or "{totalCards} samtal" fallback when not purchased.
6. **`LibraryKidsTile`** — remove the `TAGLINES[product.id] && (...)` subtitle block. Keep title, tasted glyph, and progress bar.
7. **`ProductLibrary` default export:**
   - Add `const [activeTab, setActiveTab] = useState<'vi' | 'barnen'>('vi');` right after `stillUsProduct` lookup.
   - Replace the `{/* Content */}` JSX with: `KontoIcon` + `KontoSheet`, `TabBar`, `LibraryResumeCard` (kept as-is), then conditional render — `activeTab === 'vi'` → `VartViHero` wired to `/product/still-us` (with `totalCards`/`completedCount`/`isPurchased` derived from existing data); `activeTab === 'barnen'` → the existing age-guidance microcopy + kids grid mapping `sortedKidsProducts` to `LibraryKidsTile` (navigation targets unchanged).

## Verification

- TypeScript build clean.
- Header "Biblioteket" and the "Samtal för hela familjen" eyebrow are gone; tab bar visible with gold underline under the active tab.
- Vi tab: Storm Grey hero with "För er som par", Vårt Vi serif title, illustration, progress bar + "X av 18" when purchased / "18 samtal" otherwise. Tap → `/product/still-us`.
- Barnen tab: existing 6-tile kids grid renders; tile subtitles (TAGLINES) are gone; navigation unchanged.
- `LibraryResumeCard` still renders between TabBar and content when an active session exists.
- Section labels "FÖR ER SOM PAR" / "FÖR BARN · FÖR FAMILJEN" are gone.

## Out of scope

Ticket 3 preview strip; all other files; data fetching; kids tile internal progress bar.
