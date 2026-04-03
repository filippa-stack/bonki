

## Fix "Föregående" Back Button on Completion Page

**File:** `src/pages/CardView.tsx`

### Root cause
The auto-completion effect (line 392) re-sets `showCompletion = true` immediately after the user dismisses it, because the session no longer exists in the database.

### Changes

**1. Add ref** (line 431, next to `hasRenderedContent`):
```tsx
const userDismissedCompletion = useRef(false);
```

**2. Reset on card change** (line 432-435, existing effect):
```tsx
useEffect(() => {
  eagerSessionRef.current = false;
  hasRenderedContent.current = false;
  userDismissedCompletion.current = false;
}, [cardId]);
```

**3. Guard auto-completion effect** (line 392):
Add `&& !userDismissedCompletion.current` to the condition.

**4. Set ref before each `_setShowCompletion(false)`** — 4 instances at lines 1361, 1619, 1686, 1736:
Add `userDismissedCompletion.current = true;` before each `_setShowCompletion(false);` call.

### Not changed
- Completion RPC logic, step restoration in handlers, suppressUntilRef, AnimatePresence, any other file.

