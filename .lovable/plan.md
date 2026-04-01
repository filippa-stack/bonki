

## Premium Session Grouping in Journal

### Overview
Group reflections sharing the same `sessionId` into a single "session envelope" card, replacing N separate `NoteEntryCard` instances with one cohesive block that includes all reflections + takeaway.

### Visual Design

```text
┌─────────────────────────────────┐
│ ▔▔▔▔▔▔▔▔▔▔  (2px accent bar)   │
│                                 │
│  Jag i Mig            idag      │
│  Arg                            │
│                                 │
│  "slåss"                        │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │
│  "grrrrrr"                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─        │
│  "dåligt"                       │
│                                 │
│  Visa alla (7)                  │
│                                 │
│  ┌─ NI BAR MED ER ────────┐    │
│  │ takeaway text           │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

- 2px accent bar (product `tileMid` at 40%)
- Product name (accent.light, left) + relative date (right)
- Card name below in muted text
- Reflections in serif italic, separated by gradient `1px` dividers
- Collapse after 3 reflections, "Visa alla (N)" toggle
- Takeaway at bottom with small-caps label + tinted background (`tileDeep` at 8%)
- Single card replaces all individual cards from that session

### Changes (1 file: `src/pages/Journal.tsx`)

**1. Add grouping step after `visibleItems` computation (~line 572-599)**

After filtering visible items, group consecutive `NoteEntry` items by `sessionId`. Sessions with 2+ notes become a `SessionGroup`; solo notes render as before.

```ts
interface SessionGroup {
  sessionId: string;
  notes: NoteEntry[];       // regular reflections
  takeaway: NoteEntry | null; // entry with id starting 'takeaway-'
  productId: string;
  cardId: string;
  cardName: string;
  categoryName: string;
  date: string;
}
```

**2. New inline component: `SessionGroupCard`**

Renders the envelope. Accepts a `SessionGroup` and `navigate`. Uses same styling tokens as `NoteEntryCard` (same `#2E3142` background, same accent logic). Internal state: `expanded` boolean for "Visa alla".

**3. Update month group rendering (~line 855)**

When rendering items, check if item belongs to a group. Render `SessionGroupCard` for groups, `NoteEntryCard` for solo notes, `CompletedMarkerRow` for markers.

### What stays untouched
- Data fetching (sessions, takeaways, reflections queries)
- Filter chips, pulse card, bookmarks section
- Empty sessions collapsible
- `NoteEntryCard` (still used for solo notes)
- `CompletedMarkerRow`
- All palette/token imports

