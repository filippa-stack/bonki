## Goal

Make `/analytics` substantially richer, sourcing data from the **LIVE** backend only, with all internal team and fake/review accounts excluded — so the numbers reflect real users.

Note: The dashboard already lives at `src/pages/AnalyticsDashboard.tsx` + edge function `supabase/functions/get-analytics`. This plan extends both. The Lovable Cloud project for the deployed app at bonkiapp.com IS the LIVE backend — when accessed via bonki.lovable.app / bonkiapp.com the dashboard already reads live data. We will not change that wiring; we just enrich what's measured and tighten the exclusion list.

---

## 1. Tighten "internal / fake account" exclusion

Currently `EXCLUDED_USER_IDS` in `get-analytics` only excludes 3 IDs. From LIVE auth.users, the real internal + review + test accounts are:

```
b29f4c84-...  filippa@bonkistudio.com
8105cd94-...  bernhard.emma@gmail.com
999288dd-...  emma@bonkistudio.com
ca36b0ea-...  filippa.cekander@bonkistudio.com
c1226be0-...  ida@bonkistudio.com
d3ac01ff-...  sofia@bonkistudio.com
f05b6b17-...  apple.review@bonkistudio.com
3c53e146-...  play.review@bonkistudio.com
d13e0011-...  test@example.com
9533d524-...  filippa.bernhard@yahoo.com
ad3e00d5-...  filippa.bernhard@yahoomail.com
```

`ALLOWED_USER_IDS` (admin gate) stays as today's 3 IDs. Exclusion list grows to the 11 above.

Also exclude any couple_space that has *any* of these users as a member (already done via `excludedSpaceIds`, just expanded).

## 2. New metrics added to the dashboard

Grouped into clear sections:

**Acquisition (last N days, default 30)**
- New unique users (auth.users via couple_members joined with first-seen)
- Total real users to date
- Daily signups sparkline (small inline chart, SVG, no new deps)

**Activation funnel** (built from `onboarding_events` + sessions)
- Lobby views → onboarding complete → first session started → first session completed → first paid
- Conversion % between each step

**Engagement**
- DAU / WAU / MAU (rolling)
- Avg sessions per active user
- Avg reflections per session
- Returning users (≥2 sessions on different days)

**Product breakdown**
- Sessions, completions, reflections grouped by `product_id`
- Top 5 cards per product

**Monetization**
- Paid couple_spaces (count + % of total spaces)
- New paid spaces in window
- Free → paid conversion (spaces created in window vs paid_at within 30 days)

**Retention (cohort-lite)**
- Of users created in week W, % who completed ≥1 session in week W+1

**Existing sections retained**: sessions by status, reflections by state, notes, bookmarks, top cards, beta feedback.

## 3. UX changes

- Dashboard kept at `/analytics`, mobile-first (matches current style).
- Filters extended: from-date (kept), product (kept), plus a window selector (24h / 7d / 30d / custom) used by acquisition + engagement blocks.
- Each new section uses the same `StatCard` / `SectionTitle` / `BreakdownRow` components — no new design system.
- Tiny inline SVG sparkline component for daily signups + DAU trend (no chart library).
- A small "LIVE • internal accounts excluded" badge in the header so it's clear what you're looking at.

## 4. Files touched

```text
supabase/functions/get-analytics/index.ts   (expand exclusion list + new aggregations)
src/pages/AnalyticsDashboard.tsx            (new sections, sparkline, window filter)
src/components/Sparkline.tsx                (new tiny SVG component)
```

No DB migrations. No new tables. No new secrets.

## 5. Out of scope

- No CSV export (can add later).
- No per-user drill-down (privacy stance preserved — aggregates only, beta_feedback stays the only free-text surface).
- No charts library — sparklines hand-rolled in SVG to keep bundle small.
