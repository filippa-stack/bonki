# Jag i Världen — Content Update

## Scope
Single file: `src/data/products/jag-i-varlden.ts`. Content-only edits to 18 of 20 cards (subtitles, questions, scenarios). No structural changes.

## Untouched
- `jiv-social-media`, `jiv-identitet` (skipped)
- All card `id`s and `categoryId`s
- Card order within categories (free-card position preserved)
- `categories` array, `cardCount` values
- `qsCard` helper, product metadata, imports/exports
- Protected runtime patterns (not in this file anyway): `suppressUntilRef.current`, `prevServerStepRef.current`, `clearTimeout(pendingSave.current)`, `hasSyncedRef.current`

## Approach
Replace each affected `qsCard(...)` call as a single targeted edit, anchored on the unique `id` literal (1st arg) so line drift is irrelevant. For each card, only the 3rd arg (subtitle), 5th arg (questions array), and/or 6th arg (scenario) change, exactly matching the spec in the message.

Cards to edit (18): `jiv-fordomar`, `jiv-prestation`, `jiv-halsa`, `jiv-psykisk-ohalsa`, `jiv-sjalvkansla`, `jiv-roller`, `jiv-bekraftelse`, `jiv-vanskap`, `jiv-kommunikation`, `jiv-medkansla`, `jiv-konflikt`, `jiv-mobbning`, `jiv-karlek`, `jiv-sexualitet`, `jiv-moral-etik`, `jiv-frihet`, `jiv-existens`, `jiv-aktivism`.

Where the spec says "unchanged" for subtitle/questions/scenario, the existing value is preserved verbatim.

## Verification (post-edit)
1. Print a 20-row table: `# | Card ID | Subtitle (first 50 chars) | Prompt count | First question (first 40 chars)`.
2. Assert total prompt count = 116.
3. Confirm card count per category unchanged (5/4/5/6) and `freeCardId: 'jiv-fordomar'` still matches first card of K1.
4. Grep canary: ensure `jiv-social-media` and `jiv-identitet` blocks are byte-identical to before.
5. Manual check at `/?devState=browse` → Jag i Världen → open one edited card per category and confirm new prompts render.
