

## App Store gallery — vibrant-only, premium pass

Locking the brief: **every framed shot must be a vibrant, color-saturated surface**. No dark library hero, no Midnight Ink shells, no muted onboarding screens. The Bonki shell is dark by design — but the *product surfaces* are flat-color and luminous, and that's all the App Store should see.

### Revised 10-frame lineup

Each row tells you the dominant color and what fills the frame. Anything dark is gone.

| # | Surface | Dominant palette | Visual content |
|---|---|---|---|
| 1 | **Vårt Vi product home** | Cobalt Blue `#4B759B` → deep navy gradient | Hero illustration `su-mock-3` huge, "Vårt Vi" wordmark, "21 samtal", value-line in Lantern Glow |
| 2 | **Jag i Mig portal grid** | Teal `#27A69C` field | 4 vibrant emotion cards visible: `jim-glad`, `jim-trygg`, `jim-arg`, `jim-radd` — flat-color illustrations, white pill labels |
| 3 | **Jag med Andra portal grid** | Pink/Berry `#CB7AB2` field | `jma-modig`, `jma-acceptans`, `jma-skam`, `jma-vanskap` — rich figurative illustrations |
| 4 | **Vardagskort portal grid** | Mint `#8BDDB0` field | `vk-morgon`, `vk-mat`, `vk-helg`, `vk-kvall` — warm everyday illustrations |
| 5 | **Active session — opening prompt (Vårt Vi)** | Cobalt Blue full-bleed | `su-mock-7` illustration at 0.7 opacity, large serif Swedish prompt centered, 4px progress bar at top |
| 6 | **Active session — Jag i Mig card** | Teal full-bleed | `jim-karlek` illustration full-bleed, prompt text overlay, BonkiButton pill at bottom |
| 7 | **Reflection step (couple)** | Cobalt Blue + Lantern Glow textarea card | Writing surface with "✓ Sparat" indicator, partner avatar dots, soft glow |
| 8 | **Card complete / takeaway** | Saffron `#E9B44C` glow on Cobalt | Celebration screen, the saved reflection rendered editorial-style with serif display |
| 9 | **Syskonkort portal grid** | Lavender `#CF8BDD` field | `sk-syskonminnen`, `sk-rattvisa`, `sk-unik`, `sk-konflikt` — sibling-themed illustrations |
| 10 | **Jag i Världen portal grid** | Lime/Olive `#C6D423` field | `jiv-vanskap`, `jiv-identitet`, `jiv-frihet`, `jiv-sjalvkansla` — bold teen-facing illustrations |

**Removed from previous list**: Library/Bibliotek (dark shell — fails brief), Journal/Arkiv (dark editorial — fails brief), Onboarding (dark + sparse — fails brief), generic "hero cover" (would have been dark Midnight Ink). All replaced with vibrant product surfaces.

**Result**: 6 different product palettes represented + 4 in-session moments. Every frame is saturated, illustration-dense, and reads at thumbnail size in App Store search — which is the actual conversion battleground.

### "10/10 only" production standards

- **Source illustrations**: real WebP files from `/public/card-images/` (128 hand-drawn assets) — not regenerated, not stylized. These are your actual product art.
- **Tile fidelity**: each portal grid composed at native 2× resolution using the real `TILE_COLORS` tokens (`#27A69C`, `#CB7AB2`, etc.) from `ProductLibrary.tsx`, the real `TAGLINES` strings, and the real card titles from each product manifest. Not mockups — pixel-accurate reconstructions of what ships in the app.
- **Device frame**: realistic iPhone 16 Pro silhouette with Dynamic Island, 60px corner radius, 6° tilt, 80px ambient shadow at 12% opacity. Frame is rendered as crisp vector geometry, not a photo overlay.
- **Backdrop strategy**: each frame's backdrop is a **darker tonal cousin** of the screen's dominant color (e.g. Teal frame → `#0F4540` backdrop). This makes the device pop without competing. No Midnight Ink backdrops anywhere.
- **Caption typography**: serif display, Lantern Glow (`#FDF6E3`), 88pt, max 2 lines, 320px top margin. Drafts from your value-lines in Pass 1 — you finalize in Pass 2.
- **No compromises**: any frame that doesn't feel like a 10/10 in the QA contact sheet gets reshot before delivery, not delivered with caveats.

### Production method (revised)

Pure SVG composition driven by the real design tokens, real WebP assets, and real Swedish strings — rendered to PNG via Python + `cairosvg` at native resolution for each device size. This guarantees:

- Pixel-perfect color (exact hex from `palette.ts` and `ProductLibrary.tsx`)
- Pixel-perfect type (your serif display + Inter, embedded as fonts)
- No html2canvas color-resolution bugs, no scaling artifacts, no live-app capture limitations
- Sub-minute regeneration when you swap captions in Pass 2

### Deliverable

`/mnt/documents/app-store-gallery-v1.zip` containing:

- `6.9-inch/01-vart-vi-home.png … 10-jag-i-varlden-portal.png` (1290×2796)
- `6.7-inch/…` (1290×2796 — same canvas, App Store Connect 6.7" slot)
- `6.5-inch/…` (1242×2688)
- `_contact-sheet.png` — all 10 frames at thumbnail size for at-a-glance vibrance check

### QA gate before delivery

I render the contact sheet first and inspect every frame for:

1. Dominant color reads as vibrant at thumbnail size (App Store browse view)
2. Device frame geometry is crisp, no aliasing on the rounded corners
3. Illustration inside the frame is sharp, not pixelated by downscaling
4. Caption type has correct kerning and doesn't break at awkward points
5. Backdrop tonal contrast against frame is balanced — not flat, not garish
6. No frame feels darker or more muted than the others (consistency check)

Any frame that fails any criterion gets re-composed before the ZIP is sealed. You receive a delivery message that lists what was checked, not just "done."

### Pass 2

You review the contact sheet, mark up captions per frame, I regenerate the ZIP as `v2`. No re-layout — text-only swaps.

