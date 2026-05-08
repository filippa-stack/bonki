## 1. Vårt Vi completion — single unified message

**File:** `src/components/CompletedSessionView.tsx`

Today (line 68/74), the headline is randomly chosen from `getCompletionMessages(pronounMode, ageLabel)` — a list with several position/sequence-tied variants (e.g. "Ert första samtal är klart…"). These misfire when the user replays a card or starts mid-sequence.

Replace the randomized adult headline with a single template that mirrors the kids completion line in `CardView.tsx:1464` (`Ni pratade om ${card.title}.`).

**Change (Vårt Vi only — kids path untouched):**
- Remove the `completionMessages` / random-pick logic for the adult branch.
- Render `headline` as: `Ni pratade om ${cardTitle}.`
- Keep all surrounding styling (gold serif `hsl(41, 78%, 38%)`, sizing, layout, date subline, translucent dark takeaway block).
- For kids (`isChildProduct`) keep current behaviour byte-identical (kids already use the same template upstream and we don't want to touch their headline source).

Practically: compute `headline` as `\`Ni pratade om ${cardTitle}.\`` for both branches (kids already render this same string today, so the unified value is safe), and drop the `completionMessages` import + `useMemo` random pick. If `getCompletionMessages` is unused elsewhere it stays in `lib/pronouns.ts` untouched (no library cleanup in scope).

**Verify:** complete first card in sequence, mid-sequence card, and a replayed card on Vårt Vi — all read `Ni pratade om {title}.`. Kids completion screen unchanged. Vårt Vi takeaway block, badge/dash, date, navigation buttons unchanged.

## 2. Vårt Vi product home — medallion hairline ring

**File:** `src/components/AdultProductCardTile.tsx` (lines 100–111)

Add a single property to the medallion `<div>`:

```
border: '1px solid rgba(245, 232, 204, 0.30)',
```

That's the entire change. No layout/size/anchor-color/rotation/title-strip changes; library marquee, kids tiles, resume banner, portal — all untouched.

**Verify (390×844):** scroll all 21 Vårt Vi tiles — every medallion shows a delicate cream ring across all six anchor mats (cornflower, midnight ink, dusty rose, warm gold, storm grey, sage). Composition otherwise identical.

If a specific anchor reads off in QA, calibrate opacity (drop to 0.20 or raise to 0.40) — but ship with 0.30 first.