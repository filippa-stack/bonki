# Fix Vårt Vi illustration clipping — max-box sizing across 4 surfaces

Replace fixed-width sizing with constrained max-box. Surface 4 uses 88% pre-emptively.

- **Surface 1** `AdultProductCardTile.tsx` Zone A img → `maxWidth: '80%'`, `maxHeight: '88%'`, `width/height: auto`, contain/center, existing drop-shadow.
- **Surface 2** `ProductLibrary.tsx` StillUsMarquee img → drop `aspectRatio`, set `width/height: auto`, `maxWidth/maxHeight: 130`, contain/center, existing drop-shadow.
- **Surface 3** `AdultCardPortal.tsx` PortalCardImage img → same as Surface 1.
- **Surface 4** `LibraryResumeCard.tsx` isStillUs img → `maxWidth/maxHeight: '88%'`, `width/height: auto`, contain/center, existing 3px/4px drop-shadow.

Mat colors, shadows, title strips, kids surfaces unchanged.
