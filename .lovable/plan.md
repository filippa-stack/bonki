## Diagnosis

Stripe cancel flow trace:

1. User on redesigned `ProductIntro` taps **Köp** → `handleCta` marks intro seen (localStorage + `onboarding_events`) → `navigate('/buy?product=X')`.
2. `BuyPage` auto-triggers Stripe checkout with `cancelUrl: ${origin}/buy?product=X&cancelled=1`.
3. User taps back arrow in Stripe → returns to `/buy?cancelled=1`.
4. `BuyPage` effect (line 250) sees authenticated cancel-return → `navigate('/product/{slug}', {replace: true})`.
5. `ProductHome` reads the `bonki-intro-seen-X` marker (set in step 1) → renders `KidsProductHome` / `AdultProductHome` instead of the redesigned `ProductIntro`.

Result: user came from the editorial redesigned `ProductIntro` and lands on the regular product home — visually different page at the most fragile decision moment.

`PaywallFullScreen` and `ProductPaywall` are not in this funnel; the `BuyPage` cancel handoff to product home is the bug.

## Fix (Option A — cleanest)

Send the cancel-return back to the same `ProductIntro` page via a URL flag.

### Changes

**`src/pages/BuyPage.tsx`** line 251 — append `?intro=1` so `ProductHome` knows to force-show the intro:
```ts
navigate(`/product/${product.slug}?intro=1`, { replace: true });
```

**`src/pages/ProductHome.tsx`** — read `intro=1` from the URL and force `showIntro=true` regardless of the `bonki-intro-seen-X` marker / `useProductIntroNeeded` result. Skip the loading gate when `forceIntro` is set so the user lands directly on the redesigned page with no flash.

```ts
const forceIntro = new URLSearchParams(location.search).get('intro') === '1';

const [showIntro, setShowIntro] = useState<boolean | null>(() => {
  if (forceIntro) return true;
  // ...existing logic
});

useEffect(() => {
  if (forceIntro) { setShowIntro(true); return; }
  // ...existing logic
}, [introChecked, needsIntro, forceIntro]);
```

No changes to the edge function (`create-checkout`) needed — the cancel URL is supplied by the caller. Other callers (`PaywallFullScreen`, `ProductPaywall`, `Paywall`, `PurchaseScreen`, `PaywallBottomSheet`, `CardView`) are out of the redesigned funnel and stay as-is.

## Verification

- Open `/product/still-us` → tap Köp → Stripe → back. Lands on the same redesigned ProductIntro (Vårt Vi).
- Open `/product/jag-i-mig` → tap Köp → Stripe → back. Lands on the same redesigned ProductIntro (kids).
- Successful purchase still routes via `successUrl` to `/?purchase=success&product=…` — unaffected.
- Direct (unauthenticated) `/buy?product=X` cancel-return still falls through to the BuyPage selling surface — unaffected (only the authenticated branch changes).