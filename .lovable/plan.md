## Goal

Google's branding verification fails because crawling `https://bonkiapp.com` finds no link to the privacy policy. The route `/privacy` exists (rendered by `PrivacyPolicy.tsx` and registered in `App.tsx`), but no visible `<a href="/privacy">` anchor is reachable from the public landing.

For anonymous visitors, the app redirects to **Login** (`src/pages/Login.tsx`). The existing privacy text there lives inside `TermsConsent` as a dialog trigger — not a navigable link, so Google's crawler sees nothing.

## Change

Add a small, visible footer link to `/privacy` on the public Login page. Swedish copy, low-key styling, real `<Link to="/privacy">` so it is in the rendered DOM and crawlable.

**File:** `src/pages/Login.tsx`

- Import `Link` from `react-router-dom` (if not already imported).
- Add a footer block at the bottom of the Login page JSX (just before the closing wrapper), containing a single anchor:
  - Label: `Integritetspolicy`
  - `to="/privacy"`
  - Styled muted/small, centered, with a bit of bottom padding so it sits above the safe area.

No other files change. No logic, auth, RevenueCat, capacitor, or routing changes. The `/privacy` route already exists and renders `PrivacyPolicy.tsx`.

## Out of scope

- Footer.tsx (used inside authenticated pages only; not reached anonymously).
- index.html static fallback (the SPA renders Login fast enough; Googlebot executes JS for verification).
- Terms link, cookie banner, or any redesign of the Login layout.
- Native-only screens (the verification target is the web origin `bonkiapp.com`).

## Verification

1. `npm run build` clean.
2. Visit `https://bonkiapp.com` in an incognito window → Login renders → "Integritetspolicy" link visible at the bottom → click navigates to `/privacy` and renders the policy page.
3. View page source after JS hydration: an `<a href="/privacy">Integritetspolicy</a>` is present in the DOM.
4. Resubmit Google branding verification.
