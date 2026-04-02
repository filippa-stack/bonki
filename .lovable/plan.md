

## Fix: Remove dead space between logo and "Utvecklat av psykolog"

**File**: `src/components/Onboarding.tsx`

### The problem
The content section (line 88) has `flex: '1 1 auto'` which makes it absorb all remaining vertical space, pushing the credential text far below the illustration. Combined with `justifyContent: 'flex-end'`, the text stacks at the bottom of this expanded section — but the gap above it is huge.

### The fix
**Line 88**: Change `flex: '1 1 auto'` → `flex: '0 0 auto'`

This makes the content section only take the space it needs. The parent container's `justifyContent: 'flex-end'` will naturally pack illustration + content + tiles + CTA toward the bottom of the screen with no dead space between them.

### Unchanged
Everything else — illustration, tiles, CTA, all logic/state/tracking.

