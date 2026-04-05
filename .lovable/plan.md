

## Regenerate Favicon Mockups with Browser-Quality Resampling

The previous mockups used basic downscaling, which made the icons look pixelated. The current live favicon looks crisp because browsers use high-quality resampling (similar to Lanczos/bicubic). We'll regenerate the mockups using the same technique.

### What changes

- Use **LANCZOS resampling** (highest quality) when scaling down the new creature logo (`2-4.png`) and wordmark (`3-3.png`) to 16px, 20px, 32px, and 120px sizes
- Add slight **sharpening** after downscale to simulate how Retina displays render small icons
- Render against realistic Safari UI chrome for accurate representation
- Output to `/mnt/documents/` as updated mockup PNGs, replacing the previous versions

### Steps

1. Re-run the Python/Pillow mockup script with `Image.LANCZOS` resampling and a mild sharpen filter at small sizes
2. QA each mockup by visual inspection
3. Deliver updated `favicon-mockup-creature.png` and `favicon-mockup-wordmark.png`

