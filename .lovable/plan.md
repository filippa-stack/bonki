

## Session Page Visual Polish (4 changes)

**File:** `src/pages/CardView.tsx` — all changes inside the kids live session block (line 2833+)

### Change 1: Progress bar height
Line 2955: `height: '3px'` → `'4px'`

No condition is hiding the bar on question 1 — it's already visible. Just increase height for more presence.

### Change 2: Question counter
After line 2964 (closing `</div>` of progress bar), insert:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  fontWeight: 500,
  color: '#FDF6E3',
  opacity: 0.35,
  textAlign: 'center',
  margin: '8px 0 0',
  letterSpacing: '0.03em',
}}>
  {localPromptIndex + 1} av {totalPrompts}
</p>
```

### Change 3: Always show note nudge text
Line 2897: `const showFullNudge = localPromptIndex <= 1 || kidsNoteInteractedRef.current;` → `const showFullNudge = true;`

### Change 4: More visible back arrow
Line 3198: `opacity: 0.7` → `0.55` — wait, it's already `0.7`. The prompt says increase from `0.35` to `0.55`, but it's currently `0.7`. Since `0.7` is already more visible than the target `0.55`, no opacity change needed. Keep `size={20}` as-is (already 20).

**Correction**: The back arrow is already at `opacity: 0.7` and `size={20}`, which exceeds the requested targets. No change needed for Change 4.

### Summary of actual edits
1. Line 2955: height `'3px'` → `'4px'`
2. After line 2964: insert question counter `<p>`
3. Line 2897: `showFullNudge = true`
4. No change needed (already meets spec)

### Not changed
- Progress fraction calc, advance/back handlers, AnimatePresence, note textarea/save logic, header bar, any other file

