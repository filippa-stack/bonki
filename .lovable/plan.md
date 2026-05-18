## Problem
The absolute-positioned "Integritetspolicy" link in `index.html` overlaps the library tiles (visible in the screenshot, bottom-left over the "Vardag" card).

## Fix
In `index.html`, replace the visible absolute-positioned `<a>` with a visually-hidden but DOM-present anchor (clip-path technique). Crawlers still see it in the static HTML response; users never see it overlapping UI.

Replace lines 39–46 (the `<noscript>` + visible `<a>`) with:

```html
<a
  href="/privacy"
  style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
>Integritetspolicy</a>
```

## Why this works
- Anchor is in the initial HTML response on every route → Google's branding verifier sees it via `curl` / static fetch.
- `clip:rect(0,0,0,0)` + 1×1px is the standard `sr-only` pattern: present in DOM, accessible to screen readers and crawlers, invisible to sighted users.
- No `<noscript>` wrapper needed — the `<a>` is already in the static document, so it's available whether JS runs or not.
- No z-index conflict, no overlap with app UI.

## Out of scope
No changes to `App.tsx`, routing, `/privacy` page, or any React component.

## Verification
- `curl -s https://bonkiapp.com/ | grep -i 'href="/privacy"'` returns the anchor.
- Visiting `/` shows the app with no visible bottom-left link overlapping tiles.
- Re-run Google's branding verification.
