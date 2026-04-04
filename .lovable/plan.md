

## Create Branded OG Image (1200×630)

### What
Generate a 1200×630 PNG for social sharing previews, featuring the BONKI logo on-brand, and update `index.html` meta tags to point to it.

### Design
- **Background**: Dark gradient from Midnight Ink (`#1A1A2E`) to Deep Dusk (`#2A2D3A`)
- **Center**: BONKI logo (`bonki-logo-transparent.png`) at ~200px height
- **Tagline below logo**: "Samtalskort för relationer — på riktigt" in warm white (`#FFFDF8`), elegant serif
- **Subtle accent**: Bonki Orange (`#E85D2C`) horizontal line or glow beneath logo
- **Clean, professional composition** — no clutter, generous spacing

### Steps

1. **Generate the OG image** using a Python script (Pillow) that composites the logo onto the branded background with tagline text → output to `/mnt/documents/bonki-og.png`
2. **Copy image to project**: Place at `public/bonki-og.png`
3. **Update `index.html`**: Change `og:image` and `twitter:image` meta tags from the Lovable placeholder to `/bonki-og.png` (will resolve to the custom domain)

### Technical notes
- Logo source: `src/assets/bonki-logo-transparent.png`
- Font: DM Sans (already loaded in the project) or system fallback for the script
- Will QA the generated image before delivering

