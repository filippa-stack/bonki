## Diagnosis

### Subtitle → resume banner gap

**KidsProductHome.tsx (lines 624–625):**
```tsx
{/* Spacer — pushes content below hero face zone */}
{!useSquareGrid && <div style={{ height: 'clamp(28px, 7vh, 60px)' }} />}
```
Line 360: `const useSquareGrid = true;` → **the spacer is never rendered.** The gap is effectively 0 from the title block; only the sticky header's own `paddingTop: 6px` and the banner wrapper's `marginBottom: 6px` create breathing room.

**AdultProductHome.tsx (line 232):**
```tsx
<div style={{ height: 'clamp(16px, 4.5vh, 40px)' }} />
```
Always rendered — adds ~16–40px of empty space that kids doesn't have. This is the visible difference.

### Subtitle typography

| Property | Kids (line 603–622) | Adult (line 217–228) |
|---|---|---|
| `fontFamily` | `var(--font-display)` | `var(--font-display)` ✓ |
| `fontSize` | `clamp(15px, 4.2vw, 19px)` | `clamp(15px, 4.2vw, 19px)` ✓ |
| `fontStyle` | `italic` | `italic` ✓ |
| `fontWeight` | **`600`** | **`500`** ✗ |
| `color` | `LANTERN_GLOW` | `LANTERN_GLOW` ✓ |
| `opacity` | (none) | **`0.85`** ✗ |
| `letterSpacing` | `0.03em` | `0.03em` ✓ |
| `textShadow` | drop shadows **+ 3 bg-color glow stops** (`0 0 24px ${bg}`, `0 0 48px ${bg}`, `0 0 72px ${bg}`) | drop shadows only ✗ |
| `marginTop` | `8px` | `6px` ✗ (kids tighter→larger) |

The lighter, more delicate look on Vårt Vi comes from `fontWeight: 500` + `opacity: 0.85` + missing glow halo.

## Fix (single file: `src/components/AdultProductHome.tsx`)

Mirror kids exactly. Use `CORNFLOWER` as the equivalent of kids' `bg` glow color (Vårt Vi's anchor — same role kids' product `bg` plays for them).

1. **Subtitle styling** (lines 217–228) — change `fontWeight` to `600`, drop `opacity`, restore `marginTop: 8px` to match kids, and add the three glow-halo shadow stops using `CORNFLOWER`:
   ```tsx
   fontWeight: 600,
   marginTop: '8px',
   textShadow: [
     '0 1px 3px rgba(0,0,0,0.9)',
     '0 2px 8px rgba(0,0,0,0.7)',
     `0 0 24px ${CORNFLOWER}`,
     `0 0 48px ${CORNFLOWER}`,
     `0 0 72px ${CORNFLOWER}`,
   ].join(', '),
   ```

2. **Subtitle → banner spacer** (line 232) — remove entirely. Kids effectively renders 0 here (spacer is gated off by `useSquareGrid`).

## Untouched
- Hero illustration, scrim, glow.
- Title `<h1>` styling.
- Resume banner, filter chips, grid, tile composition.
- KidsProductHome.tsx.

## Verification (iPhone 15, 390×844)
- Subtitle "21 samtal om att förbli ett vi." reads with the same weight, halo, and visual presence as kids subtitles.
- Resume banner sits immediately below the subtitle (only the sticky header's 6px + banner's 6px margins between them) — matching kids rhythm exactly.
- Kids product homes unchanged.
