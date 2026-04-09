

## Journal Typography & Consistency — 4 Fixes

Single file: `src/pages/Journal.tsx`. Pure CSS only.

---

### Fix 1 — Narrative sentence (lines 1007–1011)

Current:
```
fontFamily: 'var(--font-serif)',
fontStyle: 'italic',
fontSize: '15px',
color: 'rgba(245, 240, 232, 0.5)',
```

Change to:
```
fontFamily: 'var(--font-sans)',
fontSize: '15px',
fontWeight: 500,
color: 'rgba(245, 240, 232, 0.7)',
```
(Remove `fontStyle: 'italic'` entirely.)

---

### Fix 2 — Remove italic from question text

**NoteEntryCard** (line 314): Remove `fontStyle: 'italic'` from the question `<p>` style.

**SessionGroupCard** (line 511): Remove `fontStyle: 'italic'` from the question `<p>` style.

---

### Fix 3 — Card titles uppercase

**NoteEntryCard** card name `<p>` (line 289): Add `textTransform: 'uppercase'` and `letterSpacing: '1px'`.

**SessionGroupCard** card name `<p>` (line 491): Add `textTransform: 'uppercase'` and `letterSpacing: '1px'`.

---

### Fix 4 — Month header uppercase check

Line 1142: Already clean — no `textTransform` present. No change needed.

