

## Switch BONKI Header Font to Bebas Neue

Replace the current Cormorant serif font on the "BONKI" heading with Bebas Neue for a bolder, more distinctive brand presence.

### Changes

**1. Load Bebas Neue font (`index.html`)**
- Add `Bebas+Neue` to the existing Google Fonts `<link>` tag

**2. Register font in Tailwind (`tailwind.config.ts`)**
- Add `fontFamily.display-brand: ['Bebas Neue', 'sans-serif']` for optional utility use

**3. Login page (`src/pages/Login.tsx`, line 141-146)**
- Change `className="font-serif"` and inline font styles to use `fontFamily: "'Bebas Neue', sans-serif"`
- Adjust `letterSpacing` to `0.08em` (Bebas Neue benefits from wider tracking)
- Bump `fontSize` to `48px` (Bebas Neue runs smaller than Cormorant at same size)

**4. Library page (`src/components/ProductLibrary.tsx`, line ~690-702)**
- Same font-family swap on the `BONKI` `<motion.h1>`
- Match letter-spacing and size adjustments

No other files reference the BONKI heading font directly.

