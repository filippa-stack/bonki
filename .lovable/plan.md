## Goal

Two web-only changes. Native UI is byte-for-byte unchanged.

1. **Redesign `src/pages/Login.tsx`** to match mockup slide 2 (deep midnight, serif headline, psychologist sub-line, divider, dynamic pricing rows, then existing CTAs).
2. **Add `src/components/PreAuthIntroSlide1.tsx`** — a static one-screen pre-auth gate shown once per browser before the redesigned Login.

No slide pager. No prop drilling. No state lift. No legacy-body extraction to a separate file.

---

## Token decision (verified in code)

- `MIDNIGHT_INK` in `src/lib/palette.ts` = `#1A1A2E` — accents only.
- `--surface-base` in `src/index.css` = `#0B1026` — canonical full-screen dark page bg (BuyPage, DeleteAccount, App shell all use this).

**Background uses `var(--surface-base)` / `#0B1026`.** `MIDNIGHT_INK` stays for accent text on orange.

---

## Bypass — native fully unchanged

```ts
const isReviewerMode = searchParams.get('review') === '1'; // web QA
const isNative = Capacitor.isNativePlatform();             // iOS/Android Capacitor
const skipRedesign = isReviewerMode || isNative;
```

**No refactor of legacy body.** Today's JSX stays inline in `Login.tsx`. The branch is:

```ts
if (skipRedesign) {
  return (/* the entire existing Login JSX, unchanged */);
}
// otherwise: web redesign branch below
```

Hooks and handlers stay exactly where they are today. No `LegacyLoginBody` component file. No prop drilling. No state lift. Just an early-return branch at the top of the render.

---

## Hook ordering (mandatory)

All new hooks declared **before** the `skipRedesign` early return so React's hook order is stable across mode switches:

```ts
// existing hooks first (auth, searchParams, showEmailForm, otpSent, etc.) — unchanged

// NEW hooks — added before any early return
const [prices, setPrices] = useState<{ couple: number; kids: number } | null>(null);
const [pricesReady, setPricesReady] = useState(false);
const [showSlide1, setShowSlide1] = useState(() => {
  if (skipRedesign) return false;
  return localStorage.getItem('bonki-preauth-seen') !== '1';
});

useEffect(() => {
  if (skipRedesign) return; // native pays zero network cost
  let cancelled = false;
  const timeout = setTimeout(() => { if (!cancelled) setPricesReady(true); }, 1500);
  supabase.from('products').select('id, price_sek').in('id', ['still_us', 'jag_i_mig'])
    .then(({ data, error }) => {
      if (cancelled) return;
      clearTimeout(timeout);
      if (!error && data) {
        const couple = data.find(p => p.id === 'still_us')?.price_sek;
        const kids   = data.find(p => p.id === 'jag_i_mig')?.price_sek;
        if (typeof couple === 'number' && typeof kids === 'number') {
          setPrices({ couple, kids });
        }
      }
      setPricesReady(true);
    });
  return () => { cancelled = true; clearTimeout(timeout); };
}, [skipRedesign]);

// NOW the early returns
if (skipRedesign) {
  return (/* existing legacy JSX, unchanged */);
}
if (showSlide1) {
  return <PreAuthIntroSlide1 onContinue={() => {
    localStorage.setItem('bonki-preauth-seen', '1');
    setShowSlide1(false);
  }} />;
}
// web redesign JSX
```

---

## Web redesign branch — visual frame

Order, top to bottom:

- bonki logo (112×112) + bonki wordmark (existing 56px maxHeight) — unchanged
- divider (1px, `rgba(253,246,227,0.10)`)
- **headline (verbatim, locked):**

  ```ts
  const HEADLINE_LINES = [
    'Det som bär en relation är inte',
    'de stora samtalen — utan de små',
    'som faktiskt blir av.',
    'Det är där Bonki hör hemma.',
  ];
  ```

  `var(--font-display)` (Cormorant), `#FDF6E3`, `clamp(24px, 6vw, 30px)`, line-height 1.3, centered.
- **sub-line (verbatim, locked):**

  ```ts
  const SUBLINE_LINES = [
    'Utvecklade av leg. psykolog',
    'och psykoterapeut.',
    'Ni bestämmer takten.',
  ];
  ```

  DM Sans 14px, `rgba(253,246,227,0.65)`, line-height 1.5, centered.
- divider
- **pricing rows** (sans 15px, label `rgba(253,246,227,0.85)` left, price `#FDF6E3` right, `font-variant-numeric: tabular-nums`):
  - "För dig och din partner" — couple price
  - "För dig och ditt barn" — kids price
- divider
- existing Google + email CTA stack — handlers, OAuth `redirect_uri`, `saveConsent()`, `TermsConsent` all unchanged

Copy constants are the source of truth. No paraphrasing.

### State-specific rendering (web redesign branch)

- Default: full marketing block + CTAs.
- `showEmailForm === true`: hide marketing block; email form against `#0B1026`.
- `otpSent === true`: hide marketing block; OTP form focused.
- Form elements (input, label, submit, back) keep current styling unchanged. Verify visually against `#0B1026`; flag in PR notes if contrast or focus rings feel weak — **do not modify form logic**.

### Pricing render rule (four-state, explicit)

```
prices !== null                        → real DB values
prices === null && !pricesReady        → skeleton bars (same row height, no layout shift)
prices === null &&  pricesReady        → fallback constants (249 / 195)
```

Constants:

```ts
const FALLBACK_PRICE_COUPLE = 249; // still_us — verified Live 2026-04-29
const FALLBACK_PRICE_KIDS   = 195; // jag_i_mig — verified Live 2026-04-29
```

