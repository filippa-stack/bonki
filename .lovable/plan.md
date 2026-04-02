

## Update Product Intro Content — All 7 Products

### Changes in 2 files

#### 1. `src/data/productIntros.ts` — Update body copy, remove generic signoffs

| Product | Body change | signoff field |
|---------|------------|---------------|
| `still_us` | Replace 3-paragraph body with 2 paragraphs (new copy) | Already absent — no change |
| `jag_i_mig` | Replace para 2 ("Frågorna är enkla…") with new para 2 | **Delete** signoff line |
| `jag_med_andra` | Replace last sentence of para 2 with new wording | **Delete** signoff line |
| `jag_i_varlden` | Remove last 2 sentences of para 2 | **Delete** signoff line |
| `vardagskort` | Replace para 2 with new copy | **Delete** signoff line |
| `syskonkort` | No body change needed (already matches) | Already absent — no change |
| `sexualitetskort` | No body change needed (already matches) | **Keep** signoff (used by sexSafetyLine) |

New body copy as specified in the user's request above.

#### 2. `src/components/ProductIntro.tsx` — Remove generic signoff rendering

**Delete** (lines 144–147):
```ts
const signoffText = !isSexualitet
  ? introData.slides.map((s) => s.signoff).filter(Boolean).join('\n\n')
  : '';
```

**Delete** the signoff JSX block (lines 341–355):
```tsx
{signoffText && (
  <p style={{ ... }}>{signoffText}</p>
)}
```

**Keep untouched**:
- `isSexualitet` (line 138)
- `sexSafetyLine` (lines 160–163)
- Sexualitet safety `<p>` block (lines 437–453)
- All animations, layout, CTA, "Ert första samtal" line, "Inte just nu" link
- All hooks, callbacks, server logic

### Result
Every product intro renders exactly: illustration → title → tagline → 2 body paragraphs → CTA → free reassurance → skip link (+ safety line for sexualitetskort only).

