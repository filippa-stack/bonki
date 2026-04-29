# Refresh stale docs: pricing model + funnel walkthrough

You're right on all three points. The PDFs from yesterday described an older "everyone gets a free first card on every product" model. The live policy is narrower, and the funnel needs to reflect that.

## What's actually live (verified in code)

`src/lib/freeCardPolicy.ts` + `mem://features/free-card-eligibility-policy`:

- A user gets **1 free conversation total**, on the **single product that matches the audience they picked during onboarding**.
  - `young → jag_i_mig`
  - `middle → jag_med_andra`
  - `teen → jag_i_varlden`
  - `couple → still_us`
- All **other products are paywalled from the first tap** (ProductHome shows the full-screen paywall before any content).
- Legacy users with no stored `bonki-onboarding-audience` still see free cards on all products (small, shrinking cohort).
- After that one free card is completed, the in-card CTA flips to **"Lås upp {product}"** at 249 kr (Still Us) / 195 kr (kids products).

So "free taste" exists, but it's **one card on one product**, not "first card free on everything," and not "a sample question." The marketing-site claim "Första kortet alltid gratis" is closer to the truth than "sample question," but still misleading because it doesn't say *only on the product matching your child's age*.

## Deliverables

Two refreshed PDFs in `/mnt/documents/`, plus a short marketing-copy advisory.

### 1. `bonki-pricing-model-v2.pdf`

Rewrite the stale sections. New structure:

- **Pris** — Still Us 249 kr, kids-produkter 195 kr, engångsköp, ingen prenumeration (unchanged).
- **Gratisåtkomst (uppdaterad)** — Replace "ETT GRATIS SAMTAL — Provspela innan du bestämmer dig" with:
  > **Ett riktat gratissamtal.** Användaren får ett (1) gratis samtal — men endast på den produkt som matchar barnets ålder/relationsval i onboardingen. Övriga produkter är låsta från första interaktionen.
- **Konverteringsmodell** — explicit table of audience → free product → paywalled products.
- **Implications-sektion** (new): paid-acquisition är brantare än "första kortet alltid gratis"-modellen antyder. Användaren betalar 249 kr efter ett enskilt samtal, inte efter att ha provat hela produkten. Kräver starkare social proof / before-purchase-värdebevis.
- **Legacy-cohort note** — användare utan onboarding-audience (gammal app-version) har bredare gratisåtkomst; denna grupp krymper.

### 2. `bonki-funnel-walkthrough-v2.pdf`

Fix the `/unlock` step description. New funnel:

```
Landing → Onboarding (audience-val) → Product home for matching product
   → Free card (1 samtal) → Completion screen with inline "Lås upp"-CTA
   → Paywall (/paywall-full?product=...) → Stripe checkout → /?purchase=success
```

Plus a parallel branch for non-matching products:

```
Library tile (other product) → ProductHome → Full-screen paywall (immediately, no free card)
```

Remove the line "after the first free conversation" wherever it implies the free card is universal. Add a sidebar showing which products are gated for which audiences.

### 3. Marketing-copy advisory (inline in pricing PDF, ~½ page)

Flag the bonkistudio.com/pages/appen mismatch:
- Site says "Första kortet alltid gratis" multiple times.
- Live app: only free on one product, the one matching onboarding.
- Recommendation: change site copy to either
  - **(a) Match reality:** "Ett gratis samtal på den produkt som passar ditt barn — resten låses upp för 195 kr per produkt." (honest, slightly less punchy)
  - **(b) Restore the old promise in the app:** re-enable a free card on every product's first session (product decision, not a docs fix).
- Note the trust risk: Swedish parents notice promise/experience gaps and it costs more in goodwill than it saves in conversion.

## Out of scope

- No code changes. This is a docs refresh + advisory.
- I won't edit the marketing site (different codebase). The advisory tells you what to change there.
- If you want me to also update `bonki-ux-architecture.pdf` or `bonki-product-catalogue.pdf` for consistency, say so and I'll add them.

## Technical notes

- Use the `docx`/PDF generation pattern already used for the other Bonki PDFs (Swedish copy, dark `#0B1026` cover, BONKI wordmark, Saffron accent).
- Output: `/mnt/documents/bonki-pricing-model-v2.pdf` and `/mnt/documents/bonki-funnel-walkthrough-v2.pdf` (keep v1 files so you can diff).
- QA: render each page to JPG and visually inspect before delivery.
