## Problem

Google's branding verifier fetches `https://bonkiapp.com/` and expects to see a link to the privacy policy. Today, unauthenticated visitors are redirected by React Router to `/login`, and the verifier (which may not execute JS, or which only inspects the root URL response) never sees a privacy link on `/`. The existing crawlable privacy link lives only inside `src/pages/Login.tsx`.

## Fix (one file)

**File:** `index.html` — add a static, crawlable privacy link directly in the HTML so it is present in the initial response for `https://bonkiapp.com/`, independent of React, routing, or auth state.

Insert immediately after `<div id="root"></div>` (line 38), before the existing `<script>` blocks:

```html
<noscript>
  <a href="/privacy">Integritetspolicy</a>
</noscript>
<a
  href="/privacy"
  aria-label="Integritetspolicy"
  style="position:absolute;left:1rem;bottom:1rem;color:#94a3b8;font-size:12px;text-decoration:underline;z-index:1;"
>Integritetspolicy</a>
```

Why this works:
- The `<a>` is in the static HTML body, so it is in the initial document response for every route — including `/` — regardless of JS execution or auth redirects.
- It points to `/privacy`, which is an already-public route in `App.tsx` (line 201) rendering `PrivacyPolicy`.
- Styling is minimal/unobtrusive (small muted link in bottom-left, low z-index) so it does not visually intrude on the app UI. The React app paints on top inside `#root`.
- The `<noscript>` fallback covers crawlers with JS disabled.

## Out of scope

- No changes to `App.tsx`, `Login.tsx`, routing, auth, or any component.
- No new components, no SEO library, no meta-tag changes.
- `/privacy` route already exists — not touched.

## Verification

1. `curl -s https://bonkiapp.com/ | grep -i privacy` returns the `<a href="/privacy">` line.
2. Visiting `/` in browser shows the app unchanged; a small "Integritetspolicy" link appears in the bottom-left corner.
3. Clicking it navigates to the existing privacy policy page.
4. Re-run Google's branding verification — privacy link requirement satisfied.
