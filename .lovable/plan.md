

## Change 4c — Still Us pill content: replace sparkle with Ghost Glow lock

**Single file**: `src/components/ProductLibrary.tsx`

### Change

Replace lines 1136–1140 (the three non-purchased branches of the Still Us pill content ternary):

**From:**
```tsx
: suShowFreeLabel
  ? `✦ ${totalCards} samtal · Prova först`
  : suFreeCompleted
    ? '✦ Ert första samtal ✓'
    : `✦ ${totalCards} samtal`}
```

**To:**
```tsx
: suShowFreeLabel
  ? <><span style={{ fontSize: '12px', color: 'white' }}>✦</span> Första gratis · {totalCards} samtal</>
  : suFreeCompleted
    ? <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 3px rgba(212,245,192,0.7)) drop-shadow(0 0 6px rgba(212,245,192,0.4))' }}><rect x="2" y="6.5" width="10" height="6.5" rx="1.5" fill="rgba(212,245,192,0.5)" stroke="#D4F5C0" strokeWidth="0.75" /><path d="M4.5 6.5V4.5C4.5 3.12 5.62 2 7 2C8.38 2 9.5 3.12 9.5 4.5V6.5" stroke="#D4F5C0" strokeWidth="1.5" strokeLinecap="round" /></svg> {totalCards} samtal</>
    : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 3px rgba(212,245,192,0.7)) drop-shadow(0 0 6px rgba(212,245,192,0.4))' }}><rect x="2" y="6.5" width="10" height="6.5" rx="1.5" fill="rgba(212,245,192,0.5)" stroke="#D4F5C0" strokeWidth="0.75" /><path d="M4.5 6.5V4.5C4.5 3.12 5.62 2 7 2C8.38 2 9.5 3.12 9.5 4.5V6.5" stroke="#D4F5C0" strokeWidth="1.5" strokeLinecap="round" /></svg> {totalCards} samtal</>}
```

Uses the **Ghost Glow green** lock SVG (same as Change 3 kids tiles): `fill="rgba(212,245,192,0.5)"`, `stroke="#D4F5C0"`, dual drop-shadow glow `rgba(212,245,192, 0.7/0.4)`.

The `isPurchased` branches (lines 1132–1135) remain untouched.

