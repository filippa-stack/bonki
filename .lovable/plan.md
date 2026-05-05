## Goal

Tint the library resume banner with the active product's accent color.

## Scope

Single file: `src/components/LibraryResumeCard.tsx`.

## Change

1. Add a `PRODUCT_ACCENT` map (same values as the tile map):

```text
still_us         #A8B5C9
jag_i_mig        #2A6B65
jag_med_andra    #B85A8A
jag_i_varlden    #BAC03E
vardagskort      #6FB498
syskonkort       #C4A5D6
sexualitetskort  #DD958B
```

2. In the resume button, look up `accent = PRODUCT_ACCENT[display.productId] ?? '#2A2D3A'` and use it as the button `background` (replacing the current `'#2A2D3A'`).

## Untouched

Layout, ghost-glow dot, typography, chevron, padding, border, text colors. Only the banner background fill changes.
