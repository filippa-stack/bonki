## Goal
Clean up the Library page hero by removing the BONKI wordmark, the "Samtalen som bygger närhet." tagline, and the ghost glow divider beneath them.

## Change
In `src/components/ProductLibrary.tsx` (lines ~494–542):
- Remove the entire hero `motion.div` containing the BONKI wordmark image and the tagline `<motion.p>`.
- Remove the ghost glow divider `motion.div` directly below it.
- Keep the `KontoIcon`/`KontoSheet` and the `LibraryResumeCard` section intact.
- Adjust top spacing so the resume card still sits below the safe-area inset (add `paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)'` to the first remaining content block).

No other files affected. `ProductLibraryMock.tsx` is left untouched since this request targets the live Library page.