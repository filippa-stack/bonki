

# Still Us v2.5/v2.7 — Implementation Plan

## What Changed from the Previous Spec

The v2.5 spec is a significant evolution from the earlier chat-based spec. Key differences:

1. **3-touch rhythm replaces 4-beat**: Slider check-in → Session 1 → Session 2 (no Beat 4 "bridge thought")
2. **Slider check-ins replace solo reflections**: The async step is now 2-3 visual sliders (not a text reflection), with evolving depth across 3 phases (A/B/C)
3. **3 engagement tiers**: Tier 1 (partner uses web link), Tier 2 (same device), Tier 3 (both have accounts)
4. **Completion Ceremony**: A 5-screen post-card-22 experience with data insights
5. **Phase 3 Maintenance**: 12 monthly "Tillbaka" cards after the 22-week program
6. **Restart cycle**: "Börja om på djupet" after 4+ Tillbaka cards
7. **Polling-based sync**: No Supabase Realtime — all coordination via polling + atomic RPCs + push notifications
8. **Session locking with heartbeat**: Single-device enforcement via session_lock + 60s heartbeat
9. **Stale card handling**: Day 14 skip option, Day 21 auto-advance
10. **Return-after-inactivity ritual**: Overlay after 7+ days dormancy

## Scope Summary

~25 new files, ~10 modified files, ~10 removed files. New database tables and RPCs. A standalone Tier 1 partner web page. A daily cron job for Tillbaka card delivery.

---

## Implementation Phases

### Phase 1: Database Schema & RPCs
Create the new data model:

**New tables:**
- `couple_state` — extends existing couple_spaces with: `current_card_index`, `current_touch`, `partner_link_token`, `partner_tier`, `purchase_status`, `purchased_by`, `partner_nudge_sent_at`, `tier_2_partner_name`, `tier_2_pseudo_id`, `phase`, `cycle_id`, `ceremony_reflection`, `maintenance_card_index`, `maintenance_last_delivered`, `migration_pending`, `return_ritual_shown_for_card`
- `user_card_state` — per-user per-card: `slider_responses`, `slider_completed_at`, `checkin_reflection`, `reflection_skipped`, `notes`, `takeaway`, `session_1_takeaway`, `cycle_id`, `session_type`
- `session_state` — per-card session tracking: `current_session`, `current_step`, `current_prompt_index`, `session_1_completed`, `session_2_completed`, `paused_at`, `paused_reason`, `session_lock`, `skip_status`, `session_type`, `cycle_id`
- `threshold_mood` — per-user per-card mood selection
- `anonymous_slider_submission` — Tier 1 partner web submissions (includes `checkin_reflection`)
- `journey_insights_cache` — computed analytics for ceremony

**RPCs:**
- `complete_slider_checkin` — atomic slider submission + partner-ready check
- `complete_session` — session end with takeaway params
- `advance_card` — card progression with takeaway writes
- `skip_card` — stale card skip with full state transitions
- `acquire_session_lock` / `session_heartbeat` — device locking
- `reset_slider_checkin` — return-after-inactivity reset
- `migrate_anonymous_submissions` / `migrate_tier2_to_tier3` — tier upgrades
- `compute_journey_insights` — cached analytics

**RLS policies** for all new tables (couple-scoped via `is_couple_member`).

### Phase 2: Content Data Files
Create static content files (with placeholders where clinical content is pending):

- `src/data/sliderPrompts.ts` — 22 slider sets (5 authored, 17 placeholder)
- `src/data/reorientationSummaries.ts` — 22 Session 2 recap sentences
- `src/data/soloReflectionPrompts.ts` — 22 solo-mode prompts
- `src/data/thresholdFramings.ts` — mood combination → framing text map
- `src/data/layerIntros.ts` — 5 layer intro sentences
- `src/data/tillbakaCards.ts` — 12 Tillbaka card definitions (4 authored, 8 placeholder)
- `src/data/stillUsSequence.ts` — the canonical 22-card order + phase constants

### Phase 3: New Screens (Isolated, No Routing Yet)
Build all new components without connecting to routing:

