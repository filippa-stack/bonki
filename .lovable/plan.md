## Fix 1 — Android native top inset

**`package.json`** — add `@capacitor/status-bar` dependency (installs as `^8.0.2`).

**`src/main.tsx`** — at top, before `createRoot`, add:

```ts
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";

if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
}
```

No call to `setStyle` or `setBackgroundColor`. `.catch(() => {})` keeps web-only runs safe.

**`capacitor.config.ts`** — no plugin block needed; `setOverlaysWebView` is a runtime call. No change.

Note for Filippa: after Lovable applies these changes, run `npx cap sync` locally before the next native build.

## Fix 2 — Landscape horizontal safe-area insets

Edits anchored by content, not line numbers.

**`src/components/BottomNav.tsx`** — on the outer fixed `<nav>` style block (the one with `position: 'fixed'` and `bottom: '0px'`):
- Add `paddingLeft: 'env(safe-area-inset-left, 0px)'`
- Add `paddingRight: 'env(safe-area-inset-right, 0px)'`
- Existing `paddingBottom` env calc preserved.

**`src/components/KontoIcon.tsx`** — on the motion.button style block (where `right: '16px'` is currently set):
- Change `right: '16px'` → `right: 'calc(env(safe-area-inset-right, 0px) + 16px)'`

**`src/components/ProductHomeBackButton.tsx`** — on the motion.button style block (where `left: '16px'` is currently set):
- Change `left: '16px'` → `left: 'calc(env(safe-area-inset-left, 0px) + 16px)'`

**`src/components/KontoSheet.tsx`** — on the sheet container `<div>` (the one with `position: 'absolute'`, `bottom/left/right: 0` via class, and `backgroundColor: '#1A1A2E'`):
- Add `paddingLeft: 'env(safe-area-inset-left, 0px)'`
- Add `paddingRight: 'env(safe-area-inset-right, 0px)'`
- Existing `paddingBottom` calc preserved.

**`src/components/FeedbackSheet.tsx`** — on the motion.div sheet container currently with `padding: '24px'`:
- Replace `padding: '24px'` with explicit per-side values:
  - `paddingTop: 24`
  - `paddingLeft: 'calc(24px + env(safe-area-inset-left, 0px))'`
  - `paddingRight: 'calc(24px + env(safe-area-inset-right, 0px))'`
- Keep existing `paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))'` unchanged.

## Out of scope (per request)

Items 3-8 from audit (body padding, Diary/Onboarding top edges, BottomNav clearance constants, CardView normalization, light-page seams, keyboard plugin) — not touched here.

## Verification

- DevTools iPhone 14 Pro landscape: BottomNav, KontoIcon, ProductHomeBackButton, KontoSheet, FeedbackSheet all clear of notch on left/right.
- Native Android build (after `npx cap sync`): status bar overlays WebView; top elements (KontoIcon, page headers) sit below the status bar via `env(safe-area-inset-top)`.
