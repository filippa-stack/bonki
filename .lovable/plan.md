# Bonki Product Catalogue — PDF document

A designed, print-ready PDF (`bonki-product-catalogue.pdf`, ~14 pages) that documents the **content and purpose of every product** in the Bonki app. Same visual system as the Brand Essentials PDF (Vera font, dark-shell + vibrant product palettes, BONKI logo).

## What each product spread will contain

For each of the 7 products, one full spread (1–2 pages) covering:

1. **Product name + tagline** (from manifest, e.g. "Jag i Mig — Känslor som får ord")
2. **Audience** (internal age guidance, e.g. 3+, 6+, 12+, 13+, par/vuxna) — noted as internal-only since it is never rendered in-app
3. **Purpose / value line** (the official emotional pitch, from `mem://product/content/value-lines`)
4. **Welcome copy** — the full intro slide text shown to users on first visit (from `productIntros.ts`)
5. **Structure** — the 4 categories (title + subtitle + card count) from each manifest
6. **Free starter samtal** — which card a new user gets free
7. **Color palette** — product's signature color triplet from `palette.ts`

## Products covered (in app order)

```text
1. Jag i Mig          — Känslor som får ord            (3+, 21 samtal, 4 lager)
2. Jag med Andra      — Det trygga och det svåra       (6+, 21 samtal, 4 lager)
3. Jag i Världen      — En värld som vidgas            (12+, 20 samtal, 4 lager)
4. Vardag             — Det vanliga, på djupet         (6+, 15 samtal, 4 lager)
5. Syskon             — Att vara syskon                (6+, 4 lager)
6. Sexualitet         — Kropp, gränser och identitet   (13+, 14 samtal, 4 lager)
7. Vårt Vi (Still Us) — Att förbli ett vi              (par, 21 samtal, 4 lager)
```

## Document outline

```text
Cover               — BONKI logo, "Produktkatalog 2026"
Page 2  Innehåll    — TOC + 1-line summary of each product
Page 3  Översikt    — Två produktfamiljer: Barn & familj / Par
Pages 4–15          — One spread per product (see structure above)
Closing page        — "Gemensamma principer": no diagnostics,
                      Swedish-only, ni-/du-språk, free starter card policy
```

## Technical approach

- Python + ReportLab (Platypus), same toolkit and Vera fonts as the Brand Essentials PDF
- Reads directly from: `src/data/products/*.ts` (manifest metadata, categories), `src/data/productIntros.ts` (welcome copy), `src/lib/palette.ts` (colors), and the Value Lines memory
- Each product spread uses that product's signature color as accent on a dark shell
- BONKI logo embedded from `src/assets/bonki-logo-transparent.png`
- Output: `/mnt/documents/bonki-product-catalogue.pdf`
- Standard QA: render every page to JPEG, inspect for overflow / overlap / clipping, fix and re-export until clean

## Out of scope

- No per-card prompt listings (would balloon to 100+ pages — say so if you want a "full prompt appendix" version separately)
- No screenshots
- No editable Word/Slides version
