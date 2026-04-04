

## Pre-Launch Cleanup & Rebrand to BONKI (Revised)

### What changed from previous plan
- **Item 6 (check-in page): KEPT** — `public/check-in/index.html` stays. It's a functioning feature with Edge Functions (`complete-slider-checkin`, `get-checkin-data`) connected to the database.
- **Item 7 (email auto-confirm): CORRECTED** — Auto-confirm stays **disabled**. Email verification is the correct setting for a paid product with ad-driven traffic. No auth config change needed (it's already disabled by default).

### Changes to make

**1. Delete `src/components/TestModeBanner.tsx`**
Dead code, not imported anywhere. Safe to remove.

**2. Rebrand `index.html`**
- `<title>Still Us</title>` → `<title>BONKI</title>`
- `<meta name="description">` → `"Samtalskort för relationer — på riktigt"`
- `<meta name="author">` → `"BONKI"`
- `<meta name="apple-mobile-web-app-title">` → `"BONKI"`
- `<meta property="og:title">` → `"BONKI"`
- `<meta property="og:description">` → updated copy
- OG image URL → use the existing `bonki-logo.png` or a dedicated OG image if available

**3. Rebrand `src/components/Footer.tsx`**
- `© {year} Still Us` → `© {year} BONKI`
- `alt="Still Us"` → `alt="BONKI"`

### NOT changed
- `public/check-in/` — left intact
- Email auto-confirm — left disabled (email verification stays on)
- No logic, data model, or Edge Function changes

### Post-implementation (manual)
- Connect `bonkistudio.com` domain via Project Settings → Domains
- Visually verify PWA icons show BONKI branding before launch

