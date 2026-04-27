## Disclaimers + iOS-hide sexualitetskort + remove age labels (Apple 1.4 / 5.1.3 / 1.2.1(a))

Six places. Places 3 (App Store description) and 4 (sexualitetskort copy audit — already verified clean) are non-code.

App Store age rating stays at **9+ with Mature/Suggestive Themes: Mild/Infrequent** per your decision (warranted by `jag-i-varlden` 12+ identity/sexuality cards).

---

### Place 1 — Trust line on 5 paywall + intro surfaces

Replace the existing single trust line with **two stacked lines**.

- Line 1 (existing slot, normalised): `Utvecklat tillsammans med legitimerade psykologer · 29 års klinisk erfarenhet`
- Line 2 (new, smaller, opacity 0.6): `Bonki är ett samtalsverktyg, inte terapi eller medicinsk rådgivning`

| File | Line |
|---|---|
| `src/components/ProductPaywall.tsx` | 422 |
| `src/components/ProductIntro.tsx` | 435 |
| `src/pages/BuyPage.tsx` | 432 |
| `src/components/PaywallBottomSheet.tsx` | 294 (matches existing italic style) |
| `src/pages/PaywallFullScreen.tsx` | 235 (added as second bullet item) |

Reuse existing `LANTERN_GLOW` / `DRIFTWOOD` tokens. Line 2 styled `12px`, opacity 0.6, marginTop 4px.

### Place 2 — Onboarding welcome disclaimer

`src/components/Onboarding.tsx` — under "Börja" CTA (inside `motion.div` ~line 368–395):

> Bonki är ett samtalsverktyg utvecklat med psykologer. Det ersätter inte professionell vård. Vid behov av stöd, kontakta vårdcentral eller 1177.

`font-sans`, `12px`, `color: '#FDF6E3'`, `opacity: 0.45`, `lineHeight: 1.5`, `textAlign: 'center'`, `marginTop: 4px`.

### Place 3 — App Store Connect description (manual, you handle)

> Bonki är ett samtalsverktyg utvecklat tillsammans med legitimerade psykologer. Appen är inte terapi och ersätter inte professionell vård.

### Place 4 — Sexualitetskort copy audit (read-only, done)

Confirmed Socratic framing, all 119 prompts are open questions, no medical advice/diagnosis/instruction. **No copy edits.** Place 5 hides it from iOS regardless.

### Place 5 — Hide sexualitetskort on iOS native

Filter at user-facing surfaces, not at `allProducts` (9+ files use non-null `find(...)!` and would crash; journal history needs the manifest available).

1. **New** `src/lib/platform.ts`:
   ```ts
   import { Capacitor } from '@capacitor/core';
   export const isIOSNative = () =>
     Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
   export const HIDDEN_PRODUCT_IDS_IOS = ['sexualitetskort'] as const;
   export const isProductHiddenOnPlatform = (productId: string) =>
     isIOSNative() && (HIDDEN_PRODUCT_IDS_IOS as readonly string[]).includes(productId);
   ```
2. `ProductLibrary.tsx` line 587: drop `sexualitet` from `defaultKidsOrder` when `isIOSNative()`. iOS = 6 tiles, web = 7.
3. `src/lib/productRecommendations.ts`: filter `'sexualitetskort'` out of every chain at runtime + short-circuit the `'sexualitetskort'` chain key when `isIOSNative()`.
4. `src/pages/ProductHome.tsx` + `src/pages/CardView.tsx`: redirect to `/` when `isIOSNative() && product.id === 'sexualitetskort'` (deep-link guard).
5. `DevModeBadge.tsx` untouched (admin QA).

Untouched: `allProducts`, manifest file, DB, reviewer's `user_product_access`.

### Place 6 — Remove in-app age badges from library tiles

Audit complete (8 files reference `ageLabel`). Only **one** renders a visible badge:

- `src/components/ProductLibrary.tsx:420` — `{tagline}{ageLabel ? \` · ${ageLabel}\` : ''}` → change to `{tagline}` only.
- Same file: remove `ageLabel?` from tile prop type (line 234), destructure (243), prop pass-through (1178).
- Line 330: `top: ageLabel ? '50px' : '12px'` → `top: '12px'` (badge area gone).

Internal `ageLabel` use in `pronouns.ts` / `CardView.tsx` / `CompletedSessionView.tsx` picks completion-message tone — **not rendered as "X+"**, leave intact.

`ageLabel?` already optional in `src/types/product.ts:30`. Manifest data values stay (no breakage).

Update memory `mem://ux/library/tagline-metadata-standards` after edit (current rule contradicts new behavior).

---

### Build order

1. Place 1 — 5 trust-line edits.
2. Place 2 — Onboarding disclaimer footer.
3. Place 5 — `platform.ts` + library filter + recommendation filter + route guards.
4. Place 6 — Strip ageLabel rendering from `ProductLibrary.tsx`.
5. Update tagline-metadata memory.
6. `bunx tsc --noEmit`.

### Out of scope

- App Store Connect description / age questionnaire / screenshots / keywords (manual).
- No changes to `allProducts`, manifest data, DB, RLS, or `getAgeGroup` tone logic.
