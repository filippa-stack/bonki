

## Empty States for Journal and Diary

### 1. `src/pages/Journal.tsx` — Replace empty state (lines 993–1021)

Replace the current empty block with:
- Centered flexbox column with 16px gap
- Book SVG icon at 48×48, color `#D4F5C0`, opacity 0.3
- Heading "Inga samtal ännu" — `var(--font-display)`, 20px, color `#FDF6E3`
- Body "Era tankar och reflektioner samlas här efter varje samtal." — `var(--font-body)`, 14px, color `#FDF6E3` opacity 0.5
- `BonkiButton variant="secondary"` → "Utforska samtalen" → `navigate("/")`
- No animations

### 2. `src/pages/Diary.tsx` — Replace empty state (lines 577–633)

Replace the current `motion.div` empty block with the same pattern but:
- Body text: "Inga samtal i den här produkten ännu."
- CTA: "Börja ert första samtal" → `navigate(\`/product/${product.slug}\`)`
- Same book SVG, same sizing/colors
- Remove the `motion.div` wrapper (no animations per spec)

### Book SVG

Inline SVG based on the ProductLibrary book icon — a simple book path rendered as an `<svg>` element with `width={48} height={48}` and `fill="#D4F5C0"` at `opacity={0.3}`.

### Imports

- Journal.tsx: add `import BonkiButton from '@/components/BonkiButton'`
- Diary.tsx: add `import BonkiButton from '@/components/BonkiButton'`

No data fetching, routing, or session display logic changed.

