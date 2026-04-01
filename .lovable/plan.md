

## Improve Journal/Archive Text Visibility

### Problem
Dates, card names, month headers, and metadata text use `DRIFTWOOD` with heavy opacity suffixes (`77`, `88`, `66`, `aa`), making them nearly invisible on the dark `#2E3142` / `MIDNIGHT_INK` backgrounds.

### Changes (1 file: `src/pages/Journal.tsx`)

**Boost opacity on all metadata text across 4 component contexts:**

**1. `NoteEntryCard` (lines 200–323)**
- Date: `${DRIFTWOOD}77` → `${DRIFTWOOD}cc` (line 314)
- Card name: `${DRIFTWOOD}88` → `${DRIFTWOOD}bb` (line 318)
- Question text: `${DRIFTWOOD}cc` → `${LANTERN_GLOW}88` (line 294)

**2. `SessionGroupCard` (lines 390–517)**
- Date: `${DRIFTWOOD}77` → `${DRIFTWOOD}cc` (line 425)
- Card name: `${DRIFTWOOD}88` → `${DRIFTWOOD}bb` (line 429)
- Expand toggle: `${DRIFTWOOD}99` → `${DRIFTWOOD}cc` (line 470)
- Dividers: `${DRIFTWOOD}22` / `11` → `${DRIFTWOOD}33` / `22` (line 442)
- Takeaway label: `${accent.mid}b3` → `${accent.mid}dd` (line 497)

**3. `CompletedMarkerRow` (lines 327–371)**
- Date: `${DRIFTWOOD}66` → `${DRIFTWOOD}aa` (line 367)
- Separator dot: `${DRIFTWOOD}88` → `${DRIFTWOOD}bb` (line 361)

**4. Month headers (lines 1039–1053)**
- Month label: `${DRIFTWOOD}aa` → `${LANTERN_GLOW}88` (line 1045) — switch to Lantern Glow for better contrast
- Divider line: `${DRIFTWOOD}33` → `${DRIFTWOOD}55` (line 1051)

**5. Pulse card (lines 966–1004)**
- "Senast" line: `${DRIFTWOOD}cc` → `${LANTERN_GLOW}88` (line 983)
- Product count: `${DRIFTWOOD}88` → `${DRIFTWOOD}bb` (line 1000)

**6. Subtitle**
- Subtitle: `${DRIFTWOOD}cc` → `${LANTERN_GLOW}77` (line 894)

### What stays untouched
- All data fetching, grouping, filtering logic
- Layout, spacing, border-radius, animations
- Font families, font sizes, font weights
- Color bar accent logic
- Primary text (reflection content) — already uses `LANTERN_GLOW`

