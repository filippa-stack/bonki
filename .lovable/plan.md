

## Journal Visual Polish — Changes 4, 5 & 6

Single file: `src/pages/Journal.tsx`. No logic changes.

---

### Change 4 — Warm up month headers (~lines 1102–1124)

**Spine dot** (lines 1108–1109): `width`/`height` from `'9px'` → `'7px'`.

**Month label span** (lines 1114–1121):
- `fontSize`: `'10px'` → `'14px'`
- Remove `textTransform: 'uppercase'`
- `letterSpacing`: `'2px'` → `'0.02em'`
- `fontFamily`: `'var(--font-sans)'` → `'var(--font-display)'`
- `fontWeight` stays `500`

---

### Change 5 — Product creature illustration in SessionGroupCard

**Imports** (top of file): Add 7 illustration imports:
- `jimImage`, `jmaImage`, `jivImage`, `illustrationVardag`, `illustrationSyskon`, `illustrationSexualitet`, `illustrationStillUs`

**Constant map** (after imports): `PRODUCT_ILLUSTRATION: Record<string, string>` mapping product IDs to imported images.

**SessionGroupCard header** (line 444): Add `position: 'relative'` to the header div. After the date span (line 457), insert a conditionally rendered `<img>` with absolute positioning (`top: 14px`, `right: 14px`, `36×36px`, `borderRadius: 50%`, `opacity: 0.18`, `pointerEvents: 'none'`).

---

### Change 6 — Remove question text truncation

**NoteEntryCard** (lines 299–302): Remove `display: '-webkit-box'`, `WebkitLineClamp: 2`, `WebkitBoxOrient: 'vertical' as const`, and `overflow: 'hidden'` from the question `<p>` style. Keep fontSize, fontStyle, color, lineHeight.

**SessionGroupCard** (lines 482–485): Same four properties removed from the question `<p>` style. Keep all other styling.

