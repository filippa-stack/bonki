

## Journal Visual Polish — 3 Changes in `src/pages/Journal.tsx`

No data fetching, filtering, grouping, or session logic modified. Single file only.

---

### Change 1 — Replace stats grid with narrative sentence (lines 988–1054)

Remove the entire stats row div (three columns: Reflektioner / Samtal / Månader with gold numbers). Replace with:

```tsx
<p style={{
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: '15px',
  color: 'rgba(245, 240, 232, 0.5)',
  textAlign: 'center',
  marginTop: '8px',
  padding: '0 24px',
}}>
  {heroStats.reflectionCount} reflektioner från {heroStats.sessionCount} samtal{pulseData ? ` sedan ${pulseData.monthLabel}` : ''}.
</p>
```

Uses existing `heroStats` and `pulseData.monthLabel` — no new data needed.

---

### Change 2 — Soften filter pills (lines 1058–1109)

For all three buttons (Alla, Barn, Par):
- `height: '28px'` → `'36px'`
- Remove `textTransform: 'uppercase'`
- Remove `letterSpacing: '0.06em'`
- `fontSize: '11px'` → `'13px'`
- `borderRadius: '16px'` → `'20px'`
- Inactive border: `'0.5px solid rgba(245, 240, 232, 0.12)'` → `'0.5px solid transparent'`
- Active state styling stays exactly as-is

---

### Change 3 — Upgrade card styling

**NoteEntryCard** (lines 242–363):
- `borderRadius: '16px'` → `'22px'`
- Add `boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)'`
- `border` → `'1px solid rgba(255, 255, 255, 0.06)'`
- Remove the "Top color bar" div (lines 253–260)
- `padding: '0 16px 14px'` → `'18px 18px 16px'`

**SessionGroupCard** (lines 438–573):
- `borderRadius: '16px'` → `'22px'`
- Add `boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)'`
- `border` → `'1px solid rgba(255, 255, 255, 0.06)'`
- Remove the "Top accent bar" div (lines 448–452)
- Adjust header padding since top bar is gone (the `padding: '16px 16px 0'` on the header div stays, it just no longer sits below the bar)

