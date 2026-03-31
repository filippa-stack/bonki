

## Fix: "Era samtal" (SavedConversations) Entrance Flicker

### Root cause
Same pattern as the completion page flicker fixed earlier — mount-based `initial={{ opacity: 0 }}` and stagger delays cause a visible flash-to-content on navigation.

### Changes — 1 file

**`src/pages/SavedConversations.tsx`**

1. **Line 3**: Remove the `BEAT_1` import (no longer needed)
2. **Line 24-26**: Empty state — change `initial={{ opacity: 0 }}` to `initial={false}` and remove `animate={{ opacity: 1 }}`
3. **Lines 55-59**: Conversation cards — change `initial={{ opacity: 0, y: 8 }}` to `initial={false}`, remove `animate={{ opacity: 1, y: 0 }}`, remove `transition={{ delay: index * BEAT_1 }}`

Content renders immediately with no entrance animation, consistent with the app-wide animation-mount-policy.

### No other files modified

