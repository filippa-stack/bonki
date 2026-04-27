# Remove Meta Pixel + PostHog tracking + privacy policy edits

Surgical removal of all third-party tracking (Meta Pixel browser + CAPI server, PostHog browser) and four text edits in `/privacy`. No refactors elsewhere.

## Inventory confirmed

**Meta Pixel** — call sites:
- `src/App.tsx` (import + `RoutePageViewTracker` component + `<RoutePageViewTracker />` usage)
- `src/contexts/AuthContext.tsx`, `src/components/Onboarding.tsx`, `src/components/ProductIntro.tsx`, `src/pages/Index.tsx`, `src/pages/ClaimPage.tsx`, `src/pages/Install.tsx` (one import + one call each)
- `src/lib/metaPixel.ts` (helper — delete)
- `index.html` (script block in `<head>` + `<noscript>` in `<body>`)
- `supabase/functions/meta-capi/` (delete directory + deploy delete)
- `supabase/config.toml` lines 30–31 (`[functions.meta-capi]` block)

**PostHog** — call sites:
- `src/lib/posthog.ts` (delete)
- `src/hooks/useAnalytics.ts` (delete — only consumer of posthog, not imported anywhere else)
- `src/main.tsx` lines 7 + 9 (`import { initPostHog }` + `initPostHog()`)
- `package.json` line 68 (`"posthog-js"`)
- No `<PostHogProvider>` wrapper exists; no PostHog script in `index.html`.

**Robots.txt** — `User-agent: facebookexternalhit` is kept (SEO crawler, not tracking).

## Changes

### 1. `index.html`
- Remove `<!-- Meta Pixel Code -->` … `<!-- End Meta Pixel Code -->` `<script>` block in `<head>`.
- Remove the `<!-- Meta Pixel noscript fallback -->` comment + `<noscript><img …facebook.com/tr…/></noscript>` in `<body>`.

### 2. Delete files
- `src/lib/metaPixel.ts`
- `src/lib/posthog.ts`
- `src/hooks/useAnalytics.ts`
- `supabase/functions/meta-capi/` (whole directory)

After deleting the edge function code, also call `supabase--delete_edge_functions` with `["meta-capi"]` to remove the deployed function.

### 3. Strip Meta Pixel imports + calls from call sites
For each file: remove the `import { trackPixelEvent } from '@/lib/metaPixel';` line and the single `trackPixelEvent(...)` call line. No other code touched.

- `src/contexts/AuthContext.tsx` (import L5, call L87)
- `src/components/Onboarding.tsx` (import L6, call L388)
- `src/components/ProductIntro.tsx` (import L13, call L168)
- `src/pages/Index.tsx` (import L9, call L79)
- `src/pages/ClaimPage.tsx` (import L8, call L90)
- `src/pages/Install.tsx` (import L8, call L90)

`src/App.tsx`:
- Remove import L6 (`trackPixelEvent`).
- Remove the entire `RoutePageViewTracker` function (~L154–160).
- Remove `<RoutePageViewTracker />` JSX usage inside `<DevStateProvider>` (just before `<MobileOnlyGate>`).
- Leave routes, providers, `MobileOnlyGate`, `BonkiErrorBoundary`, `ProtectedRoutes` untouched.

### 4. Strip PostHog from `src/main.tsx`
- Remove line 7: `import { initPostHog } from './lib/posthog';`
- Remove line 9: `initPostHog();`
- All other imports and `createRoot(...)` rendering untouched.

### 5. Remove PostHog dependency
- `package.json`: remove the `"posthog-js": "^1.367.0",` line.

### 6. `supabase/config.toml`
Remove the two-line block (L30–31):
```
  [functions.meta-capi]
    verify_jwt = false
```
Leave all other `[functions.*]` entries intact.

### 7. Privacy policy edits — `src/pages/PrivacyPolicy.tsx`

**7a. Date (L15)** — change `Senast uppdaterad: 27 april 2026` to today's date in Swedish format. Today is 27 April 2026, so it stays `27 april 2026` (no change needed; will refresh in case stale).

**7b. Section 1 (L26)** — replace the single `<p>` with:
> Bonki & Friends AB, Adelgatan 2, 211 22 Malmö, Sverige, är personuppgiftsansvarig för behandlingen av dina personuppgifter inom Bonki-tjänsten. Organisationsnummer lämnas på begäran.

**7c. Section 8 (after L100, before `<ul>` on L101)** — insert new `<p>`:
> Utan app-tillgång kan du begära radering via [bonkiapp.com/delete-account](https://bonkiapp.com/delete-account) eller genom att mejla oss från den e-postadress som är kopplad till ditt konto. Vi raderar kontot inom 30 dagar.

The link uses `<a href="https://bonkiapp.com/delete-account" style={{ color: '#D4943A' }}>` (no `target="_blank"`, same-origin).

**7d. Section 10 (L119)** — replace the bullet:
> Vi samlar inte medvetet in personuppgifter direkt från barn under den åldersgräns som tillämpas i deras hemland enligt GDPR Art. 8 (13 år i Sverige; varierar mellan 13–16 år i andra EU-länder).

## Not touched

Supabase client/RLS, all other edge functions, Stripe, RevenueCat, Resend, Capacitor, `public/robots.txt`, reviewer block on `Login.tsx`, `isAndroidNative()` paywall hides, `HIDDEN_PRODUCT_IDS_NATIVE`/`HIDDEN_SLUGS_NATIVE`, `/delete-account` route + page, `KIDS_PRODUCT_IDS`, all sync guards (`suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave.current)`, `hasSyncedRef`).

## Memory updates

After applying, update memory to reflect tracking removal:
- Delete `mem://analytics/meta-tracking`
- Delete `mem://analytics/posthog-infrastructure`
- Update `mem://index.md` to remove both entries from the Memories list

## Verification

```bash
grep -rn -iE "facebook|fbq|fbevents|meta-pixel|metaPixel|meta-capi|posthog|ph_capture" src/ index.html public/ supabase/
# Expected: only public/robots.txt:10 (facebookexternalhit)

grep -n "Adelgatan" src/pages/PrivacyPolicy.tsx
grep -n "/delete-account" src/pages/PrivacyPolicy.tsx
grep -n "GDPR Art. 8" src/pages/PrivacyPolicy.tsx
# Each: one match

bunx vite build
# Expected: 0 errors
```

Filippa will manually delete `META_PIXEL_ID` / `META_ACCESS_TOKEN` from Cloud secrets afterwards.
