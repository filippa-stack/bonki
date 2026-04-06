

## Fix: Toast Stacking in CardView

### Problem
The "Vi sparar så fort vi kan" toast stacks on every step advancement because each call to `toastOnce` creates a new Sonner toast instance (the 3s debounce allows new ones through). Multiple toasts pile up at the bottom of the screen.

### Fix
Add a fixed `id` to both retry toasts in `src/pages/CardView.tsx` so Sonner **replaces** the existing toast instead of stacking a new one.

### Changes

**File: `src/pages/CardView.tsx`**

1. **Line 752-754** — Add fixed `id: 'step-retry'`:
```typescript
toastOnce('step_retry', () =>
  toast('Vi sparar så fort vi kan. Fortsätt bara.', { id: 'step-retry', duration: 2500 })
);
```

2. **Line 871-881** — Add fixed `id: 'step-error'`:
```typescript
toastOnce('step_retry', () =>
  toast('Något gick fel. Försök igen.', {
    id: 'step-error',
    duration: 4000,
    style: {
      background: 'var(--surface-base)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
    },
  })
);
```

### Not changed
Session creation, completion logic, navigation, resume banner, auth, paywall.

