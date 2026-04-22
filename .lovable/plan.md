

## Generate 1024×1024 App Store IAP icons for all 7 products

Apple requires one square 1024×1024 PNG per in-app purchase. Spec: PNG, no alpha, no rounded corners (Apple masks), flat composition, immediately recognizable at small sizes (the icon shows up at ~60×60 in App Store IAP listings).

### Approach

Composite each product's existing hero illustration (`src/assets/illustration-*.png`) centered on its brand `backgroundColor`. Same recipe across all seven so they read as a coherent family in the IAP list. No text on the icons (Apple recommends against it — the IAP title is shown beside the icon, and text becomes illegible at thumbnail size).

### Mapping (product → illustration → background)

| Product | Illustration asset | Background |
|---|---|---|
| Jag i Mig | `illustration-jag-i-mig.png` | `#115D57` |
| Jag med Andra | `illustration-jag-med-andra.png` | `#721B3A` |
| Jag i Världen | `illustration-jag-i-varlden.png` | `#606613` |
| Vardag | `illustration-vardag.png` | `#48A873` |
| Syskon | `illustration-syskon.png` | `#8E459D` |
| Närhet & Intimitet | `illustration-sexualitet.png` | `#AF685E` |
| Vårt Vi | `illustration-still-us.png` | `#4B759B` |

### Composition recipe (identical for all 7)

- Canvas: 1024×1024, RGB (no alpha), filled with the product `backgroundColor`
- Illustration: scaled to fit within ~70% of the canvas (≈ 720px box), centered, preserving aspect ratio
- Subtle radial vignette (multiply blend, ~12% strength) to add depth without breaking the flat aesthetic
- No text, no logo, no border, no shadow — Apple masks corners and the illustration must carry the recognition

### Output

Seven files in `/mnt/documents/app-store-iap/`:
- `jag-i-mig-1024.png`
- `jag-med-andra-1024.png`
- `jag-i-varlden-1024.png`
- `vardag-1024.png`
- `syskon-1024.png`
- `narhet-intimitet-1024.png`
- `vart-vi-1024.png`

Plus a `README.txt` mapping each file to its IAP product name and product ID for the App Store Connect upload step.

### Build steps (when approved)

1. Python script using Pillow: read each illustration from `src/assets/`, composite onto the brand-colored canvas at the recipe above, save as 1024×1024 RGB PNG (no alpha, sRGB).
2. QA: open each PNG, verify (a) exact 1024×1024, (b) no alpha channel, (c) illustration centered and not clipped, (d) brand color matches the manifest hex exactly.
3. If any illustration looks weak at thumbnail size (downscale to 60×60 mentally), adjust scale up to ~80% for that single product and re-render.
4. Deliver the seven PNGs + README as `<lov-artifact>` tags.

### Not doing

- No new in-app screens, components, or routes.
- No edits to product manifests or assets.
- No marketing 1024 app icon (that's a separate Apple requirement — these are IAP icons only, per the request).
- No text overlays — App Store Connect shows the IAP display name next to the icon already.

