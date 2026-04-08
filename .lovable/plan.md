

## Free card portal cleanup + completion copy + locked CTA (with purchase guard)

Three changes across two files. The double-slide fix is already live.

---

### Change 1: Free card portal — clean layout ONLY pre-purchase (KidsCardPortal.tsx)

`productIsPurchased` is already available (line 148). The guard is `isFreeCard && !productIsPurchased`.

1. **Hide time estimate pre-purchase** — wrap the `estimateMinutes` paragraph (lines 580–591) in `{!(isFreeCard && !productIsPurchased) && (...)}`.

2. **Hide counter pre-purchase** — change the guard on lines 696–708 from `{isFreeCard && (...)}` to `{isFreeCard && !productIsPurchased && (...)}`. (This block shows "1 av N samtal" — hidden after purchase so the free card looks like any other card.)

3. **"Utforska" link pre-purchase only** — the browse button (lines 711–734) currently checks `isFreeCard` to decide text/behavior. Update the `isFreeCard` checks inside to `isFreeCard && !productIsPurchased`. After purchase, the free card shows "Fler i {category.title}" and opens the browse sheet like all other cards.

4. **Dynamic locked CTA** — line 614: replace `'Lås upp alla samtal'` with `` `Lås upp alla ${product.cards.length} samtal` ``.

After purchase, the free card portal is identical to every other card — time estimate, counter, arrows, browse sheet all present.

---

### Change 2: Completion copy — free card pre-purchase only (CardView.tsx)

`hasProductAccess` is already available (line 201). Guard: `isFreeCard && !hasProductAccess && product?.id !== 'still_us'`.

1. **Affirmation** (line 1371) — conditionally render:
   ```tsx
   {isFreeCard && !hasProductAccess && product?.id !== 'still_us'
     ? 'Ert första samtal är klart.'
     : `Ni pratade om ${card.title}.`}
   ```

2. **Subtitle** — add after line 1372, inside the same guard:
   ```tsx
   {isFreeCard && !hasProductAccess && product?.id !== 'still_us' && (
     <p style={{ fontSize: '16px', color: 'rgba(253,246,227,0.7)', textAlign: 'center', marginTop: '-16px', marginBottom: '32px' }}>
       Det här var ert första steg. Nästa samtal väntar.
     </p>
   )}
   ```

After purchase, even the free card completion says "Ni pratade om {title}." like all other cards.

---

### Change 3: Dynamic locked CTA count

Already covered in Change 1 item 4. Applies to all products.

---

### Files changed
- `src/pages/KidsCardPortal.tsx` — purchase guard on free card layout + dynamic locked CTA
- `src/pages/CardView.tsx` — purchase guard on free card completion copy