CTAs are never gated on the price fetch. No inline self-debate comments.

---

## `src/components/PreAuthIntroSlide1.tsx` (new)

Static, stateless. Zero auth, zero pricing, zero network.

### Layout (top to bottom — order locked)

```
[full-bleed #0B1026, 100vh + calc(env(safe-area-inset-*)), translateZ(0)]

  [serif headline, centered, clamp(28px, 8vw, 36px), #FDF6E3]
  Det där samtalet
  som vill bli av.

  [dot indicator — see below]

  [outlined cream pill button, full-width on mobile, ~52px tall]
  Fortsätt

  [bonki wordmark, ~48px tall, dim cream, anchored near bottom]
```

Wordmark is bottom signature, NOT top header.

### Indicator (bars, not circles)

- Two segments, **18×2px**, `border-radius: 2px`, `gap: 6px`.
- Slide 1 active: first bar `#E8743C`, second `rgba(253,246,227,0.25)`.
- Slide 2 (used in redesigned login below the divider, optional — but spec calls for indicator only on Slide 1; on Slide 2 the indicator is omitted because Slide 2 IS the destination, no further "next"). **Decision: indicator only on Slide 1.** If we later add a Slide 2 indicator, same bar shape applies.
- Centered above the "Fortsätt" button.

### Behavior

- Single prop: `onContinue: () => void`.
- "Fortsätt" handler in parent (`Login.tsx`) writes `localStorage['bonki-preauth-seen'] = '1'` then `setShowSlide1(false)`. Component itself only calls `onContinue()`.
- No Framer Motion. No route change. State toggle within `/login`.

---

## Persistence rules

- `bonki-preauth-seen` read AND write are gated on `!skipRedesign`. Mode-switching cannot leak state.
- After "Fortsätt", same component instance unmounts Slide 1 → renders redesigned Login (no flicker, no nav).
- OTP back-nav: tapping "Tillbaka" on email/OTP forms behaves as today (clears `showEmailForm` / `otpSent`). Returns to redesigned Login default state, never to Slide 1. Slide 1 is one-shot per browser.

---

## Files

- **New:** `src/components/PreAuthIntroSlide1.tsx`
- **Modified:** `src/pages/Login.tsx`
  - Add `isReviewerMode` / `isNative` / `skipRedesign` triple.
  - Add `prices` / `pricesReady` / `showSlide1` state + pricing effect, all **before** any early return.
  - Add early-return branch wrapping today's JSX when `skipRedesign`.
  - Add early-return branch rendering `PreAuthIntroSlide1` when `showSlide1`.
  - Inject locked-copy headline / sub-line / pricing block into web redesign JSX (default state only).
- **Untouched:** `Onboarding.tsx`, `App.tsx`, all auth integrations, `appleSignIn.ts`, `TermsConsent.tsx`, edge functions, all routes, all native UI.

---

## Verification checklist (run after build)

1. Web, fresh browser, no params → Slide 1 renders. Tap "Fortsätt" → redesigned Login. Reload → goes straight to redesigned Login (no Slide 1).
2. Web, `?review=1` on fresh browser → today's legacy Login renders unchanged. **Confirm `localStorage.getItem('bonki-preauth-seen') === null`** (reviewer must not pollute persistence).
3. Native (Capacitor) → today's legacy Login renders unchanged. No pricing fetch in network log.
4. Web redesign, slow network → skeleton bars show, then either real values (≤1500ms) or fallback (>1500ms). CTAs remain interactive throughout.
5. Web redesign, default state, tap "Fortsätt med e-post" → marketing block hidden, email form on `#0B1026`. Tap "Tillbaka" → returns to redesigned Login default (not Slide 1).
6. Visual: headline reads as moment, not body copy; pricing aligns right with tabular nums; bar indicator on Slide 1 is two flat 18×2px segments (orange + dim cream).
7. Copy diff: headline contains "faktiskt blir av" (NOT "aldrig"); sub-line contains "leg. psykolog och psykoterapeut" and "Ni bestämmer takten."

---

## Risk table

| Risk | Status |
|---|---|
| Breaking Google / email / Apple / reviewer auth | None — handlers + state machine untouched |
| App Store / Play reviewer regression | None — `isNative` returns legacy JSX byte-for-byte |
| Web `?review=1` QA regression | None — `isReviewerMode` returns legacy JSX |
| Hook order violation across mode switches | Mitigated — all new hooks declared before any early return |
| Native users see new design accidentally | Impossible — `skipRedesign` short-circuits |
| Native pays network cost for pricing | Mitigated — effect early-returns when `skipRedesign` |
| Copy drift from mockup | Mitigated — locked verbatim constants + verification step 7 |
| Slide 1 ordering / wordmark misplaced | Mitigated — explicit top-to-bottom spec |
| Indicator looks like generic dots | Mitigated — bars (18×2px), not circles |
| Background token confusion | Resolved — `--surface-base` (`#0B1026`); `MIDNIGHT_INK` for accents only |
| Headline too small | Mitigated — `clamp(24px, 6vw, 30px)` |
| Slow network blocks login | Mitigated — 1500ms timeout, CTAs never gated |
| Skeleton vs fallback ambiguity | Mitigated — four-state render rule |
| Persistence leaks across modes | Mitigated — read+write gated on `!skipRedesign`; verification step 2 |
| Marketing block clutter on email/OTP | Mitigated — hidden in those states |
| Form contrast on `#0B1026` | Plan: verify + flag, no logic change |
| iOS PWA layout regression on Slide 1 | `100vh + calc()`, `translateZ(0)`, safe-area padding |
| Page-transition flicker | Avoided — state toggle within `/login`, no nav |
