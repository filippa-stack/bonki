# Readability pass: subtitle/body color, italic, size

Three coordinated passes targeting low-contrast subtitle text on dark backgrounds. Strict scope: text color, font-style, font-size only. No layout, no copy, no logic.

## Approach

Add two semantic tokens and use them everywhere body/subtitle copy currently renders as `LANTERN_GLOW` (`#FDF6E3`) on dark surfaces. Keep `LANTERN_GLOW` for eyebrow labels, decorative/accent uses, nav/tab indicators, and any usage on light backgrounds.

### Tokens (new, in `src/index.css`)

```
--text-on-dark: 255 255 255;       /* used as rgba(255,255,255,0.85) for body/subtitle */
--text-on-dark-meta: 255 255 255;  /* used as rgba(255,255,255,0.70) for meta */
```

Plus two convenience exports in `src/lib/palette.ts`:

```
export const TEXT_ON_DARK = 'rgba(255,255,255,0.85)';
export const TEXT_ON_DARK_META = 'rgba(255,255,255,0.70)';
```

Components import these instead of touching the variables directly (matches the existing palette-import pattern).

## Task 1 — Color conversion (LANTERN_GLOW → white@85% / white@70%)

Convert `LANTERN_GLOW`/`#FDF6E3` to `TEXT_ON_DARK` (subtitle/body) or `TEXT_ON_DARK_META` (meta) in:

- `src/components/AdultProductHome.tsx` — Vårt Vi subtitle line under title (line ~317 region) and any descriptive copy.
- `src/components/KidsProductHome.tsx` — kids product subtitle (~line 619), descriptive lines (~line 720 = meta → 70%).
- `src/components/SyskonProductHome.tsx`, `src/components/SexualitetProductHome.tsx` — subtitle `<p>` under title (currently uses `ACCENT_COLOR`, NOT lantern-glow → leave alone unless they use lantern; verify and skip if accent).
- `src/components/ResumeBanner.tsx` — "Pausad vid…" status line (line ~65) → 85%.
- `src/components/LibraryResumeCard.tsx` — subtitle (~392) → 85%; "Pausad vid…" stepLabel (~408) → 85%; italic line at 405 (covered by Task 2).
- `src/components/NextConversationCard.tsx` — subtitle line at 125 (`${LANTERN_GLOW}B3`) → `TEXT_ON_DARK`; main label 140 stays as-is (it is a CTA label, not body — verify and leave).
- `src/components/NextActionBanner.tsx` — body line ~131 → 85%; labelColor (eyebrow) at 56/78 stays.
- `src/components/PaywallBottomSheet.tsx` — body lines 240/255/333 → 85%; eyebrow at 270 stays.
- `src/components/ProductPaywall.tsx` — descriptive body line 277 → 85%.
- `src/components/ProductIntro.tsx` — descriptive lines used as body (320, 412, 427, 511, 546, 564, 600 — audit each: keep eyebrow/CTA labels as lantern-glow, switch reading paragraphs to 85%).
- `src/components/CompletedSessionView.tsx` — quote/body (320, 405, 450, 465) — these are reflection body text; switch to 85%. Existing `'#FDF6E3'` opacity 0.55 paragraphs (325, 426) → use 85% with no extra opacity (matches floor); paragraphs at 359/377 already at 100% → switch to 85%.
- `src/components/Onboarding.tsx` line 298 — already opacity 0.5 — switch to 85% (drop the extra opacity).
- `src/components/CategoryFilterChips.tsx` — chip label (186) is a label/eyebrow → leave.
- `src/components/StepProgressIndicator.tsx` — active dot color → leave (indicator).
- `src/components/CircadianMenu.tsx` — tile text colors → leave (tile content on colored tiles, not dark bg).
- `src/components/PortalBrowseSheet.tsx` — eyebrow/check icon → leave.
- `src/components/KidsTileFrame.tsx` — currently uses `darkText` (per-product), not lantern-glow. Subtitle (~213) and meta (~232) live here; covered by Task 2 (italic) and Task 3 (size). Color stays per-product because tile strip background is the product anchor color, not dark.

Mock files (`*Mock.tsx`, `OnboardingMock.tsx`, `PaywallMock.tsx`, `ProductIntroMock.tsx`, `ProductLibraryMock.tsx`, `ProductHomeMock.tsx`) and export/screenshot pages: skip — these are static marketing/screenshot replicas, not user-facing surfaces.

## Task 2 — Remove italic from subtitle/body

Remove `fontStyle: 'italic'` (or `font-serif italic` class fragments) from:

