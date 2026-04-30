# Surface 2 (Login) — three small refinements

Single file change. Visual only. No handler or auth logic touched.

## Audit results for the three items

I read the current `src/pages/Login.tsx` to verify each item against what's actually deployed:

### Item 1 — hairline rule (no change needed)

The hairline at line 433 is already exactly per spec:

```tsx
<div style={{ height: 1, width: '60%', background: 'rgba(253, 246, 227, 0.50)', marginTop: 32 }} />
```

Color rgba(253,246,227,**0.50**), width **60%**, height **1px**. No 80–90% opacity in code. If it visually feels heavier than expected, that's the cream-on-dark contrast against #0B1026 — but the spec values are met. Leaving untouched.

### Item 3 — Cormorant Garamond loading (no code change needed)

All three editorial elements (manifesto, credential, pacing line — lines 385/401/418) already declare:

```tsx
fontFamily: "'Cormorant Garamond', Georgia, serif"
```

Literally `Cormorant Garamond`, not `Cormorant`. Combined with the dedicated `display=swap` link added to `index.html` in the previous patch, the italic should resolve correctly. No code change here. Verification step at the end.

### Item 2 — TermsConsent block (needs change)

Current state at lines 628–647:

```tsx
<div style={{ marginTop: 20 }}>          // → 16
  <TermsConsent
    className="text-xs leading-relaxed"
    linkClassName="underline underline-offset-2 transition-colors"
  />
</div>
…
<style>{`
  .text-xs.leading-relaxed { color: rgba(253, 246, 227, 0.45); }              // → 0.50, force DM Sans 11/400
  .text-xs.leading-relaxed button { color: rgba(212, 245, 192, 0.75); }       // sage → match parent 0.50
`}</style>
```

Three problems confirmed: gap is 20px not 16, text is 45% not 50%, and the links render in the sage `rgba(212, 245, 192, 0.75)` color from the leftover style block — not the surrounding cream.

## Single change to apply

Replace lines 628–647 of `src/pages/Login.tsx` with the same JSX but:

- Outer wrapper `marginTop: 20` → `marginTop: 16`
- `.text-xs.leading-relaxed` → `color: rgba(253, 246, 227, 0.50)`, plus `font-family: 'DM Sans', sans-serif`, `font-size: 11px`, `font-weight: 400` (force-set so the surrounding cascade can't bump them)
- `.text-xs.leading-relaxed button` → `color: rgba(253, 246, 227, 0.50)` (matches text), `text-decoration: underline`, `text-decoration-thickness: 1px`, `text-underline-offset: 2px`

Everything else (the `TermsConsent` component itself, its props, the error block below) stays byte-identical.

## Verification after deploy

1. Open `bonkiapp.com` redesigned Login in DevTools.
2. Inspect the manifesto `<p>` → computed `font-family` should resolve to `Cormorant Garamond`. If it falls back to `Georgia`, the swap link in `index.html` isn't loading and we'll need to debug network — report back, don't work around.
3. Inspect "Villkor" / "Integritetspolicy" links → both should compute to `rgba(253, 246, 227, 0.5)` with a 1px underline, matching the surrounding sentence.
4. Measure the gap between "Logga in med e-post" and the terms block — should be 16px (the email link already has `marginTop: 16` and the wrapper now `marginTop: 16` for total 16px below the link's bottom box, since they're stacked siblings).
