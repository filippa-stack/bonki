

## Apply Jag med Andra Category Restructure

Single file change: `src/data/products/jag-med-andra.ts`

### Categories update (lines 5-10)

New titles, subtitles, descriptions, and cardCounts:

| # | ID | title | subtitle | cardCount |
|---|---|---|---|---|
| 1 | jma-vem-ar-jag | Att höra till | Att hitta sin plats — bland andra och i sig själv. | 5 |
| 2 | jma-jag-och-andra | Att vara nära | Det som händer mellan människor — i det nära och det ärliga. | 5 |
| 3 | jma-varlden-omkring-mig | När det blir svårt | Konflikter, gränser och känslan av att ha gjort fel. | 5 |
| 4 | jma-vad-tror-jag-pa | Att vara sig själv | Press, mod och de stora frågorna om vem en är. | 6 |

### Cards array reorder + categoryId updates (lines 12-233)

Reorder the 21 card objects into new sequence and update `categoryId` on 10 moved cards. No title/subtitle/prompt changes.

**K1 — jma-vem-ar-jag:** jma-annorlunda, jma-utseende, jma-lika-varde (was K3), jma-utanfor, jma-acceptans (was K4)
**K2 — jma-jag-och-andra:** jma-kontakt, jma-vanskap, jma-respekt, jma-sanning (was K4), jma-integritet (was K4)
**K3 — jma-varlden-omkring-mig:** jma-tavla, jma-konflikt (was K2), jma-kritik (was K2), jma-stopp (was K2), jma-skuld (was K1)
**K4 — jma-vad-tror-jag-pa:** jma-duktig (was K3), jma-avund (was K2), jma-skam (was K1), jma-misslyckas (was K3), jma-modig, jma-kluringen

### Verification
- 5+5+5+6 = 21 cards total
- All 21 card IDs preserved, no content changes
- freeCardId `jma-vanskap` remains in K2
- No other files modified

