

## Fix Install Page: Logo + Rendering

### Problem
1. **Page appears blank** — the hero `<motion.section>` uses `initial="hidden"` with `opacity: 0`, but the animation to `visible` may not be triggering correctly, leaving all content invisible.
2. **Wrong logo asset** — the page uses `/apple-touch-icon-180x180.png` (the PWA app icon) instead of the proper BONKI brand logo (`bonki-logo-transparent.png`).

### Changes

| Action | File | Detail |
|--------|------|--------|
| Edit | `src/pages/Install.tsx` | Import `bonkiLogo` from `@/assets/bonki-logo-transparent.png` and replace the `/apple-touch-icon-180x180.png` src with it |
| Edit | `src/pages/Install.tsx` | Add `whileInView="visible"` or `animate="visible"` explicitly to the hero section to ensure the fade-up animation triggers reliably in the preview environment |

### Details
- The branded transparent logo matches the onboarding page's visual identity
- Logo styling stays the same (72px, 16px border-radius) but the source changes to the proper brand mark
- The animation fix ensures content is always visible regardless of viewport intersection observers

