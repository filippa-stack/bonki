

## Content Update Template for Jag i Mig

I'll create a single reference file at `.lovable/jag-i-mig-update-template.md` that contains:

1. **Every locked ID** that must never change (card IDs, category IDs, product ID, slug, freeCardId)
2. **Every safe-to-edit field** with inline markers
3. **The exact data shape** so you can paste updated content directly
4. **Validation rules** (cardCount must match actual cards, new card IDs must start with `jim-`)

### File: `.lovable/jag-i-mig-update-template.md`

Contents will include:

**Locked identifiers** — these exist in the database and recommendation engine:
- Product: `id: 'jag_i_mig'`, `slug: 'jag-i-mig'`
- `freeCardId: 'jim-glad'`
- Category IDs: `jim-mina-kanslor`, `jim-starka-kanslor`, `jim-stora-kanslor`
- All 21 card IDs: `jim-trygg`, `jim-glad`, `jim-ledsen`, `jim-arg`, `jim-radd`, `jim-nyfiken`, `jim-forvanad`, `jim-acklad`, `jim-skam`, `jim-avsky`, `jim-avundsjuk`, `jim-svartsjuk`, `jim-besviken`, `jim-utanfor`, `jim-karlek`, `jim-stolt`, `jim-vild`, `jim-jag`, `jim-bestamd`, `jim-stress`, `jim-ensam`

**Safe to edit** (marked with ✏️):
- Card `title`, `subtitle`, `questionHook`
- All prompt strings inside `prompts: [...]`
- Category `title`, `subtitle`, `description`
- Product `tagline`, `description`, `headerTitle`, `paywallDescription`
- Color values (`accentColor`, `backgroundColor`, etc.)

**Safe to add:**
- New cards — use `jim-` prefix, assign to existing category, update that category's `cardCount`
- New categories — use `jim-` prefix, add cards that reference it
- New prompts to existing cards

**Template block per card** (fill in and hand back):
```
CARD: jim-trygg          ← LOCKED, do not change
  title: ✏️ 'Trygg'
  subtitle: ✏️ 'Vad som gör att en känner sig säker och omhändertagen'
  questionHook: ✏️ (optional, currently undefined)
  categoryId: jim-mina-kanslor  ← must match a category ID
  prompts:
    1. ✏️ 'Hur känns det att vara trygg?'
    2. ✏️ 'Varför är det viktigt att känna sig trygg?'
    3. ✏️ 'Hur får du någon annan att känna sig trygg?'
    4. ✏️ 'Berätta om när du känner dig trygg...'
    + (add more lines to add prompts)
```

This pattern repeats for all 21 cards plus a blank template for new cards.

**Category block:**
```
CATEGORY: jim-mina-kanslor   ← LOCKED
  title: ✏️ 'Mina känslor'
  subtitle: ✏️ 'De känslor som finns i dig – och hur de känns.'
  description: ✏️ 'Grundläggande känslor och hur de känns'
  cardCount: 7               ← MUST equal actual card count
```

**Validation checklist** (at bottom of file):
- [ ] Every card's `categoryId` matches an existing category `id`
- [ ] Every category's `cardCount` equals the number of cards assigned to it
- [ ] No existing card ID was renamed or removed
- [ ] No existing category ID was renamed or removed
- [ ] New card IDs use `jim-` prefix and are unique across all products
- [ ] `freeCardId` still points to a valid card ID

This is a single new file — no code changes. You fill it in, hand it back, and I apply it to `src/data/products/jag-i-mig.ts` mechanically.

