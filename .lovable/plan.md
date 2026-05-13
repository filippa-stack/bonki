## Vårt Vi content update — CONTENT_VERSION 14 → 15

Two files edited. Mechanical search-replace, no logic changes.

### 1. `src/data/content.ts`

Bump version:
- Line 4: `CONTENT_VERSION = 14` → `15`

Replace `sections[0].prompts` for these 7 cards (full 4-prompt array, in order, as specified in the message):
- `thoughtful-space` (lines 165–170) — prompt 4 shortened (drop trailing "Och vad skulle det kosta..." clause)
- `self-esteem-wavering` (lines 180–186) — prompt 1: "rum" → "sammanhang"
- `smallest-we` (lines 196–202) — prompt 1: "vårt liv" → "vår relation"
- `facing-adversity` (lines 228–234) — prompt 4 expanded with "exempelvis…" clause
- `adrift` (lines 260–266) — "begär" → "begär/lust"; "ditt begär" → "din lust"; "närat" → "närt"
- `parenting-boundaries` (lines 325–329) — prompt 3 rephrased
- `different-parenting-styles` (lines 341–345) — prompt 4 simplified

### 2. `src/data/gorExercises.ts`

Replace `instructionText` only on 4 entries (titles + cardId untouched):
- `smallest-we` (line 51) — trailing sentence rephrased to "Bestäm en tidpunkt att stämma av om två veckor."
- `when-life-tilts` (line 81) — same content, now formatted with `\n1. … \n2. … \n3. …` numbered list
- `parenting-boundaries` (line 91) — "sessionen" → "samtalet"
- `parenting-exhaustion` (line 101) — adds comma after "om"

### Out of scope
No title/subtitle changes. No category re-bucketing. No reordering. No other cards touched. No component or styling changes.