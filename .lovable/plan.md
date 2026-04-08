

## Emotional progress pills + heart ownership mockup

### Change 1: PastelTile badge (lines 431–456)

Replace the badge text and add Lantern Glow tint for "tried" state:

**Copy:**
- Non-purchased: `Första samtalet gratis · {age}`
- Tried (free done, not purchased): `Ert första samtal ✓`
- Purchased: `{X} samtal tillsammans`

**Styling:** The "tried" state gets `background: hsla(45, 80%, 92%, 0.15)` and `border: 1px solid hsla(45, 70%, 85%, 0.30)` — a subtle Lantern Glow warmth. Other states keep the current frosted white glass.

**Implementation:** Replace lines 431–456:
```tsx
{/* Progress pill */}
<span
  style={{
    display: 'inline-flex',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: '4px',
    marginTop: '8px',
    padding: '4px 12px',
    borderRadius: '20px',
    background: isPurchased
      ? 'hsla(0, 0%, 100%, 0.15)'
      : hideFreeBadge
        ? 'hsla(45, 80%, 92%, 0.15)'
        : 'hsla(0, 0%, 100%, 0.15)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: isPurchased
      ? '1px solid hsla(0, 0%, 100%, 0.25)'
      : hideFreeBadge
        ? '1px solid hsla(45, 70%, 85%, 0.30)'
        : '1px solid hsla(0, 0%, 100%, 0.25)',
    boxShadow: '0 0 12px hsla(0, 0%, 100%, 0.08), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
    fontFamily: "var(--font-body)",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    color: 'hsla(0, 0%, 100%, 0.92)',
  }}
>
  {isPurchased
    ? `${completedCount || 0} samtal tillsammans`
    : hideFreeBadge
      ? 'Ert första samtal ✓'
      : `Första samtalet gratis${ageLabel ? ` · ${ageLabel}` : ''}`}
</span>
```

### Change 2: Still Us badge (lines 1064–1079)

Same three-state logic using `purchased.has('still_us')` and `suFreeCompleted`:

```tsx
<span style={{
  fontFamily: "var(--font-body)",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  color: 'hsla(0, 0%, 100%, 0.9)',
  background: purchased.has('still_us')
    ? 'hsla(0, 0%, 100%, 0.15)'
    : suFreeCompleted
      ? 'hsla(45, 80%, 92%, 0.15)'
      : 'hsla(0, 0%, 100%, 0.15)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: purchased.has('still_us')
    ? '1px solid hsla(0, 0%, 100%, 0.25)'
    : suFreeCompleted
      ? '1px solid hsla(45, 70%, 85%, 0.30)'
      : '1px solid hsla(0, 0%, 100%, 0.25)',
  borderRadius: '20px',
  padding: '4px 12px',
  boxShadow: '0 0 12px hsla(0, 0%, 100%, 0.08), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
}}>
  {purchased.has('still_us')
    ? `${suCount || 0} samtal tillsammans`
    : suFreeCompleted
      ? 'Ert första samtal ✓'
      : `Första samtalet gratis`}
</span>
```

### Change 3: Heart ownership mockup

After implementing the pill changes, generate a PNG mockup showing the uploaded heart scribble (`omtänksamt_utrymme_cropped_copy.png` — the empty/outline heart) rendered as a white silhouette at ~20px in the top-right corner of a purchased tile, replacing the current ✦ sparkle. This is a visual comparison only, not a code change.

### Files changed
- `src/components/ProductLibrary.tsx` — pill copy + tried-state Lantern Glow tint in both PastelTile and Still Us tile
- `/mnt/documents/` — heart ownership mockup PNG (generated artifact)

