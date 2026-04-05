

## Match Month Header Dates to Hero Stats Color

**File:** `src/pages/Journal.tsx` — 2 lines

The hero stats (Reflektioner, Samtal, Månader) use `#E9C890`. The month headers currently use `rgba(253, 246, 227, 0.6)`. Update both the dot and label to `#E9C890`.

### Changes

**Line 1176 — Month dot:**
```
backgroundColor: 'rgba(253, 246, 227, 0.6)'  →  backgroundColor: '#E9C890'
```

**Line 1183 — Month label:**
```
color: 'rgba(253, 246, 227, 0.6)'  →  color: '#E9C890'
```

Nothing else changes.