- `src/components/KidsTileFrame.tsx` line 213 — tile subtitle.
- `src/components/ProductLibrary.tsx` lines 210, 374, 607 — library card/tile subtitles (incl. Vårt Vi card subtitle "Samtalen som dagen inte gav plats för" used as descriptor).
- `src/components/AdultProductHome.tsx` lines 222, 317 — Vårt Vi subtitle.
- `src/components/KidsProductHome.tsx` lines 618, 719 — kids product subtitle and "Föräldrarna är en vägledning…" line.
- `src/components/LibraryResumeCard.tsx` line 405 — "Pausad vid…" line.
- `src/components/ProductIntro.tsx` lines 371, 410, 490, 509 — audit; remove on subtitle/body, keep on hero manifesto line if present.
- `src/pages/KidsCardPortal.tsx` lines 480, 608 — descriptive lines (verify not hero quote).
- `src/components/PaywallBottomSheet.tsx` lines 289, 301, 317 — body copy.
- `src/components/ProductPaywall.tsx` lines 328, 367, 447, 466 — body copy (keep hero manifesto if one exists).
- `src/components/ArchiveTakeaway.tsx` line 70 — verify: this is a takeaway quote (poetic content), KEEP italic.
- `src/components/LockedReflectionDisplay.tsx` line 119 — reflection quote, KEEP italic.
- `src/components/CompletedSessionView.tsx` lines 325/359/377/426 — reflection body in quote treatment, KEEP italic.

KEEP italic (manifesto/hero/quote moments):
- `src/components/PreAuthIntroSlide1.tsx` line 70 — onboarding hero "Samtalet som dagen inte gav plats för".
- `src/pages/Login.tsx` lines 314, 350 — login manifesto + pacing line.
- `src/components/OnboardingMock.tsx`, `PaywallMock.tsx`, mock/export files — out of scope.
- `src/components/KontoSheet.tsx` — review: account screen italics, leave (not subtitle/tile).
- Still Us session screens (`SessionOneLive`, `SessionTwoLive`, `Share`, `SliderCheckIn`, `SliderReveal`, `StillUsExplore`, `TillbakaComplete`, `SoloReflect`, `Journey*`, `Journal`, `SessionStepReflection`) — these are session/poetic body; leave italic (existing Still Us editorial standard).
- `src/components/AdultProductHome.tsx` if there is a hero quote separate from the subtitle — verify and keep.
- `src/components/PromptItem.tsx` line 394 — prompt body styling, leave.
- `TermsConsent.tsx`, `SyncPrompt.tsx`, `SharedPaceState.tsx`, `WaitingStepNote.tsx` — utility/legal disclaimers, leave.

## Task 3 — Size bumps

- Subtitle text +2px on:
  - `KidsTileFrame.tsx` — subtitle currently 11px (floor) → leave at 11px (floor rule).
  - `ProductLibrary.tsx` library tile subtitle (line ~210 area) → +2px.
  - `AdultProductHome.tsx` Vårt Vi subtitle → +2px.
  - `KidsProductHome.tsx` subtitle → +2px.
  - `LibraryResumeCard.tsx` subtitle (392) and stepLabel (408) → +2px.
  - `ResumeBanner.tsx` "Pausad vid…" line → +2px.
- Meta text +1px on:
  - `KidsTileFrame.tsx` meta row currently 9px → bump to 10px (still under floor logic but floor is for body, not micro-meta — bump but verify visually; if it overflows the strip, keep at 9px and report).
  - Any "X SAMTAL" counter rows in `ProductLibrary.tsx` / `LibraryResumeCard.tsx` → +1px.
- 11px floor: never go below 11px on body/subtitle. Micro-meta (9–10px small-caps) bumps by +1px and is reported if it overflows.

After bumps, visually inspect KidsTileFrame strip (24% of card height, 16px horizontal padding) for line-wrap into separator or meta overflow. If a tile overflows, reduce that component's bump by 1px and call it out.

## Out of scope

Auth, routing, Supabase, Stripe, Meta Pixel, paywall logic, copy strings, tile dimensions, padding, medallion sizing, borders, shadows, hover states, section headers ("Biblioteket"), product titles, bottom tab bar, mock/export/screenshot pages.

## Deliverable

- `tsc` clean.
- Modified file list.
- Visual QA notes for: Home, Library (Biblioteket), ProductHome (Vårt Vi + one kids product e.g. Syskon), Categories, Paywall preview.
- Any +2px overflow rollback called out per component.
