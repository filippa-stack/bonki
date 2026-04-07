

## Library tile ownership indicator + badge text update

### Changes in `src/components/ProductLibrary.tsx`

#### 1. Badge text — new three-state format

**PastelTile (line 437–439):** Change from current two-state to:
```typescript
{hideFreeBadge
  ? `✦ ${completedCount || 1} av ${totalCards ?? '?'} utforskade`
  : `✦ ${totalCards ?? '?'} samtal ✦ Första gratis${ageLabel ? ` · ${ageLabel}` : ''}`}
```

**Vårt Vi tile (line 1048):** Change from current two-state to:
```typescript
{suFreeCompleted ? `✦ ${suCount || 1} av ${totalCards} utforskade` : `✦ ${totalCards} samtal ✦ Första gratis`}
```

#### 2. Ghost Glow ownership sparkle on PastelTile

Add `isPurchased?: boolean` prop to PastelTile (line 237).

Inside the tile `<motion.div>` (after line 284, before the illustration), add:
```tsx
{isPurchased && (
  <div style={{
    position: 'absolute',
    top: '12px',
    right: '12px',
    fontSize: '18px',
    color: '#D4F5C0',
    textShadow: '0 0 8px #D4F5C0, 0 0 16px rgba(212, 245, 192, 0.4)',
    opacity: 0.85,
    pointerEvents: 'none',
    zIndex: 2,
  }}>✦</div>
)}
```

Tile container already has `position: 'relative'` (line 274) — no change needed.

#### 3. Ghost Glow sparkle on Vårt Vi tile

Same sparkle element added inside the Vårt Vi `<motion.div>` (after line 910 area), but only when `purchased.has('still_us')`. The tile already has `position: 'relative'` (line 907).

Needs to not conflict with the existing resume indicator at top-right — the resume indicator is at `top: 12px, right: 14px`. When there's an active session, skip the sparkle OR offset it. Simplest: only show sparkle when there's NO active session on that tile (the resume dot already signals ownership implicitly).

#### 4. Pass `isPurchased` to PastelTile calls

In the kids product tile loop (~line 1130), add:
```typescript
isPurchased={purchased.has(product.id)}
```

`purchased` is already available from `useAllProductAccess()` (line 454).

### Files changed
- `src/components/ProductLibrary.tsx` only

