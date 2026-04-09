

## Redesign Install Page — Browser-Aware PWA Install Guide

### File changed
`src/pages/Install.tsx` — single file, rendering only

### What stays
- Standalone redirect, Meta Pixel tracking, all imports
- Brand header: wordmark, creature, headline, badge, trust stats (lines 83–215)
- Background/dark theme, `beforeinstallprompt` listener structure

### What gets removed
- `handleCTA` function, "Öppna appen" button, "Gratis att börja" text
- `iosGuideRef`, old iOS guide card (⎋/+ icons)
- "Redan medlem?" login link
- Old `platform` state (replaced by detection vars)

### What gets added

**Detection vars** (top of component):
- `isSafari`, `isIOS`, `isAndroid`, `isIOSNonSafari`
- `copied` state, `promptOutcome` state

**Handlers**: `handleInstallClick` (Android/desktop prompt), `handleCopyLink` (iOS non-Safari clipboard)

**Four conditional views** below trust stats:

| Condition | View | Content |
|---|---|---|
| `isIOSNonSafari` | B | "Öppna i Safari" card + "Kopiera länk" button |
| `isIOS` (Safari) | A | 3-step vertical guide with numbered circles, connector lines, inline Safari share SVG |
| `isAndroid` | C | Native prompt button if available, else 2-step manual guide |
| Desktop fallback | D | Native prompt button if available, else "Öppna på mobil" message |

Android/Desktop views have sub-states for prompt available, accepted, and fallback manual steps.

**Bottom link** (all views): "Redan installerat? Öppna Bonki →" → `/login`

### Implementation approach
Rewrite the component keeping the same structure: imports → detection → useEffects → return JSX. The brand header section (lines 83–215) is preserved verbatim. Everything from the old CTA section onward is replaced with the four conditional views rendered via simple if/else blocks, plus the universal bottom link.

Step circles use consistent styling (32px, orange border/tint). Connector lines between steps use absolute-positioned 1px divs. The inline Safari share SVG is hardcoded in step 1.

