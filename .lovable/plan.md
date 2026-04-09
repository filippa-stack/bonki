

## Pill text redesign — text-only changes

### Summary
Update the pill text strings in `src/components/ProductLibrary.tsx` for both PastelTile and Vårt Vi tile. Move age labels from pills to taglines. No styling changes.

### PastelTile changes

**Tagline (line 428):** Change `{tagline}` → `{tagline}{ageLabel ? ` · ${ageLabel}` : ''}`

**Pill text (lines 461–465):** Replace the ternary with 4-state logic:
```tsx
{isPurchased
  ? (completedCount ?? 0) > 0
    ? `✦ ${completedCount} samtal`
    : '✦ Börja er resa'
  : hideFreeBadge
    ? '✦ Ert första samtal ✓'
    : `✦ ${totalCards || 0} samtal · Prova först`}
```

Note: The current pill text doesn't include the ✦ character inline — it's rendered via the Ghost Glow sparkle in the corner for purchased state. Looking at the current text on lines 461–465, the sparkle characters are NOT in the pill text. The user's spec includes ✦ in all pill states. I need to confirm whether ✦ should be added to the pill text or if it was just notational.

Given the user's explicit spec says the pill reads `✦ 20 samtal · Prova först` etc., I'll include the ✦ in the pill text for all states. The corner Ghost Glow sparkle is separate and stays untouched.

### Vårt Vi tile changes

**Tagline (line 1062):** No change — no age label for couples product.

**Pill text (lines 1096–1100):** Same 4-state logic using `purchased.has('still_us')`, `suCount`, `suFreeCompleted`, `totalCards`:
```tsx
{purchased.has('still_us')
  ? (suCount > 0)
    ? `✦ ${suCount} samtal`
    : '✦ Börja er resa'
  : suFreeCompleted
    ? '✦ Ert första samtal ✓'
    : `✦ ${totalCards} samtal · Prova först`}
```

### Files changed
- `src/components/ProductLibrary.tsx` — pill text strings (2 locations) + tagline text (1 location)

### What stays untouched
- All pill styling (colors, backgrounds, borders, blur, Lantern Glow tint, positioning)
- Ghost Glow corner sparkle
- All layout, navigation, and session logic
- All variable/prop logic (`hideFreeBadge`, `isPurchased`, etc.)

