## Goal

Delete the four static JSX replicas. Replace each with a thin marketing wrapper that renders the actual production visual layer with marketing-controlled static props. Production rendering must remain byte-identical.

All marketing copy uses straight quotes and em-dash U+2014 — strings provided by the user.

## Approach: extract presentational subcomponents

Per user clarifications:
- **Step indicators** (Screens 1, 2): match production exactly — VV uses lowercase paragraph "Fråga 2 av 4"; Vardag uses kids pill "7 av 7" with leading dot. Drop the spec's "FRÅGA" prefix.
- **Completion headline** (Screen 3): match production VV (non-child) branch exactly — saffron hairline, weight-500 hsl(41 78 38) headline at clamp(26-34px), translucent dark takeaway, "Fortsätt utforska" CTA.
- **Journal card** (Screen 6): mount production `SessionGroupCard` exactly — productName + relative date + cardName + em-dash question + italic #E9C890 reflection.

### Extractions (production code)

1. **`SessionQuestionCounter`** — `src/components/session/SessionQuestionCounter.tsx`
   Extracted from `CardView.tsx` lines ~3932–4004. Two variants:
   - `variant="kids"`: pill with leading dot, `--kids-counter-*` vars, sans 11px
   - `variant="vv"`: centered paragraph "Fråga {n} av {total}", sans 11px tertiary text
   CardView replaces both inline blocks with `<SessionQuestionCounter />`. Visibility conditions stay in CardView.

2. **`KidsSessionPill`** — `src/components/session/KidsSessionPill.tsx`
   Extracted from `CardView.tsx` lines ~3708–3756. Pure presentational pill: `accentColor`, `label`, `onClick`, optional `fullWidth`. Replaces both inline kids CTA buttons in CardView. Marketing wrapper (Screen 2) mounts it with Vardag accent `productAccentColor['vardagskort']`.
   *Per user note 1: Vardag pill is NOT routed through `SessionStepReflection` (which hardcodes `hsl(41 78 48)`); it's inline in CardView using `productAccentColor`. So no `kidsAccentColor` prop on `SessionStepReflection` — extract the pill instead.*

3. **`CompletionBody`** — `src/components/session/CompletionBody.tsx`
   Extracted from `CompletedSessionView.tsx` final `return` (lines ~248–520). Pure props in: `cardTitle`, `headline`, `formattedDate`, `stepGroups`, `takeawayText`, `isChildProduct`, `product`, `categoryId`, `cardIllustration`, `myName`, `partnerName`, `nextDest`, `isFreeCard`, `productIsPurchased`, `onExploreAgain`, `onNavigate`. CompletedSessionView keeps DB fetch + loading/empty states; forwards computed values to `<CompletionBody />`.
   *Per user note 2: highest-risk extraction. After this edit, regression-check both VV completion and a kids completion path (e.g., `jim-glad`). If kids regresses, audit `isChildProduct` / `product` / `categoryId` prop forwarding first.*

4. **`SessionGroupCard`** — move from `Journal.tsx` (line 460) to `src/components/journal/SessionGroupCard.tsx`. Co-locate the helpers it depends on (`getProductAccent`, `getProductName`, `PRODUCT_ILLUSTRATION`, `formatRelativeDate`, `SessionGroup` + `Note` types) into a shared `src/components/journal/types.ts` and `helpers.ts`, or pass them in as props if simpler. Journal imports the new path. Zero data-flow changes.

5. **`SessionFocusShell`**, **`SessionStepReflection`**, **`Header`**, **`StepProgressIndicator`** — already presentational. Marketing wrappers mount them directly. `SessionFocusShell` heartbeat self-disables when `couple_id`/`card_id`/`device_id` are absent.

### Marketing wrappers (4 replacements + 1 src tweak)

**`MarketingVvQuestion.tsx`** (Screen 1)
- Card `'smallest-we'` from `src/data/content.ts`. Question: prompts[0]. Indicator shows 2/4.
- Composition: `<Header />` → `<StepProgressIndicator currentStepIndex=1 completedSteps=[0] steps=4 currentPromptIndex=1 totalPromptsInStep=1 />` → `<SessionQuestionCounter variant="vv" current={2} total={4} />` → `<SessionFocusShell productBgColor={MIDNIGHT_INK}>` containing the question text → `<SessionStepReflection sessionId={null} stillUsMode noteFieldLabel="Skriv vad ni vill minnas" ctaLabel="Nästa" onLocked={noop} />`.

