

## Reorder free cards to first position in all products

### Analysis

| Product | freeCardId | Free card's category | Category position | Card position in category | Needs change? |
|---|---|---|---|---|---|
| Jag i Mig | `jim-glad` | `jim-mina-kanslor` | 1st | 2nd (after `jim-trygg`) | Move card to pos 1 |
| Jag med Andra | `jma-vanskap` | `jma-jag-och-andra` | 2nd | 2nd (after `jma-kontakt`) | Move category to 1st + card to pos 1 |
| Jag i Varlden | `jiv-fordomar` (new) | `jiv-varlden-omkring-mig` | 3rd | 2nd (after `jiv-social-media`) | Change freeCardId + move category to 1st + card to pos 1 |
| Vardagskort | `vk-hur-var-din-dag` | `vk-min-dag` | 1st | 1st | No change needed |
| Syskonkort | `sk-syskonkunskap` | `sk-vi-blev-syskon` | 1st | 2nd (after `sk-att-fa-ett-syskon`) | Move card to pos 1 |
| Sexualitetskort | `sex-normer` | `sex-normer-och-paverkan` | 2nd | 1st in its category | Move category to 1st |
| Still Us | `su-mock-0` | `su-mock-vardagen` | 1st | 1st | No change needed |

### Changes per file

**1. `src/data/products/jag-i-mig.ts`** — Swap `jim-glad` before `jim-trygg` in the cards array (move lines 58-67 before lines 38-57).

**2. `src/data/products/jag-med-andra.ts`** — Two changes:
- Categories array: move `jma-jag-och-andra` to position 1 (before `jma-vem-ar-jag`)
- Cards array: move `jma-vanskap` block before `jma-kontakt`, and move all K2 cards before K1 cards

**3. `src/data/products/jag-i-varlden.ts`** — Three changes:
- Change `freeCardId` from `'jiv-identitet'` to `'jiv-fordomar'`
- Categories array: move `jiv-varlden-omkring-mig` to position 1
- Cards array: move `jiv-fordomar` to first position in K3 cards, and move all K3 cards before K1 cards

**4. `src/data/products/syskonkort.ts`** — Move `sk-syskonkunskap` before `sk-att-fa-ett-syskon` in the cards array.

**5. `src/data/products/sexualitetskort.ts`** — Two changes:
- Categories array: move `sex-normer-och-paverkan` to position 1
- Cards array: move all K2 cards (starting with `sex-normer`) before K1 cards

**6. No changes** to `vardagskort.ts` or `still-us-mock.ts`.

### What stays untouched
- All card content, IDs, prompts, sections
- All category IDs, titles, subtitles, descriptions
- Only `jag-i-varlden.ts` freeCardId changes; all others keep their current freeCardId
- No logic changes anywhere

