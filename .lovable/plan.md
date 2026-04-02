

## Brand NotFound Page

**File: `src/pages/NotFound.tsx`**

Replace entire content with a branded 404 page matching the error boundary visual language:

- Keep `useLocation` + `useEffect` console.error logging
- Add `useNavigate` import
- Fixed fullscreen layout (`#0B1026` background, safe-area padding)
- Saffron radial glow overlay (same as BonkiErrorBoundary)
- Bonki logo at 80px wide, opacity 0.4 (import from `@/assets/bonki-logo-transparent.png` with `onError` hide fallback)
- "Sidan finns inte" — `var(--font-display)`, 22px, `#FDF6E3`
- "Adressen verkar vara felaktig." — `var(--font-body)`, 14px, `#FDF6E3` opacity 0.5
- `BonkiButton variant="secondary"` → "Tillbaka till start" → `navigate("/")`
- No other files changed

