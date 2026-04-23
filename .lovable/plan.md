

## Generate a new 1024×1024 Vårt Vi illustration

Create a fresh hero/tile illustration for Vårt Vi in the same style as the previous one (two figures, soft pastel flat-color, cobalt blue palette), then wire it into the existing asset slots.

### What I need from you first

I want to make sure the new image actually improves on the current one rather than just being a variant. Two quick clarifications:

1. **Which slot is this for?**
   - The **library tile** (`illustration-still-us-tile.png`) — the small 260px tile on `/`
   - The **hero/home** (`illustration-still-us-home.png`) — used on ProductIntro, Journal, Category headers
   - **Both** (generate one master image, save to both)

2. **Any composition change, or pure re-roll?**
   - Same composition (two figures, side-by-side, embracing) — just a fresh take
   - Adjust composition (e.g. more headroom, different pose, single figure, etc.)

### Plan once confirmed

1. Use the AI gateway image skill (`google/gemini-3-pro-image-preview` for hero quality) with a prompt matching the established Vårt Vi visual language:
   - Soft pastel flat-color illustration, no outlines
   - Cobalt blue background (#94BCE1 family)
   - Two adult figures, warm intimate posture
   - Same brushy texture and palette as the kids illustrations (Jag i Mig girl, etc.)
   - Square 1024×1024, centered composition with breathing room top + sides so it crops cleanly into both the square hero and the right-bleed tile

2. Save the master to `/mnt/documents/vart-vi-v2.png` so you can preview it.

3. After approval, replace the chosen asset(s) in `src/assets/`:
   - `illustration-still-us-tile.png` and/or
   - `illustration-still-us-home.png`

4. No code changes needed — both files are already imported and wired to all surfaces (library tile, hero, ProductIntro, Journal, Category). Verification = visual check on `/`, `/product/still-us`, `/journal`.

### Untouched

- Tile positioning logic (the `top/right/bottom/width` values we just dialed in stay).
- All other product illustrations.
- Asset filenames — overwritten in place so no imports change.

### Rollback

Restore previous `illustration-still-us-tile.png` / `illustration-still-us-home.png` from version history.

