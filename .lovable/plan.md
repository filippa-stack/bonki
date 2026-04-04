

## Fix: Login page redirect + brand alignment

### Problem 1: Can't see login page
Line 156 in `App.tsx`: `/login` redirects authenticated users to `/`. Since you're logged in, you never see the login page. This is intentional for production — but to **preview** it, you need a way in.

**Fix:** Add a devState bypass so `?devState=login` forces the login page to render even when authenticated.

**File:** `src/App.tsx`, line 156
- Change the `/login` route to check for `devState=login` query param — if present, render `<Login />` regardless of auth state.

### Problem 2: Login page doesn't match install page branding

**File:** `src/pages/Login.tsx` — full restyle to match install page:

1. **Background:** Change from light `var(--surface-base)` with radial gradient → `MIDNIGHT_INK` (#1A1A2E) dark background (same as install page)
2. **Brand header:** "BONKI" and "På riktigt." → Ghost Glow `#D4F5C0` color (matching install page header)
3. **Text colors:** All text elements switch to `LANTERN_GLOW` (#FDF6E3) family with appropriate opacity levels
4. **Google button:** Restyle to match install page CTA — Bonki Orange gradient background, white text, same border-radius and shadow
5. **Email button:** Light text on dark, matching install page secondary style
6. **Terms checkbox:** Adapt text color for dark background readability
7. **Tagline** ("Ert konto. Era samtal."): Use `rgba(245,237,210,0.5)` like install page subtext
8. **Import** `MIDNIGHT_INK`, `LANTERN_GLOW` from palette; import `bonkiLogo` and add the creature illustration above the brand text (same as install page, 120px)
9. **Magic link sent state:** Adapt colors for dark background

### Summary of visual changes
- Dark background with creature logo
- Ghost Glow header
- Bonki Orange primary CTA
- Lantern Glow text hierarchy
- Same spacing and typography scale as install page

