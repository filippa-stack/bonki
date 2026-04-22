

## Filter-aware empty state — Par variant swaps in

Single-file edit to `src/pages/Journal.tsx`. Wraps the empty-state branch in an IIFE that picks a `copy` object based on `activeFilters`, then threads `copy.*` and `getProductAccent(copy.productId)` through Acts 1, 2, and the closing.

### Edit 1 — Open IIFE + define `copy` + resolve `accent` (line 1114)

Replace:

```tsx
) : (isEmpty && !hasRenderedContent.current) ? (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
```

with the IIFE opener from the prompt — declares `emptyVariant` (`'par'` only when `activeFilters.size === 1 && activeFilters.has('par')`, else `'barn'`), defines the `par` and `barn` copy objects verbatim from the prompt (heroLine, heroSub, act2Lead, act2Sub, productId, productName, closingSub, four `rows`), then `const accent = getProductAccent(copy.productId);` and the original wrapper `<div style={{ flex: 1, ... }}>` opens after `return (`.

### Edit 2 — Act 1 hero uses `copy` (lines 1129–1131, 1144)

- Replace the hardcoded `Det första de säger.<br />Och <em>allt</em> de säger sen.` inside the `<h2>` with `{copy.heroLine}`.
- Replace the hardcoded `Varje svar sparas här. Om tre månader eller tre år kan du bläddra tillbaka och se ditt barn växa.` inside the `<p>` with `{copy.heroSub}`.

### Edit 3 — Act 2 heading uses `copy` (lines 1160, 1172)

- Replace `En röst som <em>växer</em>.` with `{copy.act2Lead}`.
- Replace `Olika frågor, olika år. Ett barn som blir sig själv framför dig.` with `{copy.act2Sub}`.

### Edit 4 — Exempel pill uses outer `accent` (lines 1178–1200)

Collapse the inner IIFE that computed `jimAccent`. Replace the entire `{(() => { const jimAccent = getProductAccent('jag_i_mig'); return (<div ...>Exempel</div>); })()}` with a single `<div>` using the outer `accent` variable for `background: ${accent.light}1F`, `border: 0.5px solid ${accent.light}59`, and `color: accent.light`. Identical layout otherwise.

### Edit 5 — Timeline rows come from `copy.rows` (lines 1214–1252)

- Replace the inline four-row array with `{copy.rows.map((row, idx) => { ... })}`.
- Delete `const accent = getProductAccent('jag_i_mig');` inside the map (the outer `accent` is in scope).
- Each `row` no longer has `dotOpacity`; use `row.opacity` for both card opacity and dot/year-label opacity (the four rows in `copy.rows` use the single `opacity` field, matching the prompt's row data).

### Edit 6 — Card uses `copy.productId` and `copy.productName` (lines 1319, 1321, 1346)

- `PRODUCT_ILLUSTRATION['jag_i_mig']` → `PRODUCT_ILLUSTRATION[copy.productId]` in both the conditional and the `src`.
- `<span ...>Jag i Mig</span>` → `<span ...>{copy.productName}</span>`.
- All other styling (`accent.light` background tint, illustration position/opacity, serif `#E9C890` answer) is unchanged.

### Edit 7 — Closing sub uses `copy` (line 1406)

Replace `Ett samtal i taget. Ingen bakgrund att ta igen.` with `{copy.closingSub}`. The `Börja nu så finns det sen.` headline and `Så börjar det →` button stay identical across both variants (button still wired to `navigate('/')`).

### Edit 8 — Close the outer IIFE (line 1432–1433)

Replace:

```tsx
          </div>
        </div>
      ) : (
```

with:

```tsx
          </div>
        </div>
        );
      })() : (
```

### Variant selection rules

| `activeFilters` state | Variant |
|---|---|
| `{'barn', 'par'}` (Alla) | `barn` |
| `{'barn'}` | `barn` |
| `{'par'}` | `par` |

`Alla` ≡ `Barn` for the empty state, per spec.

### Untouched (protected patterns)

- `(isEmpty && !hasRenderedContent.current)` condition + the ref pattern (still appears exactly twice in the file)
- Loading branch and populated branch
- Hero header (`Era samtal`), stats narrative, filter pills, `toggleFilter`, `setActiveFilters`
- Data-fetching `useEffect`, all `useMemo` blocks, `AnimatePresence mode="wait"`
- `getProductAccent` and `PRODUCT_ILLUSTRATION` definitions and existing `NoteEntryCard` usages
- No new imports, no `motion.*`, no new `useState`/`useEffect`/`useMemo`
- No `setActiveFilters` calls inside this branch
- No hardcoded hex for product tint — color resolution goes through `getProductAccent(copy.productId)`, so the Par preview matches the Vårt Vi library tile and populated cards exactly
- No `100dvh`, no `key={location.pathname}`
- No changes to `useSessionReflections.ts`, `CardView.tsx`, `useNormalizedSessionState.ts`, `SessionStepReflection.tsx`

### Post-edit verification

1. TypeScript compiles cleanly.
2. `getProductAccent` still appears multiple times (definition + `NoteEntryCard` + new outer-IIFE call).
3. `hasRenderedContent.current` still appears exactly twice.
4. Fresh user, default `Alla` → Barn variant: green Jag i Mig cards, "Det första de säger…", "En röst som växer.", "Ingen bakgrund att ta igen."
5. Tap `Par` → blue Vårt Vi cards (same blue as library tile), Vårt Vi illustration, "Ni pratar varje dag. Men ni skriver aldrig ner det.", "Versionen av er innan det blev självklart.", "Bara ni två, här." Four couples preview answers.
6. Tap `Barn` → swaps back to green/kids variant.
7. Tap `Alla` → Barn variant stays.
8. Complete one real reflection → populated timeline renders; toggling filters does not re-enter empty state.
9. `Så börjar det →` navigates to `/` in both variants.

