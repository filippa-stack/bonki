

## Fix Date Visibility in Journal

### Problem
Dates still use `${DRIFTWOOD}cc` (`#6B5E52` at 80%) — a brown tone that barely registers against the dark `#2E3142` card backgrounds. Per the project's design system, all supporting text should use Lantern Glow (`#FDF6E3`).

### Changes (1 file: `src/pages/Journal.tsx`)

Switch every date instance from `${DRIFTWOOD}cc` to `${LANTERN_GLOW}77` (Lantern Glow at ~47% opacity — visible but clearly secondary to the product name):

| Location | Line | Current | New |
|---|---|---|---|
| `NoteEntryCard` date | 238 | `${DRIFTWOOD}cc` | `${LANTERN_GLOW}77` |
| `SessionGroupCard` date | 425 | `${DRIFTWOOD}cc` | `${LANTERN_GLOW}77` |
| `CompletedMarkerRow` date | 367 | `${DRIFTWOOD}aa` | `${LANTERN_GLOW}66` |
| `CompletedMarkerRow` card text | 354 | `${DRIFTWOOD}cc` | `${LANTERN_GLOW}77` |
| `CompletedMarkerRow` separator | 361 | `${DRIFTWOOD}bb` | `${LANTERN_GLOW}55` |
| Card name (`NoteEntryCard`) | 242 | `${DRIFTWOOD}bb` | `${LANTERN_GLOW}55` |

This aligns with the existing memory: "Lantern Glow for all supporting text on dark backgrounds."

### What stays untouched
- All logic, data fetching, grouping
- Font sizes, weights, layout
- Product name colors (already use `accent.light`)
- SessionGroupCard card name (already `${LANTERN_GLOW}55`)

