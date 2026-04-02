

## Branded Loading Screen

### 1. New file: `src/components/BonkiLoadingScreen.tsx`

A simple component using only inline styles:
- Fixed fullscreen, `#0B1026` background
- Saffron radial glow behind content
- Bonki logo at 100px wide with gentle pulse (opacity 0.4–0.8, 2s ease-in-out infinite)
- 24px × 1.5px saffron divider bar (`hsla(40, 78%, 61%, 0.3)`) also pulsing
- No text, no Tailwind, no framer-motion
- Injects `@keyframes bonkiBreath` via an inline `<style>` tag

### 2. `src/App.tsx` — two replacements

**ProtectedRoutes** (lines 63–77): Replace skeleton block with `<BonkiLoadingScreen />`

**AppRoutes** (lines 151–161): Replace skeleton block with `<BonkiLoadingScreen />`

Add import at top.

### 3. `src/components/ProductLibrary.tsx` — line 491

Replace `<div style={{ minHeight: '100vh', backgroundColor: '#0B1026' }} />` with `<BonkiLoadingScreen />`

No routing, auth, or state logic changes.

