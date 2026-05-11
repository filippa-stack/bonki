# Marketing screens export (revised)

Six clean, marketing-ready PNGs of existing app surfaces, exported with iPhone bezel only — no surrounding 1284×2778 App Store canvas. Drop straight into email/social.

## Approach

- New route `/export/marketing/:n` (n = 1..6), registered alongside `/export/app-store/:n` in `src/App.tsx`.
- Reuse `DeviceFrame` from `composition.tsx` for the bezel + 9:41 status bar + home indicator.
- Capture node = the bezel rectangle only (`FRAME_WIDTH_PX × FRAME_HEIGHT_PX` = 1079 × 1689). The exported PNG dimensions equal the bezel's outer box — no canvas margins.
- Background outside the bezel: transparent PNG (html-to-image with `backgroundColor: undefined` already supports this; the rounded corners outside the bezel become transparent).
- Same preview chrome (download button, scaled preview) and `?raw=1` mode.

## Screen mapping

| # | Slug | Render strategy | Inner background |
|---|---|---|---|
| 1 | `vart-vi-question` | Static JSX replica: cream question card + warm glow, "FRÅGA 2 AV 4", fixed question, warm-gold "Nästa" | Midnight Ink |
| 2 | `vardag-question` | Static JSX replica: cream question card, "FRÅGA 1 AV 5", fixed question, glassy mid-green "Nästa" | #48A873 |
| 3 | `vart-vi-completion` | Static JSX replica: saffron checkmark badge, Ember Glow serif headline, cream takeaway field with exact reflection text, warm-gold "Nästa samtal" | Midnight Ink |
| 4 | `onboarding-quote` | **Static JSX replica using PreAuthIntroSlide1 styles** (no iframe — auth context + layout shift make iframe non-deterministic). Italic serif quote centered, three-dot pagination with first dot in BONKI_ORANGE. | Midnight Ink |
| 5 | `jag-i-varlden-portal` | `RealAppFrame` → `/portal/jag-i-varlden/{slug}?demo=1&devState=browse` (existing `KidsCardPortal` matches spec) | #3F4A0E |
| 6 | `journal-single` | Static JSX replica: timeline dot, "APRIL 2026", "1 samtal", single reflection card with exact label/title/date/question/reflection | Midnight Ink |

## Marketing copy (verbatim)

All text uses straight quotes (`'` U+0027, `"` U+0022) and em-dash U+2014 (`—`) — no en-dash, no hyphen-minus surrogates.

- **Screen 1 question:** `Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?`
- **Screen 3 headline:** `Ni pratade om Ert minsta 'vi'.`
- **Screen 3 reflection (also reused on Screen 6):** `Att vi skrattar åt samma saker. Att jag kan komma hem och säga något helt obegripligt och han förstår direkt vad jag menar.`
- **Screen 4 quote:** `Samtalet som dagen inte gav plats för`
- **Screen 6 question line:** `— Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?`

A unit-test–level sanity check during implementation: `expect(text.includes('\u2014')).toBe(true)` and no `\u2013` / `--` anywhere in marketing strings.

## Files

New:
- `src/pages/export/MarketingScreenshot.tsx` — route component (mirrors `AppStoreScreenshot.tsx`, but capture node = bezel only)
- `src/pages/export/marketing/MarketingVvQuestion.tsx`
- `src/pages/export/marketing/MarketingVardagQuestion.tsx`
- `src/pages/export/marketing/MarketingVvCompletion.tsx`
- `src/pages/export/marketing/MarketingOnboarding.tsx` (static replica)
- `src/pages/export/marketing/MarketingJivPortal.tsx` (iframe wrapper)
- `src/pages/export/marketing/MarketingJournalSingle.tsx`

Edited:
- `src/App.tsx` — add `<Route path="/export/marketing/:n" element={<MarketingScreenshot />} />`

Untouched (explicit):
- `src/pages/CardView.tsx` and all session protection refs (`suppressUntilRef`, `prevServerStepRef`, etc.)
- `src/pages/Journal.tsx`, `KidsCardPortal.tsx`, onboarding components
- `composition.tsx`, `RealAppFrame.tsx`, `exportPng.ts`, App Store graphics 1–16
- All routing logic outside the single new route line

## Output

- Filename: `marketing-01-vart-vi-question.png` … `marketing-06-journal-single.png`
- Dimensions: 1079 × 1689 (bezel only, transparent background outside bezel rounded corners)
- 9:41 status bar with full signal/wifi/battery, painted by `DeviceFrame`

## Vårt Vi regression check

Before delivery, manually verify these still render identically:
- `/` (library marquee), `/product/still-us`, `/portal/still-us/{card}`, an active Vårt Vi session, completion, Vårt Vi onboarding, `/export/app-store/16`. If anything regresses, stop and report.
