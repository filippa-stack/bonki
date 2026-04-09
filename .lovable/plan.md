

## Journal cards — visibility & intimacy pass

### Problem analysis
The product `backgroundColor` values are mid-tone (40-60% lightness), not dark like Midnight Ink. This means:
- `accent.light` text at reduced opacities (77%, 88%) lacks contrast — dates and questions are hard to read
- Lantern Glow reflection text works but the cards feel flat and clinical
- No sense of personal warmth or "diary" quality

### Solution: darken + warm

**1. Darken card backgrounds with a scrim overlay**
Instead of replacing the product colors, layer a subtle dark scrim on top to push all backgrounds into a consistently dark range while preserving the hue:

```
background: linear-gradient(180deg, ${accent.bg}, ${accent.bg}ee),
            linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.45))
```
This uses `background-blend-mode: multiply` or simpler: just darken the bg hex. But the cleanest approach: add a `::before` pseudo or simply mix the bg with black inline. Simplest inline approach:

**Use `accent.deep` as card background** instead of `accent.bg`. The `deep` values (#115D57, #4B759B → these are already the deeper tones) — wait, looking at the palette:
- Vårt Vi: bg=#4B759B, deep=#2A4B6E — deep is darker ✓
- Jag i Mig: bg=#115D57, deep=#0A3833 — deep is darker ✓
- Närhet: bg=#AF685E, deep=#6E3B34 — deep is darker ✓

Actually, `accent.deep` (tileDeep) is already the darkened version. Let me check the actual tileDeep values.

Looking at palette: tileDeep values are designed for dark surfaces. **Switch card background from `accent.bg` to `accent.deep`** — these are already dark, rich, and optimized for text contrast.

Actually, let me reconsider. The `bg` (backgroundColor) was chosen specifically. The issue is some are too bright. Better approach: **overlay a dark scrim on the existing bg**.

**Simplest fix**: Wrap with a semi-transparent dark overlay using a CSS trick:

```tsx
backgroundColor: accent.bg,
backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35))',
```

This darkens all backgrounds by ~30%, pushing mid-tones into readable territory while preserving the hue.

**2. Intimacy: warm glow + typographic touches**

| Element | Current | New |
|---|---|---|
| Card bg | `accent.bg` (solid) | `accent.bg` + dark scrim overlay (25-35% black) |
| Inner top glow | None | Subtle `box-shadow: inset 0 1px 0 ${accent.light}15` — soft highlight on top edge |
| Reflection text | `fontSize: 16px/15px` | Keep size, add `textShadow: '0 0 20px rgba(0,0,0,0.3)'` for warmth |
| Question em-dash `—` | Plain | Keep, already italic — adds editorial feel |
| Card separator (between reflections in group) | `${LANTERN_GLOW}22` gradient | `${accent.light}20` — ties to product color |
| Box shadow | `0 2px 12px rgba(0,0,0,0.25)` | `0 2px 16px rgba(0,0,0,0.35), inset 0 1px 0 ${accent.light}12` — lift + inner glow |

**3. Text contrast boost from darker background**

With the scrim, the existing opacity values become more readable. But also bump the weakest ones:

| Element | Current opacity | New |
|---|---|---|
| Date | `${accent.light}77` | `${accent.light}88` |
| Card name | `${accent.light}aa` | `${accent.light}bb` |
| "Visa alla" / "Läs mer" | `${accent.light}77` | `${accent.light}99` |
| Question text | `${accent.light}88` | `${accent.light}99` |
| Takeaway label | `${accent.light}66` | `${accent.light}77` |

### Changes in `src/pages/Journal.tsx`

**`NoteEntryCard`**:
- Add `backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35))'` alongside existing `backgroundColor`
- Update `boxShadow` to include inner top glow
- Bump text opacity values per table above

**`SessionGroupCard`**:
- Same background scrim and shadow changes
- Same opacity bumps
- Update reflection separator to use `accent.light`

### Result
Cards retain their product hue identity but sit in a consistently dark, warm range. The scrim creates depth (lighter at top, darker at bottom) that feels like candlelight — intimate, not clinical. Higher text opacities ensure readability on any product color.

### Files changed
- `src/pages/Journal.tsx` — inline styles in `NoteEntryCard` and `SessionGroupCard`

### What stays untouched
- All data fetching, queries, filters, timeline logic, protected refs
- `getProductAccent` function unchanged
- Spine, month markers, pulse card, bookmarks, CompletedMarkerRow

