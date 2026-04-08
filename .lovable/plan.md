

## Fix: BottomNav floating mid-screen on iPhone PWA

### Root cause

The BottomNav uses Tailwind's `fixed bottom-0` which sets `bottom: 0`. On iOS PWA standalone mode, `position: fixed` can misbehave when:

1. **`backdropFilter` / `-webkit-backdrop-filter`** creates an implicit compositing layer that iOS sometimes mispositions
2. The safe-area inset is applied only as `paddingBottom` but not factored into the actual `bottom` position

### Fix (single file: `src/components/BottomNav.tsx`)

**Change 1 — Move all positioning to inline `style` to avoid Tailwind/iOS conflicts:**

Replace:
```tsx
className="fixed bottom-0 left-0 right-0 z-40"
style={{
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: 'none',
  boxShadow: 'none',
}}
```

With:
```tsx
className="z-40"
style={{
  position: 'fixed',
  bottom: '0px',
  left: '0px',
  right: '0px',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: 'none',
  boxShadow: 'none',
  WebkitTransform: 'translateZ(0)',
  transform: 'translateZ(0)',
}}
```

**Key additions:**
- `transform: translateZ(0)` — forces GPU compositing, which fixes iOS Safari's fixed-position miscalculation in standalone PWA mode. This is the standard workaround for iOS treating `position: fixed` elements incorrectly in standalone/fullscreen contexts.
- Moving `position`, `bottom`, `left`, `right` to inline styles ensures no Tailwind class-order conflicts on iOS WebKit.

### Why this works

iOS standalone PWA mode uses a different viewport model than Safari tabs. The `translateZ(0)` hack promotes the element to its own compositing layer, preventing iOS from miscalculating the fixed positioning. This is a well-documented iOS WebKit workaround.

### No other files changed

No `100dvh` used. No parent transforms introduced. Single file edit.

