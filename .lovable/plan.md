

## Move Install Guide Into Onboarding, Remove /install Route

### Summary
Convert Onboarding from a single-screen component into a two-step flow: Step 1 is a platform-aware install guide (reusing logic from Install.tsx), Step 2 is the existing audience selection. The `/install` route redirects to `/login`.

### Changes

**1. `src/App.tsx`** — Replace Install route with redirect
- Remove `import Install` 
- Change `<Route path="/install" element={<Install />} />` to `<Route path="/install" element={<Navigate to="/login" replace />} />`

**2. `src/components/Onboarding.tsx`** — Add install step as step 0

Add state: `const [step, setStep] = useState<'install' | 'audience'>(() => { ... })`

Initial step logic:
- If `localStorage.getItem('bonki-install-step-seen')` → start at `'audience'`
- If standalone mode (`window.matchMedia('(display-mode: standalone)').matches || navigator.standalone`) → start at `'audience'`
- Otherwise → start at `'install'`

When `step === 'install'`, render the install guide view instead of the audience selection. Reuse the same platform detection and visual components from Install.tsx:

- **Platform detection vars**: `isSafari`, `isIOS`, `isAndroid`, `isIOSNonSafari` (copied from Install.tsx)
- **State**: `copied`, `deferredPrompt`, `promptOutcome`
- **`beforeinstallprompt` listener** in a useEffect
- **Shared components**: `StepRow`, `SafariShareIcon`, step circle/text styles

Install step views (same conditional logic as Install.tsx):
- iOS Safari → 3-step guide with share icon SVG
- iOS non-Safari → "Öppna i Safari" card with "Kopiera länk" button  
- Android → native prompt button or 2-step manual guide
- Desktop → native prompt or "use mobile" message

Skip link on all install views: **"Hoppa över — fortsätt i webbläsaren"** — fontSize: 15px, color: `#E85D2C`, opacity: 0.7, centered. On tap: sets `localStorage.setItem('bonki-install-step-seen', '1')` and transitions to `'audience'` step.

When `step === 'audience'`, render the current onboarding content (logo, headline, audience pills, Börja button) — unchanged.

The install step uses the same Midnight Ink background and Lantern Glow text colors as the current onboarding. Logo is shown at the top (same as current) for visual continuity.

**3. `src/pages/Install.tsx`** — Keep as dead code (no route points to it)

### What stays untouched
- Audience selection UI, routing logic, `completeOnboarding`, `initializeCoupleSpace`
- All session/reflection/payment logic
- `InstallGuideBanner` component (separate concern)
- Protected patterns from handover

