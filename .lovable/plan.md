

## Jag med Andra — Prompt 1: Structure + Category Update

Single file: `src/data/products/jag-med-andra.ts`

### 1. Category metadata updates (lines 5-10)

| Category ID | Field | New value |
|---|---|---|
| `jma-vem-ar-jag` | description | `'Olikhet, utseende, jämlikhet, utanförskap och skam'` |
| `jma-jag-och-andra` | description | `'Kontakt, vänskap, respekt, sanning och tävling'` |
| `jma-varlden-omkring-mig` | title | `'När vi kämpar'` |
| `jma-varlden-omkring-mig` | description | `'Konflikt, kritik, gränser, skuld, misslyckande och avundsjuka'` |
| `jma-varlden-omkring-mig` | cardCount | `6` |
| `jma-vad-tror-jag-pa` | description | `'Prestation, mod, acceptans, integritet och tankeexperiment'` |
| `jma-vad-tror-jag-pa` | cardCount | `5` |

### 2. Cards array — rewrite with new categoryIds and exact physical order

Card sequence (exact array order):

```text
 1. jma-annorlunda     (jma-vem-ar-jag)
 2. jma-utseende       (jma-vem-ar-jag)
 3. jma-lika-varde     (jma-vem-ar-jag)
 4. jma-utanfor        (jma-vem-ar-jag)
 5. jma-skam           (jma-vem-ar-jag)
 6. jma-kontakt        (jma-jag-och-andra)
 7. jma-vanskap        (jma-jag-och-andra)
 8. jma-respekt        (jma-jag-och-andra)
 9. jma-sanning        (jma-jag-och-andra)
10. jma-tavla          (jma-jag-och-andra)
11. jma-konflikt       (jma-varlden-omkring-mig)
12. jma-kritik         (jma-varlden-omkring-mig)
13. jma-stopp          (jma-varlden-omkring-mig)
14. jma-skuld          (jma-varlden-omkring-mig)
15. jma-misslyckas     (jma-varlden-omkring-mig)
16. jma-avund          (jma-varlden-omkring-mig)
17. jma-duktig         (jma-vad-tror-jag-pa)
18. jma-modig          (jma-vad-tror-jag-pa)
19. jma-acceptans      (jma-vad-tror-jag-pa)
20. jma-integritet     (jma-vad-tror-jag-pa)
21. jma-kluringen      (jma-vad-tror-jag-pa)
```

6 cards change categoryId: `jma-skam` → `jma-vem-ar-jag`, `jma-tavla` → `jma-jag-och-andra`, `jma-misslyckas` → `jma-varlden-omkring-mig`, `jma-avund` → `jma-varlden-omkring-mig`, `jma-acceptans` → `jma-vad-tror-jag-pa`, `jma-integritet` → `jma-vad-tror-jag-pa`. No subtitle or prompt text changes.

### 3. Verification — output after applying

```text
ARRAY: list all 21 card IDs in order, with their categoryId
COUNTS: jma-vem-ar-jag=5, jma-jag-och-andra=5, jma-varlden-omkring-mig=6, jma-vad-tror-jag-pa=5
```

### Not touched
- No card titles, subtitles, or prompts
- No card IDs or section IDs
- Product metadata, colors, imports, exports unchanged
- No other files

