

## Flicker Fix Round 3 — Three files

### 1. `src/components/NextActionBanner.tsx`
**Line 92**: `initial={{ opacity: 0, y: 10 }}` → `initial={{ opacity: 1, y: 0 }}`

### 2. `src/pages/CardView.tsx` — 14 elements across 3 blocks

**Start/threshold screen (lines 1940–2153)** — 9 elements:
- Line 1940: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 1952: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 1987: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 2005: `initial={{ opacity: 0, y: 10 }}` → `initial={{ opacity: 1, y: 0 }}`
- Line 2023: `initial={{ opacity: 0, y: 6 }}` → `initial={{ opacity: 1, y: 0 }}`
- Line 2047: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 2064: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 2092: `initial={{ opacity: 0, y: 8 }}` → `initial={{ opacity: 1, y: 0 }}`
- Line 2153: `initial={{ opacity: 0, y: 10 }}` → `initial={{ opacity: 1, y: 0 }}`

**Prompt crossfade wrappers** — 3 elements (use `initial={false}` to skip first-mount animation but preserve prompt-to-prompt crossfade):
- Line 2570: `initial={{ opacity: 0 }}` → `initial={false}`
- Line 2812: `initial={{ opacity: 0 }}` → `initial={false}`
- Line 3138: `initial={{ opacity: 0, y: 8 }}` → `initial={false}`

**Reflection wrappers** — 2 elements:
- Line 3347: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`
- Line 3437: `initial={{ opacity: 0 }}` → `initial={{ opacity: 1 }}`

### 3. `src/components/ProductLibrary.tsx` — 2 variant triggers

- Line 671: `initial="hidden"` → `initial={false}` (tile grid)
- Line 817: `initial="hidden"` → `initial={false}` (era samtal section)

### Protected patterns — untouched
- `prevServerStepRef.current`, `suppressUntilRef`, `clearTimeout(pendingSave.current)`, `hasSyncedRef`
- No `AnimatePresence mode="wait"` blocks removed — only `initial` props changed on children
- All `whileHover`, `whileTap`, `exit` props preserved

### Technical detail
`initial={false}` on prompt crossfade elements: first render shows content immediately. When `key` changes (prompt navigation), `AnimatePresence` still runs the exit → enter cycle using `initial`/`animate`/`exit` variants. This is the same pattern already working in `KidsCardPortal.tsx`.

