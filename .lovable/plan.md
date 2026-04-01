

## Fix: Theme Hook Timing (useEffect → useLayoutEffect)

### Problem
Theme hooks run in `useEffect` (after paint), causing a one-frame flash of stale CSS variables on navigation — visible as a color "wave" on iOS Safari.

### Changes (3 files, minimal diff)

**1. `src/hooks/usePageBackground.ts`** — Replace `useEffect` with `useLayoutEffect`

**2. `src/hooks/useProductTheme.ts`** — Change import and hook call from `useEffect` to `useLayoutEffect`. Nothing else changes.

**3. `src/hooks/useDefaultTheme.ts`** — Consolidate the two separate effects (one `useLayoutEffect` + one `useEffect`) into a single `useLayoutEffect` that does both class removal and CSS var reset before paint.

No logic changes, no dependency array changes, no cleanup additions. The only functional difference is paint-blocking timing.

