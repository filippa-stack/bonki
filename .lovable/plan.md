Rebuild the library to match the attached locked mockup exactly. The previous attempts drifted because they leaned on the extracted primitive's defaults instead of measuring the mockup. The live screenshot confirms the main mismatches: Vårt Vi still renders as a dark glass card instead of the blue marquee plate, and the kids tiles are too short with illustrations floating as small circular shapes instead of filling the inner zone.

1. Page structure (preserve production features)
   - Header: centered serif `Biblioteket` (28/500) with small-caps `SAMTAL FÖR HELA FAMILJEN` underneath.
   - Keep the `LibraryResumeCard` and the next-step / return-user nudge buttons exactly where they are now: above the `FÖR ER SOM PAR` section. They are production features and stay. Only verify they don't visually clash with the mockup composition.
   - Preserve dark shell, account icon, bottom nav, atmospheric background layers.

2. Vårt Vi marquee — rebuild as the blue plate from the mockup
   - Solid cornflower-blue (`#6495ED`) horizontal plate, ~14–16px corner radius. No dark glass background, no white border, no heavy shadow.
   - Generous inner padding (~22px vertical, 18px horizontal).
   - Left: ~110px circular medallion in the same blue family, with a darker inner ring and the centered illustration.
   - Right column:
     - `Vårt Vi` serif title (22/500) in lantern glow.
     - Italic serif subtitle `De samtal ni redan vill ha`.
     - Row with progress pill (`{completed} av {total}` when purchased; `Du har provat` with BonkiLogoMark when tasted; `{total} samtal` otherwise) followed by a `21 SAMTAL` small-caps eyebrow.

3. Kids tile proportions — match mockup catalog-plate shape
   - Keep `KidsTileFrame`, but in `LibraryKidsTile` override sizing to portrait `aspectRatio: '1 / 1.18'` (taller than current `1 / 1.05`).
   - Two-column grid, 12px gutter unchanged.
   - `stripFraction` ~0.26 so the title strip occupies a clear footer band but the inner zone dominates.
   - Inner zone inset 14px on top/sides; bottom flush against strip with the existing 1px hairline.

4. Inner-zone tinting (already remapped) — verify
   - Confirm `getCalmInterior` returns a visibly lighter variant for every product (jag_i_mig idx 3, jag_med_andra idx 2, jag_i_varlden idx 2, vardagskort idx 3, syskonkort idx 4, sexualitetskort idx 3). Already in place; no further change needed.

5. Illustration sizing — fill the inner zone (key correction)
   - Replace the current `maxWidth/maxHeight: 70%` floating illustration with a fill-the-zone treatment:
     - `position: absolute; inset: 0; width: 100%; height: 100%; objectFit: contain; padding: 10px;` (use `boxSizing: border-box`).
   - This lets each illustration's natural aspect ratio drive the layout: tall figures fill vertically with horizontal margin, wide scenes fill horizontally with vertical margin. Each illustration reads as the hero element of the tile, not a small floating decoration inside an implicit circle.
   - Drop the `drop-shadow` filter so illustrations sit cleanly on the interior color.

6. Title strip typography & metadata
   - Title: serif (`Fraunces`), 16px, weight 600, product dark text color.
   - Subtitle: italic serif, 11px, opacity 0.7, taglines from `TAGLINES` map.
   - Meta row, always visible: `{N} AV {TOTAL} · FRÅN {age}` for purchased, `{TOTAL} SAMTAL · FRÅN {age}` otherwise. Small-caps, 9px, opacity 0.55. Trailing `BonkiLogoMark` only in tasted state.

7. Copy & ordering
   - Section labels (small-caps): `FÖR ER SOM PAR` (changed from `FÖR PAR`) and `FÖR BARN · FÖR FAMILJEN`.
   - Disclaimer below kids section label, italic serif, 12px, lantern glow @ 0.55: `Åldrarna är en vägledning. Ni känner ert barn bäst.`
   - Locked kids order: Jag i Mig, Jag med Andra, Vardag, Syskon, Jag i Världen, Närhet & Intimitet.

8. Verification at 390×844
   - Open `/?devState=browse` in the sandboxed browser at the same viewport as the mockup.
   - Compare side-by-side against the uploaded reference: header spacing, marquee blue/medallion/right-column layout, kids tile aspect, inner-zone fill behavior per product (tall figures vs wide scenes), title-strip metadata row, disclaimer presence.
   - Iterate once if proportions or illustration fill are still visibly off before reporting back.

Files to edit
- `src/components/ProductLibrary.tsx` — `LibraryKidsTile` (illustration sizing, aspect, stripFraction), `StillUsMarquee` (already on plate), `SectionEyebrow` callsite copy `FÖR ER SOM PAR`.
- No changes needed to `KidsTileFrame.tsx`, `productTileVariants.ts`, or production data files.