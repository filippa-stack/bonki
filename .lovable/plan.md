

## Generate App Store product image for Vårt Vi

You're right — I generated raw character sketches yesterday, not the App Store product shots that match the other products. Let me create the proper one for Vårt Vi using the new illustration.

### What this is

The "App Store product image" is the marketing composition we made for each product yesterday: the character illustration placed against the product's themed background with the product wordmark/title, in a 1024×1024 square ready for App Store screenshots, marketing pages, and social.

### Plan

1. **Find yesterday's reference**: Locate one of the existing App Store product images (e.g. Jag i Mig, Jag med Andra) in `src/assets/` to confirm the exact composition language — character placement, background gradient, typography, padding.

2. **Use the new Vårt Vi illustration as the source**: The two-figure illustration from `src/assets/illustration-still-us-tile.png` (the one we just dialed in placement for) is the character art.

3. **Compose the App Store shot**:
   - **Canvas**: 1024×1024
   - **Background**: Cobalt Blue gradient matching Vårt Vi theme (`#4A6FA5` → deeper cobalt, per the locked Still Us palette)
   - **Character**: Two-figure illustration placed using the same composition rule as the other product shots (typically character anchored bottom/right with breathing room, or centered hero — match whatever the existing set uses)
   - **Wordmark**: "Vårt Vi" in the same typeface and placement as the other product images
   - **Optional tagline**: If the other shots include one (e.g. "21 samtal"), include the matching line for Vårt Vi

4. **Save the master** to `/mnt/documents/vart-vi-appstore.png` for preview.

5. **After approval**: Save into `src/assets/` under the same naming convention used for the other product App Store images (I'll confirm the exact filename pattern from the existing set before writing).

### Untouched

- Library tile illustration and its placement (already locked in).
- Hero/ProductIntro/Journal illustrations.
- All other products' App Store images.

### Verification

Visual side-by-side check: the new Vårt Vi App Store image sits next to the other products' App Store images and reads as part of the same set — same canvas, same composition language, same typography treatment.

### Rollback

Delete the new file. No code wiring touched.

