

## `/install` Landing Page — Updated with Bonki Orange

Same plan as approved, with one design change: **Primary CTA uses Bonki Orange (#E85D2C)** instead of Saffron, matching the onboarding "Börja" button style.

### CTA style

```tsx
style={{
  background: 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)',
  boxShadow: [
    '0 10px 28px rgba(232, 93, 44, 0.35)',
    '0 4px 10px rgba(232, 93, 44, 0.20)',
    '0 1px 3px rgba(0, 0, 0, 0.12)',
    'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
    'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
  ].join(', '),
}}
```

This is consistent with `Onboarding.tsx` which already overrides BonkiButton with the same Bonki Orange gradient.

### Files

| Action | File |
|--------|------|
| Create | `src/pages/Install.tsx` — full page, platform detection (iOS/Android/Desktop), Bonki Orange CTA |
| Edit | `src/App.tsx` — add `/install` public route |
| Edit | `src/components/InstallGuideBanner.tsx` — rebrand "Still Us" → "BONKI" |

Everything else unchanged: platform-adaptive instructions, iOS non-Safari nudge, Meta Pixel tracking, dark background, no BottomNav.

