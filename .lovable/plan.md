

## Apply Jag i Mig Content Update

Single file change: `src/data/products/jag-i-mig.ts`

### What changes

**Categories (3 existing + 1 new):**
- `jim-mina-kanslor`: cardCount 7→5 (Trygg, Glad, Ledsen, Arg, Rädd)
- `jim-starka-kanslor`: cardCount 7→5 (Äcklad, Skam, Förvånad, Avsky, Nyfiken)
- `jim-stora-kanslor`: cardCount 7→5 (Kärlek, Fri, Stress, Avundsjuk, Svartsjuk)
- **NEW** `jim-att-vara-jag`: cardCount 6 (Jag, Bestämd, Stolt, Ensam, Utanför, Besviken)

**Cards — structural moves (10 cards change category):**
- `jim-nyfiken`, `jim-forvanad` → moved to `jim-starka-kanslor`
- `jim-avundsjuk`, `jim-svartsjuk` → moved to `jim-stora-kanslor`
- `jim-jag`, `jim-bestamd`, `jim-stolt`, `jim-ensam`, `jim-utanfor`, `jim-besviken` → moved to new `jim-att-vara-jag`

**Cards — content edits:**
- `jim-vild` title: "Vild" → "Fri", prompts rewritten (7→6)
- `jim-arg`: new prompt 8 added (7→8)
- Multiple subtitle rewrites, prompt rewords, and reorderings across ~18 cards
- Pronoun cleanup: "man" → "vi"/"jag"/"en" throughout

**No locked IDs changed. No cards removed. `freeCardId` unchanged (`jim-glad`).**

### Validation
- 21 cards total (same count, no removals)
- 4 categories, cardCounts match: 5+5+5+6 = 21
- All card IDs retain `jim-` prefix
- All `categoryId` references point to valid categories

### Risk assessment
- Zero risk to navigation, resume, or recommendation logic (no ID changes)
- Zero risk to flicker fixes (different file entirely)
- Zero risk to database integrity (card IDs unchanged, sessions remain valid)
- Category moves only affect UI grouping on the product home screen

