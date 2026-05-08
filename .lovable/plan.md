## Why the message still shows

The previous edit only touched `CompletedSessionView.tsx`. But the route `/card/su-mock-0?view=completed` renders **Still Us / Vårt Vi completion inline inside `CardView.tsx`** — a separate code path with its own hardcoded headline.

Found at `src/pages/CardView.tsx` lines **1841–1871**:

```tsx
<h2 ...>
  {cardId === 'su-mock-0'
    ? 'Ert första samtal är klart. Nu börjar resan.'
    : 'Varje samtal är ett val. Ni valde rätt.'}
</h2>
{cardId === 'su-mock-0' && (
  <p ...>Det här var ert första steg. Nästa samtal väntar.</p>
)}
```

This is the position-tied copy the user is seeing in the screenshot. It also has a second position-tied variant (`'Varje samtal är ett val. Ni valde rätt.'`) for all other Vårt Vi cards.

## Change

Replace lines 1841–1871 with a single unified headline (matching the spec from the previous turn) and drop the subline entirely:

```tsx
<h2 className="font-serif" style={{
  fontSize: '26px', fontWeight: 600, color: EMBER_GLOW,
  textAlign: 'center', lineHeight: 1.2, textWrap: 'balance',
}}>
  Ni pratade om {card.title}.
</h2>
```

- No more `cardId === 'su-mock-0'` branching.
- No more "Nu börjar resan" / "Varje samtal är ett val" / "Det här var ert första steg…" sublines.
- All other layout/spacing/checkmark/note nudge/CTA rows stay byte-identical.

## Out of scope (intentionally untouched)

- Line 1463 (`'Ert första samtal är klart.'`) — this is the **free-card kids paywall path** (`product?.id !== 'still_us'`), not Vårt Vi. Keep as-is.
- Kids completion rendering elsewhere — already aligned in the previous pass.
- `CompletedSessionView.tsx` — already updated.

## Verify

Reload `/card/su-mock-0?view=completed` → headline reads `Ni pratade om {card.title}.`, no subline. Spot-check a mid-sequence Still Us card → same single line, no "Varje samtal är ett val…" copy.
