

## Fix: Still Us time estimate → "ca 10–20 min"

**File: `src/pages/KidsCardPortal.tsx`** — line 49

```
// Before
case 'still-us':         return 'ca 15–30 min';

// After
case 'still-us':         return 'ca 10–20 min';
```

`SuIntroPortal.tsx` already says "ca 10–20 min" — no change needed there. Single line fix.

