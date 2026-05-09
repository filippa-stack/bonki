## Goal

Replace the 7 screenshot replicas with the actual production components rendering at 1290×2796, so every illustration, layout, shadow, and progress marker matches what users see in the app. Add a per-graphic visual-fidelity check before delivery.

## Root cause of the current break

Each `Screen*.tsx` was hand-rebuilt instead of mounting the real component. As a result:

- Card illustrations are missing — none of the replicas call `useCardImage(cardId)` against the real `/card-images/{id}.webp` set.
- Session layouts don't match — the cream centered question card with warm-glow shadow is approximated, not rendered.
- Graphic 1 shows a library list with one Vårt Vi tile instead of the marquee at full bleed.
- Graphic 3 has the hero illustration painted on the page background because tile illustrations aren't being resolved.

## Strategy: real components inside the export canvas

For each graphic, mount the **production** component into the existing `AppStoreCanvas` device-screen zone. Components depending on auth / Supabase / couple space already have demo-mode pathways (`isDemoMode()`, `LibraryMock`, `ProductHomeMock`, `KidsProductHome` accepts manifest + progress overrides, `Journal` reads from `demoJournalSeed` when in demo). Wrap each export route in a thin "frozen demo" provider so the real components render deterministic state without network calls.

### Component map per graphic

| # | Spec intent | Production component to mount | Frozen state |
|---|---|---|---|
| 1 | Vårt Vi marquee, large | Extract `<StillUsMarquee>` from `ProductLibrary.tsx` and render alone, vertically centered, scaled to fill the device screen zone | Marquee props only (no progress dependency) |
| 2 | Era samtal | `Journal.tsx` (or a `<JournalView>` extracted from it) | `DEMO_REFLECTIONS` seeded via existing `maybeSeedDemoJournal` / `DEMO_DIARY_EVENT` path |
| 3 | Jag i Mig home | `KidsProductHome` with the `jag_i_mig` manifest | `useKidsProductProgress` overridden via demo provider so 5/6 tiles show saffron checkmarks; `ProductCardTile` + `useCardImage(cardId)` render real `/card-images/jim-*.webp` |
| 4 | Kids session (step 2 of 4) | `CardView.tsx` kids branch on `cardId="jim-glad"`, `step=1` | Demo session via `saveDemoSession` + `updateDemoSessionStep` so the cream prompt card and progress dots render |
| 5 | Vårt Vi session | `CardView.tsx` Vårt Vi branch on a chosen `expressing-needs`-style card | Same demo-session seeding |
| 6 | Kids completion | `CompletedSessionView` with `cardId="jim-glad"` and a frozen takeaway | Uses real saffron medallion, warm-glow takeaway field, glassy CTA |
| 7 | Authority | Keep current `Screen7Authority.tsx` (already approved); only confirm `bare: true` still suppresses caption + hairline | n/a |

### Frozen demo provider

Add `src/pages/export/ExportDemoShell.tsx` that:

1. Forces `isDemoMode()` to true for the subtree (set localStorage flag or expose a context).
2. Provides `AuthContext` + `CoupleSpaceContext` stubs returning a deterministic user / paired-active space (mirrors `pairedActive` devState).
3. Pre-seeds the demo session, demo diary, and demo card-completion state used by Graphics 2–6 (reuse `saveDemoSession`, `completeDemoSession`, `upsertDemoDiaryEntry`, `maybeSeedDemoJournal`).
4. Disables route transitions and any animation that would land mid-flight at capture time.

Each `Screen*.tsx` becomes a thin wrapper:

```text
<AppStoreCanvas spec={...}>
  <ExportDemoShell seed={...}>
    <KidsProductHome manifest={JAG_I_MIG_MANIFEST} />
  </ExportDemoShell>
</AppStoreCanvas>
```

### Marquee extraction (Graphic 1)

Pull the marquee block out of `ProductLibrary.tsx` into `src/components/StillUsMarquee.tsx` so both the library and `Screen1Marquee` import it. Render it standalone in Graphic 1 inside the device screen zone, scaled so the medallion + 40/60 split + hairline reach the full width with comfortable vertical padding. Library continues to use the same component so they stay in sync.

### Caption regression from previous pass

- Graphic 6 caption: revert to **120px** (keep the two-line break as-is, don't move the device frame).
- Graphic 7: keep `bare: true` (no caption, no hairline, vertical center).

## Verification protocol (the step that was missed)

For each graphic, before declaring done:

1. Render the production app's matching screen in the live preview at iPhone 6.7" viewport (use `?devState=pairedActive` and `?devState=archiveWithHistory` for Journal, `browse` for library / kids home).
2. Screenshot the live screen.
3. Run puppeteer over `/export/app-store/N` and capture the inner device screen zone (not the whole canvas) at the same dimensions.
4. Diff visually — illustrations, card layouts, shadows, checkmarks, typography hierarchy, atmospheric backgrounds must all match.
5. Only after the inner-zone diff passes, render the full 1290×2796 canvas with caption + hairline + frame for delivery.

Surface any mismatch in chat before fixing — some divergences may be intentional (e.g. progress checkmark count) and need a product call, not an auto-correction.

## Deliverable

7 PNGs in `/mnt/documents/`, each 1290×2796, each preceded by a side-by-side fidelity confirmation in chat.

## Technical notes

- `useCardImage` is synchronous and reads from `/card-images/{cardId}.webp` in the public dir — works inside puppeteer as long as the dev server is up. No additional asset wiring needed.
- Components that subscribe to Supabase realtime need either the demo-mode short-circuit or a stubbed `supabase` client; prefer demo-mode short-circuit because it's already exercised in production via `LibraryMock` and `?devState=*`.
- Disable Framer Motion entrance animations during export (already a project memory rule for transitions; reuse the same approach by setting `prefers-reduced-motion` on the export route or passing `initial={false}`).
- Keep `exportPng.ts` as-is for the in-browser "Ladda ner PNG" affordance; puppeteer remains the source of truth for shipped assets.
- No changes to `composition.tsx` other than confirming `bare`, caption-size, and hairline behaviors. No business-logic changes anywhere outside `src/pages/export/`.

## Out of scope

- Re-running content edits in `demoJournal.ts` (locked from previous pass).
- 6.5" / 5.5" device-class re-renders — handled separately once 6.7" is approved.
