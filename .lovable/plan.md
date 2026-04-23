

## Assessment: Vårt Vi tile illustration placement — 7/10

Honest read against the screenshot you shared and the surrounding tiles.

### Comparison

| Aspect | Kids tiles (Jag i Mig, Jag med Andra…) | Vårt Vi tile (current) |
|---|---|---|
| Crop | Full-character, dramatic bleed right | Heads + shoulders only, centered |
| Containment | Character contained inside tile | **Heads clipped at top edge** |
| Anchoring | Right-aligned, text breathes left | Centered → collides with title |
| Negative space | Sky/background visible above | Almost no breathing room above |
| Drama | Confident, designed bleed | Feels like an accidental crop |

### What's wrong, specifically

1. **Top clipping.** The two heads are kissed by the tile's top border. Compare to Jag i Mig where the figure has clear sky above it. The Vårt Vi composition reads as "stuck" rather than "framed".
2. **Centered, not right-aligned.** Every other tile uses the right-side bleed pattern (`right: -5%/-8%/-12%`, text left). Vårt Vi uses `left: -5%, right: -5%` (centered), which puts the figures directly behind the "Vårt Vi" wordmark — the green hair overlaps the V.
3. **No drop-shadow grounding parity.** Same shadow filter as kids, but because the figures are centered and clipped, the shadow doesn't sell depth.
4. **Inconsistent system.** Vårt Vi is the only tile not using the shared `PastelTile` component or the `ILLUSTRATION_SCALE` / `ILLUSTRATION_OFFSET` maps — it has bespoke positioning hardcoded inline at lines 986–1008. That's why it looks off-pattern.

### What's right

- Tile background (#94BCE1 cobalt-light) is on-brand and harmonizes with the dark shell.
- Text scrim (stronger than kids tiles: 0.55 → 0 vs 0.35 → 0) keeps "Vårt Vi" + tagline legible despite the busy illustration.
- Badge styling matches the kids tiles.
- Tile height (260px) matches Jag i Mig — good rhythm.

### Recommended fix (one tile, one file)

Edit `src/components/ProductLibrary.tsx` lines 986–1008 — the inline illustration block — to match the kids' bleed-right pattern:

```text
top:    -8%   (was -15%)  → pull figures down so heads aren't clipped
left:   auto  (was -5%)   → release left side
right:  -10%  (was -5%)   → bleed off right edge
bottom: -8%   (was -10%)
width:  78%   (new — constrain so figures don't fill full width)
objectPosition: 'right bottom'  (was 'center center')
```

Net effect: figures shift right and down, heads gain ~20px of sky above, "Vårt Vi" wordmark sits in clean negative space on the left — same compositional logic as every other tile.

Optional follow-up (not in this fix): migrate Vårt Vi to use `PastelTile` so it inherits the shared offset/scale maps and future tile tweaks apply uniformly.

### Verdict

Currently **7/10**. The asset itself is great and the color is right, but the placement breaks the visual rule the rest of the library follows (right-bleed + left-anchored text). Apply the offset fix above and it'll sit at **9.5/10** and match the kids tiles.

