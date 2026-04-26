## Step 4 — Auth race fix in product access hooks ✅ SHIPPED

Both `useProductAccess` and `useAllProductAccess` now honor `auth.loading`. New contract:

- While auth is hydrating → `loading: true`, `hasAccess: false` / `purchased: empty Set`.
- After auth resolves with no user → `loading: false`, `hasAccess: false`.
- After auth resolves with a user → `loading: true` until the DB query returns, then real value.

Files changed: `src/hooks/useProductAccess.ts`, `src/hooks/useAllProductAccess.ts`.

---

## Step 5 — UI Guard Sweep ✅ COMPLETED BY STEP 4 (no code changes)

Audit of all 8 consumers of the access hooks:

| # | File | Line | Gates on `loading`? | Status |
|---|------|------|---------------------|--------|
| 1 | `ProductLibrary.tsx` | 480 | ✅ `<BonkiLoadingScreen/>` at 602 | Flash-free |
| 2 | `ProductHome.tsx` | 78 | ✅ bg-matched div at 95 | Flash-free |
| 3 | `CardView.tsx` | 202 | ✅ included in `needsPaywall` predicate (208) | Flash-free |
| 4 | `Category.tsx` | 300 | ✅ gates kids category view | Flash-free |
| 5 | `Category.tsx` | 119 | ❌ ignores `loading` | Safe — single `false→true` flip |
| 6 | `KidsCardPortal.tsx` | 172 | ❌ ignores `loading` | Safe — purchased badge only |
| 7 | `CompletedSessionView.tsx` | 70 | ❌ ignores `loading` | Safe — CTA visibility only |
| 8 | `StillUsExplore.tsx` | 40 | ❌ ignores `loading` | Safe — conditional section only |

The 4 critical "would-flash-paywall" consumers (1–4) are protected by the Step 4 hook fix. The 4 non-gating consumers (5–8) are decoration-only — `hasAccess` starts `false` and flips at most once to its real value when both auth and DB resolve. No transient `true → false → true` sequence is possible because the hook never returns `false` *after* returning `true` for the same user.

**Conclusion:** Zero source code changes required for Step 5. Adding loading skeletons to (5–8) would *introduce* a flash where there is none today (a delayed flip is gentler than a skeleton).

---

## Step 7 — Verification walkthrough

See `/mnt/documents/step-7-verification-report.md` for the full report.

---

## Bug 1 + Bug 2 — Status

- **Bug 1 (auth race):** Closed by Step 4.
- **Bug 2 (cross-product session wipe):** Closed by Step 2 migration (partial unique index `uniq_active_session_per_space_product` scoped to `(couple_space_id, product_id)`) + Step 3 backfill.

## Out of scope (deferred)

Lifting product-access state into a single `ProductAccessContext` to fix the lobby's N+1 query pattern. Not part of this work.
