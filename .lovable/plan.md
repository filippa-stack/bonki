# Root cause: `ProductIntro` renders for purchased users who haven't completed a session yet

## What's actually happening

The "paywall" the reviewer sees on `jag_i_varlden`, `syskonkort`, and `sexualitetskort` is **`ProductIntro`**, not `ProductPaywall`. Visually they're nearly identical (same headline shape, same "Köp · 195 kr" CTA, same skip link), which is why we mis-identified it.

`ProductIntro` renders before any access check in `ProductHome`:

```text
ProductHome render order:
  line 42  useProductIntroNeeded()   ← server check on couple_sessions
  line 78  useProductAccess()         ← server check on user_product_access
  line 88  if (showIntro === true) return <ProductIntro/>   ← STOPS HERE
  line 117 paywallAccessLoading gate
  line 126 if (!hasProductAccess) return <ProductPaywall/>
```

If `showIntro === true`, the access-check branch is unreachable. Purchase status is irrelevant at that point.

## Why `showIntro === true` for the reviewer

`useProductIntroNeeded` (in `src/components/ProductIntro.tsx` lines 544–586) decides intro visibility based on **one signal only**:

```ts
const { data } = await supabase
  .from('couple_sessions')
  .select('id')
  .eq('product_id', productId)
  .eq('status', 'completed')
  .limit(1);

const hasCompleted = (data?.length ?? 0) > 0;
setNeeded(!hasCompleted);
```

The reviewer purchased all 7 products via the backfill but hasn't completed a session in three of them. Result: `needsIntro = true` for those three.

`ProductHome` does layer a localStorage shortcut on top:

- Line 47: initial state reads `bonki-intro-seen-${productId}`. If present → `showIntro = false`.
- Line 56: effect re-reads localStorage after `introChecked`. If present → `showIntro = false`.

That shortcut works on subsequent visits on the same device — but **only after the user has already seen and dismissed the intro at least once**. On the reviewer's fresh install (no prior dismissal, no completed session, but yes purchased), localStorage is empty and `useProductIntroNeeded` says yes → intro renders → looks like a paywall.

This also explains why the bug is **same-3-products deterministic**: the other four likely have an old `bonki-intro-seen-*` key from earlier QA on the simulator, or have a completed session row from prior testing. The 3 broken ones are simply the products no one has run a session in yet on that device.

It also explains why **the library tile shows "purchased"** (uses `useAllProductAccess`, no intro layer) while **the product page paywall-locks** (intro layer fires before paywall layer).

## The fix

`useProductIntroNeeded` needs to short-circuit when the user already owns the product. A purchased user has no business seeing a "Köp · 195 kr" intro — it's a dead-end that drops them back to the library when they tap "Inte just nu".

### Change 1 — `useProductIntroNeeded` checks access first

In `src/components/ProductIntro.tsx`, modify the hook so that purchased products always return `needed: false`:

```ts
export function useProductIntroNeeded(productId: string): { needed: boolean; checked: boolean } {
  const [needed, setNeeded] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        // Demo-mode bypass (unchanged)
        if (typeof window !== 'undefined' &&
            (window.location.search.includes('demo=1') ||
             sessionStorage.getItem('bonki-demo-mode') === '1')) {
          setNeeded(false);
          setChecked(true);
        }
        return;
      }

      // NEW: purchased users never see the intro/paywall hybrid
      const { data: accessRow } = await supabase
        .from('user_product_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      if (cancelled) return;

      if (accessRow) {
        setNeeded(false);
        setChecked(true);
        return;
      }

      // Existing fallback: completed-session signal
      const { data } = await supabase
        .from('couple_sessions')
        .select('id')
        .eq('product_id', productId)
        .eq('status', 'completed')
        .limit(1);

      if (!cancelled) {
        setNeeded((data?.length ?? 0) === 0);
        setChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [productId]);

  return { needed, checked };
}
```

This makes `ProductIntro` what it was always supposed to be: a **first-touch sales screen** that disappears the instant the user owns the product, regardless of session activity.

### Change 2 — Belt-and-braces guard in `ProductHome`

Even with the hook fix, ProductHome's render order should not allow the intro to win over a known-paid state. Update the early-return on line 88 to also check access loaded:

```tsx
// Before:
if (showIntro === true && product) {
  return <ProductIntro …/>;
}

// After:
if (showIntro === true && product && !paywallAccessLoading && !hasProductAccess) {
  return <ProductIntro …/>;
}
```

That way, if the access query resolves first and the user owns the product, the intro is suppressed even before `useProductIntroNeeded` finishes its own re-check. This costs nothing and prevents any future regressions where the intro layer could shadow a purchased state.

### Change 3 — Cleanup

Remove the temporary `[ACCESS-DIAG]` instrumentation from:
- `src/hooks/useProductAccess.ts`
- `src/hooks/useAllProductAccess.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/ProductHome.tsx`

The diagnosis is complete; the logs are no longer useful and shouldn't ship to App Store review.

## Verification path

1. Apply the three changes above. Build 1.0 (6).
2. On the reviewer's fresh device install, sign in as `apple.review@bonkistudio.com`.
3. Tap into `jag_i_varlden`, `syskonkort`, `sexualitetskort` — each should now go directly to `KidsProductHome` (the category tile grid) with no intro.
4. Tap into `jag_i_mig` (or any product where the reviewer has already completed a session) — same direct-to-home behavior, unchanged.
5. As a sanity test, sign out and sign in as an unpurchased dev user — `ProductIntro` should still render exactly as before for products they don't own.

## Why this matches every observation

| Symptom | Explanation |
|---|---|
| Library tile shows purchased | `useAllProductAccess` correct, no intro layer |
| ProductHome diag: `hasProductAccess: true` | `useProductAccess` correct |
| Paywall-looking screen renders anyway | `ProductIntro`, gated only by `couple_sessions`, fired |
| Same 3 products fail | Those 3 are products with no completed session on this device |
| Other 4 products work | Have either localStorage `bonki-intro-seen-*` or a completed session |
| Real device worse than simulator | Simulator had stale localStorage keys from prior dev builds |
| Doesn't fail every product on real device for some users | Depends on which products have prior session activity |

## Files modified

- `src/components/ProductIntro.tsx` — extend `useProductIntroNeeded` with a `user_product_access` short-circuit before the `couple_sessions` check.
- `src/pages/ProductHome.tsx` — belt-and-braces guard on the intro early-return so it never shadows a known-purchased state. Remove `[ACCESS-DIAG]` log.
- `src/hooks/useProductAccess.ts` — remove `[ACCESS-DIAG]` instrumentation.
- `src/hooks/useAllProductAccess.ts` — remove `[ACCESS-DIAG]` instrumentation.
- `src/contexts/AuthContext.tsx` — remove `[ACCESS-DIAG]` instrumentation. Keep the `initialSessionResolved` race fix (that one is real and lands).

No DB changes. No edge-function changes. No TestFlight build-flag changes.
