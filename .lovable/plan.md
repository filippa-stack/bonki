I'm in plan mode so I can't write the artifact yet — approve this plan and I'll produce the downloadable file plus the colors reference. Both deliverables are read-only artifacts under `/mnt/documents/` (no app code changes).

## Deliverables

1. **`/mnt/documents/bonki-ux-flowchart.mmd`** — Mermaid flowchart of the full app UX (downloadable / previewable in chat).
2. **`/mnt/documents/bonki-product-colors.md`** — Reference of every product's color tokens, pulled from `src/lib/palette.ts` + each product manifest.

## UX flowchart scope

Based on `src/App.tsx` routes + product navigation patterns, the chart will cover:

- Auth gate (`/login` → Google / Magic Link) → onboarding gate
- Home / Library (`/`) → Konto sheet, Journal (`/journal`)
- Product entry: `/product/:slug` → ProductIntro (first visit) → ProductPaywall (if no access, Stripe) → ProductHome (Kids variant vs Adult variant for Vårt Vi)
- Category portal: `/product/:slug/portal/:categoryId` (KidsCardPortal vs AdultCardPortal)
- Session: `/card/:cardId` (CardView, steps 1..N, completion w/ takeaway, "Nästa samtal" / exit)
- Per-product Diary (`/diary/:productId`)
- Resume-banner + pause/exit edges back to ProductHome

## Product colors (preview — exact values that will go in the .md)

Source: `src/lib/palette.ts` (`productTileColors`, `productAccentColor`, `productDarkText`) + each `ProductManifest`.

| Product | tileLight | tileMid | tileDeep | Accent pill | Dark text on tile |
|---|---|---|---|---|---|
| Jag i mig | `#E89B6B` | `#D08560` | `#8C4A2D` | `#F2BC97` | `#5B2814` |
| Jag med andra | `#CB7AB2` | `#A85E94` | `#721B3A` | `#E59FCF` | `#511F39` |
| Jag i världen | `#C6D423` | `#A3AF1C` | `#606613` | `#D8E145` | `#363D14` |
| Vardagskort | `#8BDDB0` | `#68C494` | `#48A873` | `#A8E5C0` | `#175C3D` |
| Syskonkort | `#CF8BDD` | `#B56CC4` | `#8E459D` | `#E0BFEA` | `#3D2451` |
| Sexualitetskort | `#B87560` | `#A26350` | `#7E4838` | `#CFA08D` | `#5A2515` |
| Vårt Vi (still_us) | `#94BCE1` | `#6F9CC5` | `#4B759B` | `#E9C890` | `#0A1628` (Ember Night) |

Plus **Still Us layer colors** (Vårt Vi category tiles): Vardagen `#3A6E9B` · Tillsammans `#1E5A8A` · Grunden `#0D2E6B` · Riktningen `#0A1628`.

Plus **global shell tokens** (`MIDNIGHT_INK #1A1A2E`, `DEEP_DUSK_BG #0B1026`, `SAFFRON_FLAME #E9B44C`, `BONKI_ORANGE #E85D2C`) and adult palette extras (`CORNFLOWER`, `DUSTY_ROSE`, `STORM_GREY`, `SAGE`, `WARM_GOLD`).

The .md will also list each product's `accentColor`, `secondaryAccent`, `backgroundColor`, and `ctaButtonColor` straight from each manifest file so you have one place that shows every hex/HSL in use.

## After approval

I'll run two `code--exec` writes (flowchart + colors doc) and post them as `<presentation-artifact>` tags so you can download / preview both.
