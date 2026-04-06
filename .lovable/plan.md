

## Fix Post-Publish Flickering (5 fixes)

### Fix 1: Install.tsx — Remove all entrance animations
- Remove the `fadeUp` variants object entirely
- Replace all `motion.section` → `section`, `motion.img` → `img`, `motion.h2` → `h2`, `motion.div` → `div`, `motion.p` → `p`
- Keep the creature logo as `motion.img` ONLY for its breathing `animate={{ y: [0, -6, 0] }}` — remove `custom` and `variants` props from it
- Keep CTA as `motion.button` with ONLY `whileTap={{ scale: 0.97 }}` — remove `custom`, `variants`, and `transition` props
- Remove `framer-motion` import if no longer needed (it will still be needed for the two motion elements above)

### Fix 2: Install.tsx — CTA button cleanup
- Already handled in Fix 1: the button keeps only `whileTap={{ scale: 0.97 }}`

### Fix 3: BonkiLoadingScreen.tsx — Reduce z-index
- Change `zIndex: 9999` → `zIndex: 50`
- The `dangerouslySetInnerHTML` keyframes are a static string and harmless; no change needed there

### Fix 4: Login.tsx — Remove entrance flicker
- Change the outer `motion.div` from `initial={{ opacity: 0 }}` → `initial={false}`
- Change the creature `motion.img` from `initial={{ opacity: 0, scale: 0.92 }}` → `initial={false}`
- These two changes eliminate the fade-in re-trigger on state changes

### Fix 5: InstallGuideBanner.tsx — No changes needed
- The banner uses `AnimatePresence` with a delayed mount (1.5s timeout) and only appears once per session. Its animation is intentional entrance behavior, not a flicker bug. No change required.

### Files changed
- `src/pages/Install.tsx`
- `src/components/BonkiLoadingScreen.tsx`
- `src/pages/Login.tsx`

