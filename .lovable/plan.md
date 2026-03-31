

## Add illustration to Syskonkort "Funktionsvariation" card

### Steps

1. **Copy image**: `user-uploads://sjuk.png` → `public/card-images/sk-funktionsvariation.png`
   - This matches the existing convention where all card illustrations live as `{cardId}.png` in `/card-images/`

2. **Update allowlist** in `src/hooks/useCardImage.ts`:
   - The card ID `sk-funktionsvariation` is already listed in `CARD_IDS_WITH_IMAGES` (line ~47 in the Syskonkort section), so no change needed there — but I need to verify this.

### Technical detail
- The `useCardImage` hook returns `/card-images/${cardId}.png` if the ID is in the allowlist set
- The image file just needs to exist at that path
- No data file changes needed — card ID is unchanged

### Risk: zero
- No ID changes, no structural changes, no logic changes

