

## Make the resume banner more visually distinct

### Problem
The product tile colors (e.g. `#C6D423` lime for Jag i Världen) at 0.15 opacity against the dark `#0B1026` page background produce almost no visible tint. The border at 0.25 opacity is equally subtle.

### Solution
Increase the opacity values so the color tint is clearly visible:

**In `src/components/LibraryResumeCard.tsx`:**

| Property | Current | New |
|---|---|---|
| `background` | `hexToRgba(tileBg, 0.15)` | `hexToRgba(tileBg, 0.18)` |
| `border` | `hexToRgba(tileBg, 0.25)` | `hexToRgba(tileBg, 0.35)` |
| `backgroundImage` first stop | `hexToRgba(tileBg, 0.2)` | `hexToRgba(tileBg, 0.28)` |
| Outer glow shadow | `hexToRgba(tileBg, 0.20)` | `hexToRgba(tileBg, 0.30)` |

This bumps the tint enough to be clearly visible while still keeping the glassy, premium feel. The border gets the biggest boost since it's the primary visual edge. No logic or data changes.