1. `SliderCheckIn.tsx` — Phase A/B/C slider check-in with accessibility
2. `SliderReveal.tsx` — Dual-position reveal with Phase B/C reflections
3. `SliderHandoff.tsx` — Tier 2 same-device handoff
4. `FormatPreview.tsx` — Post-first-slider onboarding (2-3 slides)
5. `Share.tsx` — Partner link sharing with 15s polling
6. `Tier2Setup.tsx` — Partner name collection
7. `SessionOneLive.tsx` — Öppna (2Q) + Vänd pt 1 (1Q) with threshold framing
8. `SessionOneComplete.tsx` — Session 1 completion with partner takeaway handoff
9. `SessionTwoStart.tsx` — Session 2 reorientation
10. `SessionTwoLive.tsx` — Vänd pt 2 (1Q) + Tänk om (1Q)
11. `CardComplete.tsx` — Card completion with partner takeaway handoff (Fix 1/9)
12. `TillbakaSessionLive.tsx` — Simplified 2-question session
13. `TillbakaComplete.tsx` — Tillbaka completion
14. `CompletionCeremony.tsx` — 5-screen post-journey ceremony
15. `JourneyProgress.tsx` — 22-dot progress bar
16. `ReturnRitual.tsx` — Dormancy return overlay
17. `MaintenanceActionCard.tsx` — Maintenance mode Home card
18. `SoloReflect.tsx` — Solo-mode bridge reflection
19. `Journey.tsx` — Full journey timeline with insights + multi-cycle toggle

### Phase 4: Home Screen Rebuild
Rebuild `Home.tsx` with:
- 10 Action Card states (1-10 including 7b)
- Adaptive polling (10s → 30s → 60s)
- Tier 2 setup intercept
- Maintenance mode rendering
- Return-after-inactivity overlay
- Migration-pending state

### Phase 5: Routing & Integration
Wire everything into `App.tsx`:
- `/check-in/:cardId` → SliderCheckIn
- `/check-in/:cardId/handoff` → SliderHandoff
- `/format-preview` → FormatPreview
- `/share` → Share
- `/tier2-setup` → Tier2Setup
- `/session/:cardId/start` → Threshold + SliderReveal → SessionOneLive
- `/session/:cardId/complete-session1` → SessionOneComplete
- `/session/:cardId/session2-start` → SessionTwoStart
- `/session/:cardId/live-session2` → SessionTwoLive
- `/session/:cardId/complete` → CardComplete
- `/session/:cardId/tillbaka` → TillbakaSessionLive
- `/ceremony` → CompletionCeremony
- `/journey` → Journey
- `/unlock` → Unlock (paywall)
- Update `ProductIntro.tsx` (fix kids copy, remove format preview trigger)
- Update `ProductLibrary.tsx` (Still Us tile copy)

### Phase 6: SessionFocusShell + Session Lock
Modify `SessionFocusShell.tsx`:
- Add 60s heartbeat (`session_heartbeat` RPC)
- Handle `taken_over` response
- Check `migration_pending`
- `acquire_session_lock` on mount for both Session 1 and Session 2

### Phase 7: Tier 1 Partner Web Page
Create a standalone lightweight web page (`public/check-in/index.html`):
- Under 100KB, vanilla JS
- Slider UI matching the app
- Phase A/B/C reflection support (via JWT `card_index` claim)
- Retry logic with sessionStorage fallback
- POST to `complete_slider_checkin` with `link_token`

### Phase 8: Notifications & Cron
- Update notification edge function for N1-N8 inventory
- Create `advance_tillbaka_cards` cron job (daily 06:00 UTC)
- Create stale-card auto-advance cron (Day 21 check)

### Phase 9: Cleanup
- Remove: `Reflect.tsx`, `RevealMoment.tsx`, `BeatCompletionPart1.tsx`, `SessionReorientation.tsx`, `PartnerThought.tsx`, `StillUsExplore.tsx`
- Verify `CardView.tsx` / `Category.tsx` still work for kids products before removing Still Us paths
- Add `:focus-visible` rules to global CSS
- Add `prefers-reduced-motion` handling

---

## Key Risks

1. **CardView.tsx (3,059 lines)**: Must not break kids products during the split
2. **Existing couple data**: Existing couples need smooth migration — new columns default correctly (phase='program', cycle_id=1)
3. **Tier 1 web page CORS**: Must be tested across browsers
4. **advance_card transaction size**: May need async post-commit hooks for N1 queue + cache invalidation

## Content Dependencies (Not Blocking Dev)

- 17 of 22 slider prompt sets need clinical authoring
- 22 reorientation summaries
- 22 solo reflection prompts
- 8 of 12 Tillbaka cards
- Question assignment (which Öppna Q to drop per card, Vänd Q1 vs Q2 assignment)

All can use placeholder content during development.

