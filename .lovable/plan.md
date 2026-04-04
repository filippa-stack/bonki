

## Fix: Increase trust stat label visibility

**File:** `src/pages/Install.tsx`, line 236

The labels are at `rgba(212, 245, 192, 0.45)` — too faint on the dark background. Bump to `0.65` for clear readability while still being secondary to the numbers.

**Change:**
- Line 236: `color: 'rgba(212, 245, 192, 0.45)'` → `color: 'rgba(212, 245, 192, 0.65)'`

One color opacity change, nothing else.

