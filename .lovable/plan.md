

## Onboarding Polish — 3 Visual Fixes

All changes in `src/components/Onboarding.tsx`. No logic, routing, or state changes.

### Fix 1: Question text + spacing (lines 167–173)
- Change `padding: '20px 0 0'` → `padding: '28px 0 0'` on the pills wrapper div (adds ~8px breathing room)
- Change label text from `"Vem vill ni prata med?"` → `"Var vill ni börja?"`

### Fix 2: Reassurance microcopy (after line 199, inside the pills wrapper)
- After the pills `</div>`, add a fixed-height container (`minHeight: '20px'`, `marginTop: '10px'`)
- Inside: render `<p>` with text `"Ni kan utforska alla produkter efteråt."` only when `selectedAudience !== null`
- Style: `fontFamily: 'var(--font-sans)'`, `fontSize: '12px'`, `color: '#FDF6E3'`, `opacity: 0.35`, `margin: 0`

### Fix 3: Stronger illustration bottom fade (lines 81–91)
- Change `height: '48px'` → `height: '120px'`
- Change `background` to `'linear-gradient(to top, #1A1A2E 0%, rgba(26, 26, 46, 0.85) 40%, transparent 100%)'`

