

## Investigation: Screen "Jumping" During Navigation

### Root Cause

The `PageTransition.tsx` component calls `window.scrollTo(0, 0)` inside a `useLayoutEffect` with an empty dependency array (`[]`). This fires synchronously on every page mount — **before the enter animation even begins**.

Combined with `AnimatePresence mode="wait"` in `App.tsx` (line 97), the sequence is:

```text
1. User taps nav item
2. Current page plays EXIT fade (opacity 1→0, 220ms)
3. Old page unmounts
4. New page mounts → useLayoutEffect fires → window.scrollTo(0,0) INSTANTLY
5. New page plays ENTER fade (opacity 0→1, 220ms)
```

If the old page was scrolled down at all, step 4 causes a visible snap-to-top **during** the transition. The user sees the viewport lurch upward while content is still fading. This is the "jump".

### Why It's Worse in Demo Mode

Demo testers navigate freely between Library, Still Us, and Era samtal — all pages that can be scrolled. Every tab switch triggers the jump. In a normal flow users tend to stay on one page longer, so it's less noticeable.

### Additional Contributing Factor

The `BottomNav` is `position: fixed` with a gradient overlay. When pages have different heights or the BottomNav conditionally hides/shows (e.g., hidden during sessions, visible on product home), the content area shifts by ~56px + safe-area. This compounds the scroll-jump sensation.

### Fix (single file: `src/components/PageTransition.tsx`)

**Remove the `useLayoutEffect` scroll-to-top entirely.** Instead, let the scroll reset happen naturally via the route change — or move it to a `useEffect` (not layout effect) that fires **after** the enter animation completes, using `onAnimationComplete` from framer-motion.

Simpler approach: just delete the `useLayoutEffect` block. The `AnimatePresence mode="wait"` already unmounts the old page, so scroll position doesn't persist between routes anyway (the new page starts at top because it's a fresh DOM subtree with `minHeight: 100dvh`).

If scroll-to-top is still needed for edge cases (e.g., navigating within the same route pattern), use the motion.div's `onAnimationComplete` callback:

```typescript
<motion.div
  ref={ref}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onAnimationComplete={(definition) => {
    if (definition === 'animate') {
      window.scrollTo(0, 0);
    }
  }}
  transition={{ ... }}
  style={{ width: '100%', minHeight: '100dvh' }}
  className={className}
>
```

This ensures scroll reset only happens **after** the page has fully faded in, eliminating the visual jump.

### Files Changed
- `src/components/PageTransition.tsx` — remove `useLayoutEffect` + `window.scrollTo`, optionally add `onAnimationComplete` callback

### What Stays Untouched
- All four protected ref patterns (confirmed not in this file)
- `AnimatePresence mode="wait"` in App.tsx (correct and needed)
- No other files modified

