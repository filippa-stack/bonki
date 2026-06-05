## Goal
Produce a 1024×1024 px PNG to upload to the App Store as the SEXUALITET product's promo/feature graphic, saved to `/mnt/documents/` for download.

## Design direction
- Square 1024×1024 promo tile, on the SEXUALITET brand background `#7E4838` (warm terracotta brown).
- Place the existing `illustration-sexualitet.png` creature character (closed-eyes, embracing figures — same hand-drawn flat style used across BONKI products) centered on the background.
- Add the word **Sexualitet** as a clean type label (Fraunces, light weight, off-white) below the creature, matching the BONKI editorial brand voice.
- Calm, intimate, non-graphic — consistent with the rest of the kids product tiles (Jag i Mig, Vardag, Syskon).
- No additional copy, no logos.

## How
1. Build a small Node/Canvas script (or use `sharp`) that:
   - Creates 1024×1024 canvas filled `#7E4838`.
   - Composites `src/assets/illustration-sexualitet.png` (the existing creature) centered, scaled to ~70% of canvas height.
   - Renders the word "Sexualitet" beneath in Fraunces (or a close serif fallback) in soft cream `#F4E9D8`.
2. Write output to `/mnt/documents/sexualitet-appstore-1024.png`.
3. QA: open the resulting PNG, check creature isn't clipped, text is centered and legible, colors match the in-app product palette. Iterate if needed.
4. Deliver via `<presentation-artifact>` tag for download.

## Notes / open questions
- Using the existing illustration keeps brand consistency with how SEXUALITET appears in the app today. If you'd rather have a brand-new AI-generated illustration instead of reusing the existing creature, say so and I'll swap step 1 to call the image generation tool.
