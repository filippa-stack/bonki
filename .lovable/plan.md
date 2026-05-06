
# Vårt Vi v3.1 — Final Apply Plan (with 5 pronoun corrections)

## Corrections noted (Prompt 4 only, ni/er-form)

| Card | New Prompt 4 |
|---|---|
| `listening-presence` | "Föreställ er: Om en del av dig förblir osedd hos mig — hur tror du att det kommer att påverka **er** om fem år?" |
| `expressing-needs` | "Tänk om en av **er** bär på en tystnad under de kommande tio åren — hur skulle det påverka **er** relation?" |
| `smallest-we` | "Föreställ er: Om den som planerar slutade planera under en månad — vad skulle hända med **er** då?" |
| `love-languages` | "Föreställ er: Om **ni** fortsatte att undvika vissa behov i tio år till — hur skulle de outtalade önskningarna forma **er** närhet då?" |
| `family-ab` | "Föreställ er: Om någon av **er** kände en dragning till en annan person — skulle det att prata öppet om det föra **er** närmare, eller skulle det kännas som ett hot?" |

All other 121 content fields unchanged from your previous message.

## Read-back confirmation

**Layer grouping (4/5/5/4 by id):**
- Vardagen: smallest-we, worth-spending-on, adrift, love-languages
- Tillsammans: listening-presence, expressing-needs, facing-adversity, conflict-repair, when-life-tilts
- Grunden: our-traditions, identity-shift, behind-the-scenes, thoughtful-space, self-esteem-wavering
- Riktningen: family-ab, parenting-boundaries, different-parenting-styles, parenting-exhaustion

**CARD_SEQUENCE order (1–18):** our-traditions → identity-shift → listening-presence → expressing-needs → behind-the-scenes → thoughtful-space → self-esteem-wavering → smallest-we → worth-spending-on → facing-adversity → conflict-repair → adrift → love-languages → when-life-tilts → family-ab → parenting-boundaries → different-parenting-styles → parenting-exhaustion

**Content fields confirmed:** 18 cards × 7 categories (title, subtitle, 4 prompts, portal subtitle, portal preparation, gör title, gör instruction) = 126 fields, all present, with the 5 prompt-4 corrections above applied.

## Apply order (atomic, one batch)

### Step A — `src/data/stillUsSequence.ts`
- Refactor `LAYERS` from positional `cards: number[]` to id-based `cardIds: string[]` so layer chips stay correct independent of sequence.
- Rewrite `CARD_SEQUENCE` with the 18 ordered entries. Re-prefix slugs `su-00-our-traditions` … `su-17-parenting-exhaustion` to match new positions. Set `layerIndex` per card-id (not per sequence position).

### Step B — `src/hooks/useStillUsHome.ts`
- `EMPTY_STATE` → `su-00-our-traditions`.

### Step C — `src/data/sliderPrompts.ts`
- Reorder array entries so `cardIndex` 0–17 align with the new sequence; keep slider questions tied to each card-topic (carry the existing slider sets along with their card id, do not regenerate). `slugFor` will auto-derive the new prefixed slugs from `CARD_SEQUENCE`.

### Step D — `src/data/content.ts`
- For all 18 card ids: replace `title`, `subtitle`, and `prompts[0..3]` with the new copy (Prompt 4 uses the corrected ni/er-form for the 5 cards above).
- Bump `CONTENT_VERSION` to `14`.

### Step E — `src/data/gorExercises.ts`
- For all 18 card ids: replace `title` and `instructionText` with the new GÖR copy.

### Step F — `src/data/stillUsPortalCopy.ts` (new file)
- Export `Record<cardId, { subtitle: string; preparation: string }>` for all 18 cards.
- Wire `src/pages/AdultCardPortal.tsx` to read `subtitle` and `preparation` from this map (overriding the content.ts subtitle and rendering the prep paragraph).

### Step G — Verification
- `rg "LAYERS\[.*\]\.cards"` → 0 hits (positional layer access removed).
- Spot-check that "Nästa" walks the new order from card 0.
- Spot-check that the 5 corrected Prompt 4 strings appear verbatim in `content.ts`.

Awaiting your "go" to switch to default mode and apply Steps A–G in one batch.
