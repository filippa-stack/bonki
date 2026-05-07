## Widen kids tile variant spread

Single-file edit to `src/lib/productTileVariants.ts`. Replace the `variants` array on each of the six kids products so every variant reads as visibly distinct from the frame.

### Changes (variants only)

| Product | Frame | New variants |
|---|---|---|
| `jag_i_mig` | `#E89B6B` | `['#B86838', '#DC8050', '#F0B080', '#FAD2B0']` |
| `jag_med_andra` | `#CB7AB2` | `['#92356A', '#B05A8C', '#E5B0D0']` |
| `jag_i_varlden` | `#C6D423` | `['#989826', '#B0B038', '#E0EA85']` |
| `vardagskort` | `#8BDDB0` | `['#3F8E72', '#62B090', '#B0E8C8', '#DCF5E5']` |
| `syskonkort` | `#CF8BDD` | `['#8C70A8', '#A689BD', '#C5A8D6', '#DEC3E5', '#ECD5F0']` |
| `sexualitetskort` | `#B87560` | `['#8A5340', '#A56350', '#C8907A', '#DBB5A0']` |

### calmIndex verification

In every new array, the lightest variant sits at the highest index, which matches the current `calmIndex` values (3, 2, 2, 3, 4, 3 respectively). No `calmIndex` updates required.

### Untouched

- `permutation` arrays (assignment algorithm unchanged)
- Frame colors in product manifests
- `getInteriorForCard` / `getCalmInterior` logic
- Library calm tile usage
- All non-kids surfaces

After implementation: visually verify on 390×844 that each kids product home shows a clearly perceptible inner zone on every tile.
