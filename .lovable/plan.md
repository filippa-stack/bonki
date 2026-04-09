

## Journal cards — warmth pass (match product homes)

### Summary
Remove the dark scrim overlay, switch all metadata text from `accent.light` to `LANTERN_GLOW` with `textShadow` for readability — matching how product home screens achieve warmth on saturated backgrounds. Keep `accent.light` only for the left stripe.

### Changes in `src/pages/Journal.tsx`

**Both `NoteEntryCard` and `SessionGroupCard`:**

**Background**: Remove `backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35))'`. Keep solid `accent.bg`.

**Box shadow**: Simplify from `0 2px 16px rgba(0,0,0,0.35), inset 0 1px 0 ${accent.light}12` to `0 2px 12px rgba(0,0,0,0.25)`.

**Text color mapping** (all switch from `accent.light` to `LANTERN_GLOW`):

| Element | New color | textShadow |
|---|---|---|
| Product name | `LANTERN_GLOW` | `0 1px 8px rgba(0,0,0,0.5)` |
| Card name | `${LANTERN_GLOW}cc` | `0 1px 6px rgba(0,0,0,0.4)` |
| Date | `${LANTERN_GLOW}88` | `0 1px 4px rgba(0,0,0,0.3)` |
| Question | `${LANTERN_GLOW}88` | `0 1px 4px rgba(0,0,0,0.3)` |
| Reflection text | `LANTERN_GLOW` (unchanged) | Keep `0 0 20px rgba(0,0,0,0.3)` |
| "Läs mer" / "Visa alla" | `${LANTERN_GLOW}77` | `0 1px 4px rgba(0,0,0,0.3)` |
| Takeaway label | `${LANTERN_GLOW}66` | `0 1px 3px rgba(0,0,0,0.3)` |
| Separator | `${LANTERN_GLOW}22` gradient | — |

**Left stripe**: Stays `accent.light` — the only accent-colored element, providing product identity.

### What stays untouched
- `getProductAccent` function, all data fetching, timeline logic, protected refs
- Spine, month markers, pulse card, bookmarks, CompletedMarkerRow

### Files changed
- `src/pages/Journal.tsx` — inline styles only

