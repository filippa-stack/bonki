

# Extend Hero Illustration Behind Tiles as Watermark

## What changes

Two surgical edits per product home screen: (1) increase hero container height so the illustration physically reaches behind the tile grid, and (2) soften the scrim gradient so a subtle watermark remains visible through the tiles.

## Current vs Target

```text
CURRENT                          TARGET (from mockups)
┌─────────────────┐              ┌─────────────────┐
│  illustration    │              │  illustration    │
│  (65-75vh tall)  │              │  (100vh tall)    │
│                  │              │                  │
│▓▓▓▓ scrim ▓▓▓▓▓▓│ ← kills     │░░ soft scrim ░░░░│ ← fades but
│████ solid bg ████│   image      │░░░░░░░░░░░░░░░░░│   ~6-8% remains
│  [tile grid]     │              │  [tile grid]     │ ← watermark
│████████████████ █│              │░░░░░░░░░░░░░░░░░│   visible here
└─────────────────┘              └─────────────────┘
```

## Changes per file

### `src/components/KidsProductHome.tsx` (shared home)

**Line 416** — hero container height:
- `height: '65vh'` → `height: '100vh'`

**Line 441** — scrim gradient (softer, lets ~6% through at bottom):
```
background: `linear-gradient(to top, ${bg}F0 0%, ${bg}E0 15%, ${bg}C0 35%, ${bg}80 55%, ${bg}40 70%, transparent 100%)`
```

Per-product hero positioning stays exactly as-is:

| Product | top offset | objectPosition | container height |
|---|---|---|---|
| Jag i mig | `-14vh` | `50% 18%` | `100vh` (was 65vh) |
| Jag med andra | `-12vh` | `50% 30%` | `100vh` |
| Jag i världen | `-20vh` | `50% 35%` | `100vh` |
| Vardag | `-14vh` | `50% 20%` | `100vh` |
| Syskon | `-12vh` | `50% 25%` | `100vh` |
| Sexualitet | `-10vh` | `50% 25%` | `100vh` |
| Still us | `-8vh` | `50% 40%` | `100vh` |

### Standalone product homes (same two-line pattern each)

**`JagIVarldenProductHome.tsx`** line 63:
- `height: '75vh'` → `height: '100vh'`
- Scrim: same softer gradient using `${BG}` variable

**`JagMedAndraProductHome.tsx`** line 63:
- `height: '65vh'` → `height: '100vh'`
- Scrim: same softer gradient

**`VardagProductHome.tsx`** line 63:
- `height: '70vh'` → `height: '100vh'`
- Scrim: same softer gradient

**`SexualitetProductHome.tsx`** line 64:
- `height: '65vh'` → `height: '100vh'`
- Scrim: same softer gradient

**`SyskonProductHome.tsx`** line 62:
- `height: '70vh'` → `height: '100vh'`
- Scrim: same softer gradient

## What stays the same
All top offsets, objectPosition values, side bleed (`left: -5vw, right: -5vw`), tile grid layout, colors, UX, navigation, animations, portal/session/completion pages.

