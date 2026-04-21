

## Tweak KontoIcon to a frosted circular pill

Single-file visual update to `src/components/KontoIcon.tsx`. No other files touched.

### Change

Update the `style` object on the `motion.button`:

- `padding`: `'8px'` → `'9px'`
- Add `borderRadius: '999px'`
- Add `backgroundColor: 'hsla(0, 0%, 100%, 0.08)'`
- Add `backdropFilter: 'blur(8px)'`
- Add `WebkitBackdropFilter: 'blur(8px)'`
- `opacity`: `0.6` → `0.9`

Everything else (positioning, color prop, `CircleUser` size 22 / strokeWidth 1.5, motion props, aria-label, onClick) stays identical.

### Result

~40px circular frosted-glass pill behind the icon. Reads as tappable on both dark and vibrant backgrounds without changing layout — the host pages already reserve room around the absolutely-positioned button.

### Not touched

KontoSheet, ProductLibrary, KidsProductHome, ProductHome, Journal, Header — all unchanged.

