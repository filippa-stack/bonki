## Vårt Vi refinements (combined)

Four scoped changes to the Adult Bonki product home: one layout bug fix, one edge-perception fix, plus title/category rewrites.

### 1. Fix unequal column widths in card grid

**Diagnosis (current state in `src/components/AdultProductHome.tsx` and `AdultProductCardTile.tsx`):**

- Grid container (line ~277): `gridTemplateColumns: '1fr 1fr'`, `gap: '16px'`, `width: '100%'` — already correct.
- Each cell is wrapped in `FilterableCardCell` (a `motion.div`) — has **no `min-width`, no `width`** set.
- `AdultProductCardTile` outer `<button>` has `width: '100%'` but **no `min-width: 0`**.
- Title `<span>` is a single block of nowrap-free text but uses `display: -webkit-box` with line-clamp — its intrinsic min-content width is the longest unbreakable token, which is fine, but combined with the absent `min-width: 0` on the grid item, long titles can push a cell above its `1fr` share.

This matches the symptom: right column wider than left when long-title cards land on the right.

**Fix — both changes required:**

In `AdultProductHome.tsx` `FilterableCardCell` `motion.div` style, add:
```ts
minWidth: 0,
width: '100%',
```
(merge with the existing `display`/`pointerEvents` style)

In `AdultProductCardTile.tsx` outer `<button>` style, add:
```ts
minWidth: 0,
```
(`width: '100%'` is already present)

`min-width: 0` overrides the CSS default `min-width: auto` that grid/flex items inherit, which is what allows 1fr to actually distribute equally regardless of content.

### 2. Card title/subtitle rewrites — `src/data/content.ts`

| Line | Field | New value |
|---|---|---|
| 245 | title | `Bakom kulisserna` (subtitle unchanged) |
| 287 | title | `När jag vacklar` (subtitle unchanged) |
| 350 | title | `Era värderingar` |
| 351 | subtitle | `Mina, dina och våra — i vardagliga val` |
| 371 | title | `Era traditioner` |
| 372 | subtitle | `Mina, dina och våra — vad ni för vidare` |

### 3. Category label shortening — `src/data/content.ts`

Current category titles in source order: `Ert minsta vi`, `Vardagen mellan er`, `Hur ni bär varandra`, `Det som skaver`, `Arvet ni delar`, `Vad ni står för`, `Vad ni satsar på`, `Nära varandra`, `Att välja varandra` (plus `Alla` prepended by the chip component).

Edits at lines 16, 23, 37, 58, 65:

| Current | New |
|---|---|
| `Vardagen mellan er` | `Vardagen` |
| `Hur ni bär varandra` | `Hur ni bär` |
| `Arvet ni delar` | `Arvet` |
| `Nära varandra` | `Närhet` |
| `Att välja varandra` | `Valet` |

Keep unchanged: `Ert minsta vi`, `Det som skaver`, `Vad ni står för`, `Vad ni satsar på`.

### 4. Dark-card edge definition — `src/components/AdultProductCardTile.tsx`

Change outer `<button>` boxShadow from:
```ts
boxShadow: '0 8px 24px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.08)',
```
to:
```ts
boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.08)',
```
Existing `border: '1px solid rgba(255,255,255,0.10)'` stays.

### What stays unchanged

- Two-zone tile composition, accent line, completion check, press state
- Filter chip underline component
- Routing, session, autosave logic
- Kids product home (entirely untouched)

### Files

- `src/components/AdultProductHome.tsx` — `min-width: 0` + `width: 100%` on `FilterableCardCell`
- `src/components/AdultProductCardTile.tsx` — `min-width: 0` on outer button + boxShadow update
- `src/data/content.ts` — 4 title rewrites, 2 subtitle rewrites, 5 category title shortenings

### Verification (390×844)

- Every row of the 2-column grid has equal-width cells regardless of title length (test row containing `Era värderingar` next to `Att säga ifrån`)
- Renamed cards display new titles/subtitles
- Filter row shows shortened categories; any overflow handled by existing right-edge mask-fade
- Dark cards (Midnight Ink, Storm Grey) have visible silhouettes matching warm cards
- Kids product home renders unchanged
