

## Update Product Home Subtitles

Update each product's `tagline` field so the dynamic formula (`{cards.length} samtal om {tagline}`) produces the correct subtitle. No component changes needed.

### Changes

| File | Current tagline | New tagline |
|---|---|---|
| `src/data/products/jag-i-mig.ts` | `När känslor får ord.` | `Känslor som får ord.` |
| `src/data/products/jag-med-andra.ts` | `Det trygga och det svåra.` | **No change** (already correct — produces "21 samtal om det trygga och det svåra.") |
| `src/data/products/jag-i-varlden.ts` | `Världen vidgas.` | `En värld som vidgas.` |
| `src/data/products/syskonkort.ts` | `Band för livet.` | `Att vara syskon.` |
| `src/data/products/still-us-mock.ts` | `Vi finns kvar` | `Att förbli ett vi.` |
| `src/data/products/vardagskort.ts` | `Det vanliga, på djupet.` | **No change** |
| `src/data/products/sexualitetskort.ts` | `Kropp, gränser och identitet.` | **No change** |

### Files edited
- `src/data/products/jag-i-mig.ts`
- `src/data/products/jag-i-varlden.ts`
- `src/data/products/syskonkort.ts`
- `src/data/products/still-us-mock.ts`