**`MarketingVardagQuestion.tsx`** (Screen 2)
- Card `'vk-hur-var-din-dag'` from `src/data/products/vardagskort.ts`, prompt index 6. Indicator 7/7.
- Composition: `<Header />` → `<StepProgressIndicator />` (kids variant) → `<SessionQuestionCounter variant="kids" current={7} total={7} />` → background `#48A873`, cream card with question, `<SessionStepReflection ... noteFieldLabel="Skriv vad ni vill minnas" hideNoteField={false}>` for the trigger only, with a `KidsSessionPill accentColor={productAccentColor['vardagskort']} label="Nästa" />` rendered as the wrapper's CTA.
- Because Vardag's production layout doesn't use `SessionStepReflection`'s CTA, the marketing wrapper renders the trigger via `SessionStepReflection` (hideField=false, no CTA path used) OR directly composes the trigger block separately — implementation will pick the cleaner mount once the extracted pill is in place. No new props on `SessionStepReflection`.

**`MarketingVvCompletion.tsx`** (Screen 3)
- Mounts `<CompletionBody />` with static props for `'smallest-we'`:
  - `cardTitle="Det osynliga ansvaret"`, `headline="Ni pratade om Det osynliga ansvaret."`, `formattedDate="April 2026"`
  - `isChildProduct=false` (production VV branch), `stepGroups=[]`, `takeawayText` per spec, `nextDest=null`, `cardIllustration` via `useCardImage('smallest-we')` (or null), inert `onExploreAgain`/`onNavigate`.

**`MarketingJournalSingle.tsx`** (Screen 6)
- Page chrome (h1 "Era samtal" + italic subtitle "Vad ni burit med er" + month header "April 2026" + "1 samtal") inlined from `Journal.tsx` lines ~1010–1060 + 1547–1590 — small enough that extraction isn't warranted.
- ONE `<SessionGroupCard />` constructed with marketing group object: `productId='still_us'`, `cardId='smallest-we'`, `cardName="Det osynliga ansvaret"`, `date='2026-04-10T12:00:00.000Z'`, `notes=[{ questionText: spec, text: spec }]`, `takeaway=null`.

**`MarketingJivPortal.tsx`** — single-line src change to `/product/jag-i-varlden/portal/jiv-psykisk-ohalsa?demo=1&devState=browse&exportFonts=1`.

**`MarketingOnboarding.tsx`** — unchanged.

### Files deleted

- `src/pages/export/marketing/MarketingVvQuestion.tsx` (replaced)
- `src/pages/export/marketing/MarketingVardagQuestion.tsx` (replaced)
- `src/pages/export/marketing/MarketingVvCompletion.tsx` (replaced)
- `src/pages/export/marketing/MarketingJournalSingle.tsx` (replaced)

### Files created

- `src/components/session/SessionQuestionCounter.tsx`
- `src/components/session/KidsSessionPill.tsx`
- `src/components/session/CompletionBody.tsx`
- `src/components/journal/SessionGroupCard.tsx` (+ `types.ts` / `helpers.ts` if needed)
- 4 replacement marketing wrappers

### Files edited (production paths)

- `src/pages/CardView.tsx` — replace counter and kids-pill inline blocks with the new components. No state/ref/effect changes.
- `src/components/CompletedSessionView.tsx` — replace return JSX with `<CompletionBody {...props} />`. DB fetch and loading/empty states unchanged.
- `src/pages/Journal.tsx` — import `SessionGroupCard` from new location.

### Protections (untouched)

- All `CardView.tsx` state refs: `suppressUntilRef`, `prevServerStepRef`, `pendingSave clearTimeout`, `hasSyncedRef`, `flatPromptMap`, `localPromptIndex` advance, autosave, reflection-save, step-sync, demo seeding.
- `CompletedSessionView.tsx` `isChildProduct` branching (preserved inside `CompletionBody` props).
- All routing logic except marketing routes (already added).
- Live session DB writes, Stripe paywall logic, auth context.
- `SessionStepReflection.tsx` — no prop additions.

## Regression check (mandatory before delivery)

Open each in dev and confirm pixel-identical render vs. current production:
1. `/` library marquee
2. `/product/still-us` Vårt Vi product home
3. `/portal/still-us/{any card}`
4. Active VV session at step 2 (counter, cream card, reflection trigger, warm-gold CTA)
5. Active Vardag session at step 7/7 (kids pill counter, reflection trigger, accent CTA pill)
6. **VV completion screen** (saffron hairline + weight-500 hsl(41 78 38) headline + translucent dark takeaway + "Fortsätt utforska") — **HIGH RISK**
7. **Kids completion screen** (saffron check badge + LANTERN_GLOW headline + cream takeaway + "Nästa samtal") — **HIGH RISK**; if regresses, audit `isChildProduct` / `product` / `categoryId` forwarding first
8. `/journal` with seeded data — `SessionGroupCard` renders identically
9. Vårt Vi onboarding page 1
10. `/export/app-store/16`

If any of #4–#8 regress, stop and report before delivering marketing PNGs.

## Output

Unchanged: PNGs at 1079×1689, bezel-only, transparent outside the rounded corners, status bar 9:41. Filenames `marketing-01-vart-vi-question.png` … `marketing-06-journal-single.png`.
