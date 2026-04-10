

## Update LibraryResumeCard Styling & Layout

### Changes to `src/components/LibraryResumeCard.tsx`

**1. Button background** (line ~189)
- `background: 'rgba(15, 15, 15, 0.7)'` → `` background: hexToRgba(tileBg, 0.15) ``

**2. Button border** (line ~192)
- `border: '1px solid rgba(255, 255, 255, 0.12)'` → `` border: `1px solid ${hexToRgba(tileBg, 0.25)}` ``

**3. Background gradient** (line ~196)
- First stop changes from `rgba(255,255,255,0.08)` to `${hexToRgba(tileBg, 0.2)}`
- Template literal: `` backgroundImage: `linear-gradient(135deg, ${hexToRgba(tileBg, 0.2)} 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.10) 100%)` ``

**4. Title text** (line ~215)
- Change from `{display.productName} · {display.cardTitle}` to `Fortsätt utforska {display.productName}`

**5. Step label** (line ~224)
- Change from `{display.stepLabel}` to `{display.stepLabel} · {display.cardTitle}`

No other files or logic touched.

