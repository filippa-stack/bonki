## Goal

Restore per-product accent colors on the library tiles. Library page background and all other elements stay exactly as they are.

## Scope

Single file: `src/components/ProductLibrary.tsx`, single property change inside the `PastelTile` component.

## Change

In `PastelTile` (line 150), replace the uniform dark surface:

```ts
background: '#2A2D3A',
```

with a per-product accent looked up from a small map keyed by `productId`:

```text
still_us         #A8B5C9
jag_i_mig        #2A6B65
jag_med_andra    #B85A8A
jag_i_varlden    #BAC03E
vardagskort      #6FB498
syskonkort       #C4A5D6
sexualitetskort  #DD958B
```

Fallback for unknown ids: `#2A2D3A`.

## Untouched

- Library page background and atmospheric layers
- Tile border, border-radius, box-shadow (`none`)
- Title block, tagline, illustration zone, pill
- Hover/tap motion
- Resume card, mock route, gradients, text-shadows, CSS tokens

No additions of any kind beyond the single `background` value per tile.
