

## Journal cards — premium visual upgrade

### Design critique of current state

The screenshots show flat, monochrome rectangles that feel disconnected from the library's rich, layered aesthetic. Three specific issues:

1. **Flat backgrounds** — solid `accent.mid` with no depth. The library tiles have gradient scrims, illustrations, and backdrop-blur pills. The journal cards feel like colored post-its.
2. **Question text unreadable** — `accent.deep` on `accent.mid` produces poor contrast on several products (especially Vårt Vi blue-on-blue and Jag i Mig teal-on-teal).
3. **No elevation** — cards sit flush against the dark background with no shadow or separation, making the page feel flat.

### Changes (all in `src/pages/Journal.tsx`, rendering only)

**Both `NoteEntryCard` and `SessionGroupCard`:**

| Element | Current | New |
|---|---|---|
| Background | Flat `accent.mid` | Subtle gradient: `linear-gradient(135deg, ${accent.mid}, ${accent.deep}cc)` — diagonal warmth, echoes library scrim |
| Top bar | 2px horizontal `accent.deep` | Remove. Replace with 3px **left vertical stripe** in `accent.light` — editorial, premium |
| Box shadow | None | `0 2px 12px rgba(0,0,0,0.25), 0 0 0 0.5px ${accent.deep}33` — subtle lift |
| Border | `0.5px solid ${accent.deep}44` | Remove (shadow handles separation) |
| Question text `—` | `accent.deep` (unreadable) | `${LANTERN_GLOW}73` — standard question opacity from brand spec |
| Product name | `LANTERN_GLOW` solid | Add `letterSpacing: '0.04em'` for premium feel |
| "Visa alla" / "Läs mer" | `${LANTERN_GLOW}88` / `aa` | `${LANTERN_GLOW}60` — standard interactive opacity |
| Takeaway label "Ni bar med er" | `${accent.mid}dd` (invisible on gradient) | `${LANTERN_GLOW}55` |
| Takeaway block bg | `${accent.deep}33` | `rgba(0,0,0,0.15)` — works on any gradient |
| Border radius | `16px` | `14px` — tighter, matching library tile feel |

**`CompletedMarkerRow`** — no changes.

**Visual result:** Cards go from flat colored blocks to rich, layered surfaces with diagonal gradients, left accent stripes, and soft elevation — the same visual language as the library tiles but adapted for text-heavy content.

### What stays untouched
- All data fetching, queries, filters, timeline logic
- All protected refs (`suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave.current)`, `hasSyncedRef`)
- Spine, month markers, pulse card, bookmarks
- `getProductAccent` function and fallback logic

### Files changed
- `src/pages/Journal.tsx` — inline styles in `NoteEntryCard` and `SessionGroupCard` only

