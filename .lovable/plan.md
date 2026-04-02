

## Move count into progress, remove "X samtal om" label

The "X samtal om" label clutters the tile. Instead, move the count into the progress indicator text — "0/4 samtal" — and remove the label entirely. Also revert the 5 grammar-adjusted category titles since they were only changed to flow after "samtal om".

### File 1: `src/components/KidsProductHome.tsx`

**Remove** the "samtal om" `<span>` (lines 277–288).

**Update progress text** (line 333): `{completed}/{total}` → `{completed}/{total} samtal`

**Revert titles** in data files (see File 3 below).

### File 2: `src/components/CategoryTileGrid.tsx`

**Remove** the "samtal om" `<span>` (lines 184–195).

**Update progress text** (line 255): `{completed}/{totalCards}` → `{completed}/{totalCards} samtal`

### File 3: Revert category titles

| File | Current | Restored |
|------|---------|----------|
| `syskonkort.ts` | `Att bli syskon` | `Vi blev syskon` |
| `syskonkort.ts` | `Att vara olika` | `Vi är olika` |
| `jag-i-varlden.ts` | `Vad jag tror på` | `Vad tror jag på` |
| `vardagskort.ts` | `Livet utanför hemmet` | `Utanför hemmet` |
| `still-us-mock.ts` | `Oss tillsammans` | `Tillsammans` |

### Unchanged
- Product-level merged subtitle, tile layout/images/animations, progress bar visual, all protected patterns

