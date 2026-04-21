

## Revert frosted pill, just brighten the icon

Single-file edit to `src/components/KontoIcon.tsx`. Drop the circular background entirely — it clashes visually. Keep only the opacity bump that makes the icon read clearly.

### Change

In the `motion.button` style object:

- Remove `borderRadius: '999px'`
- Remove `backgroundColor: 'hsla(0, 0%, 100%, 0.08)'`
- Remove `backdropFilter: 'blur(8px)'`
- Remove `WebkitBackdropFilter: 'blur(8px)'`
- Revert `padding: '9px'` → `'8px'`
- Keep `opacity: 0.9` (was 0.6 originally — this is the only visibility change that stays)

Everything else (positioning, color prop, `CircleUser` size 22 / strokeWidth 1.5, motion props, aria-label, onClick) is unchanged.

### Result

Plain icon, no background pill, just rendered at 0.9 opacity instead of the original 0.6 — visible without the frosted-glass artifact.

### Not touched

Any other file.

