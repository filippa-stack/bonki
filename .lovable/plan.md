

## Journal — Replace Driftwood + Remove Privacy Toggle

**File:** `src/pages/Journal.tsx`

### Change 1: Replace all DRIFTWOOD color usages

Keep the `DRIFTWOOD` import (other files may use it). Replace every instance where it's used as a color value:

| Line | Current | Replacement | Category |
|------|---------|-------------|----------|
| 475 | `${DRIFTWOOD}33` / `${DRIFTWOOD}22` | `rgba(253,246,227,0.13)` / `rgba(253,246,227,0.09)` | Divider gradient (tertiary) |
| 954 | `${LANTERN_GLOW}77` on subtitle | `rgba(253,246,227,0.4)` | Page subtitle "Vad ni burit med er" |
| 969 | `${DRIFTWOOD}44` border | `rgba(253,246,227,0.17)` | Filter chip inactive border |
| 971 | `${DRIFTWOOD}aa` text | `rgba(253,246,227,0.55)` | Filter chip inactive text |
| 988 | `${DRIFTWOOD}44` border | `rgba(253,246,227,0.17)` | Filter chip inactive border |
| 990 | `${DRIFTWOOD}aa` text | `rgba(253,246,227,0.55)` | Filter chip inactive text |
| 1007 | `${DRIFTWOOD}33` | `rgba(253,246,227,0.13)` | Loading skeleton |
| 1053 | `DRIFTWOOD` (full) | `rgba(253,246,227,0.65)` | Pulse card linked card name (interactive) |
| 1056 | `${DRIFTWOOD}44` underline | `rgba(253,246,227,0.17)` | Pulse card underline |
| 1064 | `${DRIFTWOOD}dd` | `rgba(253,246,227,0.45)` | Pulse card metadata "I X olika..." (tertiary) |
| 1115 | `${DRIFTWOOD}55` | `rgba(253,246,227,0.2)` | Month header divider line |
| 1147 | `${DRIFTWOOD}aa` | `rgba(253,246,227,0.45)` | Empty sessions header text (tertiary) |
| 1154 | `${DRIFTWOOD}88` | `rgba(253,246,227,0.35)` | Empty sessions chevron |
| 1174 | `DRIFTWOOD` (full) | `rgba(253,246,227,0.6)` | Empty session card name (secondary) |
| 1175 | `${DRIFTWOOD}99` | `rgba(253,246,227,0.45)` | Empty session date (tertiary) |
| 1195 | `${DRIFTWOOD}88` | `rgba(253,246,227,0.35)` | Bookmark icon |
| 1198 | `${DRIFTWOOD}aa` | `rgba(253,246,227,0.45)` | "Sparade frågor" header (tertiary) |
| 1204 | `${DRIFTWOOD}33` | `rgba(253,246,227,0.13)` | Bookmark divider line |
| 1236 | `${DRIFTWOOD}99` | `rgba(253,246,227,0.45)` | Bookmark card subtitle (tertiary) |
| 1241 | `${DRIFTWOOD}66` | `rgba(253,246,227,0.3)` | Bookmark chevron icon |

### Change 2: Remove privacy toggle

**Delete lines 1071–1097** — the entire `{showParPrivacy && (...)}` block (Par Privacy Row).

**Delete line 579** — `const [parExpanded, setParExpanded] = useState(true);`

**Delete line 913** — `const showParPrivacy = ...;`

**Remove `parExpanded` from filtering logic** (lines 790, 797, 805):
- Line 790: delete `if (isPar && bothActive && !parExpanded) return;`
- Line 797: delete `if (bothActive && !parExpanded) return;`
- Line 805: remove `parExpanded` from the useMemo dependency array

Still Us sessions will always render when "Föräldrar" or "Alla" filter is active.

Also remove unused `ChevronDown` from imports (line 7) if no other usage remains — but it's still used in the empty sessions collapsible (line 1156), so keep it.

### Not changed
- Filter chips logic, golden reflection color (#E9C890), data fetching, session grouping, expand/collapse within session cards, any other file

