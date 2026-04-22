

## v4 — Final captions, reorder, and refined typography (revised)

Two corrections incorporated from your review. Plan otherwise unchanged.

### Correction 1 — Remove the `\n` on screen 10's headline

You're right. *"Köp en gång. Behåll för alltid."* is a call-and-response couplet, not a setup-and-payoff line. Breaking it dilutes the rhythm and leaves the closer feeling unresolved. It renders as **one line, no manual break**.

If the binary-search size doesn't fit it on one line at 1098px column width, the answer is to lower the locked size until it does — not to force a break. At 31 characters in Noto Serif Display, this will fit comfortably anywhere in the 60–72pt range we're targeting; in practice it won't be the binding constraint.

### Correction 2 — Scope the em-dash spacing assertion conditionally

The em-dash guard becomes:

```python
for s in all_caption_strings:
    if "\u2014" in s:
        assert " \u2014 " in s, f"em-dash without surrounding spaces: {s!r}"
```

So it only fires on strings that actually contain `—`. Strings without em-dashes pass through silently. The earlier global assertion was wrong and would have aborted the build on false positives.

The byte-diff against `EXPECTED` remains the primary correctness gate — it catches any drift in any character, em-dashes or otherwise. The conditional check is a secondary guard specifically for the Swedish typographic convention.

### Updated headline manual-break map (locked, editorial)

| Pos | Headline | Break |
|---|---|---|
| 1 | Guidade samtal som för er närmare. | none |
| 2 | För relationerna som betyder mest. | none |
| 3 | För det som är svårt att säga högt. | none |
| 4 | Hjälper barn sätta ord på det de känner. | none (fits at locked size) |
| 5 | Ett eget språk för syskonen. | none |
| 6 | Små samtal mitt i vardagen. | none |
| 7 | När världen blir större — ord för att förstå den. | `\n` after `större —` |
| 8 | Barnen får sin egen röst. | none |
| 9 | Vem ditt barn var — inte bara bilderna av dem. | `\n` after `var —` |
| 10 | **Köp en gång. Behåll för alltid.** | **none — single-line couplet** |

### Updated subline manual-break map (unchanged from prior pass)

| Pos | Subline | Break |
|---|---|---|
| 9 | Era samtal sparas. Det de sa, det ni delade, det ni annars hade glömt. | `\n` after `sparas.` |
| all others | — | none |

### Everything else — locked from prior plan

- One global headline pt size, binary-searched against the longest post-wrap line. Expected landing 64–72pt. No per-frame auto-fit.
- Subline at 34pt Inter, Lantern Glow at 78% opacity, 2-line max.
- Byte-diff against `EXPECTED` constant aborts the build on any character drift.
- Em-dash conditional guard (corrected per above).
- Reorder map old→new exactly as previously approved (positions 1–10 mapped to source captures).
- Same v3 captures reused — no recapture, no relayout, no app-code changes.
- Composite for all 3 device sizes (1290×2796 ×2, 1242×2688).
- `_contact-sheet.png` regenerated in 1→10 order.
- `_capture-log.md` documents reorder map, locked headline pt size, manual-break decisions, byte-diff confirmation.

### Deliverable

`/mnt/documents/app-store-gallery-v4.zip`:
- `6.9-inch/01-vart-vi-opening.png … 10-journal.png` (1290×2796)
- `6.7-inch/01…10.png` (1290×2796)
- `6.5-inch/01…10.png` (1242×2688)
- `_contact-sheet.png`
- `_capture-log.md`

### QA gate

1. Order matches positions 1–10 (filename + visual)
2. All 10 headlines byte-exact (diff vs `EXPECTED`)
3. All 10 sublines byte-exact (same diff)
4. No "Bonki" in caption layer
5. No emoji, !, #
6. Headline + subline render as two distinct visual elements
7. All Swedish
8. All ten headlines render at one locked pt size (logged)
9. Em-dashes are U+2014 with surrounding spaces preserved (conditional check + byte diff)
10. Manual breaks present only on screens 7, 9 headlines and screen 9 subline. Screen 10 headline renders as a single line.

### Out-of-scope confirmation

No app code, no in-app strings, no recapture, no relayout. Composite script and ZIP only.

