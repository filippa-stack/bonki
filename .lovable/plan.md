I found the exact structural problem: `LibraryKidsTile` currently passes an illustration that is absolutely positioned with `inset: 0` inside `KidsTileFrame`’s child wrapper. Because the child wrapper fills the inner zone and the image fills that wrapper, the illustration treatment visually flattens the composition. The tile callsite also overrides the shared frame to `aspectRatio: '1 / 1.18'`, which conflicts with the approved 3:4 portrait mockup.

Plan:

1. Rebuild `LibraryKidsTile` structure directly for the library
   - Stop using the current `KidsTileFrame` call for the library tiles if it cannot produce the exact locked mockup structure from props alone.
   - Render the library tile as its own button with three explicit layers:
     - outer frame: product anchor color
     - inner zone: separate absolute div with calm interior color
     - title strip: bottom strip sitting on the frame color

2. Restore the approved portrait proportions
   - Set the outer tile to `aspectRatio: '3 / 4'`.
   - Use `borderRadius: 14`, `overflow: hidden`, `backgroundColor: frame`.
   - Keep the two-column grid and existing production click/access logic unchanged.

3. Make the inner zone visibly structural
   - Add an explicit inner-zone element:
     - `position: absolute`
     - `top: 14`, `left: 14`, `right: 14`
     - `bottom: '30%'`
     - `backgroundColor: interior`
     - `borderRadius: 12`
     - `overflow: hidden`
     - flex-centered contents
   - This gives a clear frame band on top/left/right and makes the calm interior read as its own rounded rectangle.

4. Place the illustration inside the inner zone only
   - Remove the previous full-zone/full-tile absolute image behavior.
   - Render the image as a normal centered child inside the inner-zone div:
     - `width: '85%'`
     - `height: '85%'`
     - `objectFit: 'contain'`
     - `objectPosition: 'center'`
   - No `position: absolute`, no `inset: 0`, no padding compensation.

5. Add the exact seam/hairline
   - Add a 1px absolute hairline at the inner-zone/title-strip boundary:
     - `left: 14`, `right: 14`, `bottom: '30%'`
     - `backgroundColor: darkText`, opacity around 0.25

6. Rebuild the title strip as the bottom 30%
   - Position it at `bottom: 0`, `height: '30%'`, `left/right: 0`.
   - Use `padding: '12px 14px'`, centered column layout, small gap.
   - Keep the existing content rules:
     - title: display serif, 16px/600, dark text
     - subtitle: italic serif, 11px, dark text at 0.7 opacity
     - metadata: small-caps 9px, dark text at 0.55 opacity
     - tasted Bonki mark remains trailing only when applicable

7. Preserve surrounding production features
   - Keep `LibraryResumeCard` and nudge buttons above `FÖR ER SOM PAR`.
   - Keep `FÖR ER SOM PAR`, `FÖR BARN · FÖR FAMILJEN`, and the age disclaimer.
   - Keep navigation, purchased/progress state, and product ordering unchanged.

8. Verify visually at 390×844
   - Open `/?devState=browse` at 390×844.
   - Confirm all seven requirements are visible:
     - outer frame band on top/sides
     - clear rounded inner zone
     - illustration inside inner zone only
     - portrait 3:4 tile shape
     - 30% title strip
     - visible hairline seam
     - readable title/subtitle/meta