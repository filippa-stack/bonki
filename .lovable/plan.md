

## Onboarding 10/10 Polish

### Problems
- CTA ("Börja") clipped at bottom — illustration zone (`flex: 1 1 auto`) consumes too much space
- `overflow: hidden` prevents scrolling on short screens — CTA becomes unreachable
- "Vem vill ni prata med?" at 13px and pill text at 14px violate the 15px minimum
- No breathing room between audience pills and CTA

### Changes (single file: `src/components/Onboarding.tsx`)

1. **Constrain illustration zone**: Change from `flex: '1 1 auto'` to `flex: '1 1 0'` with `maxHeight: '38vh'` and `minHeight: '140px'` — keeps it prominent but bounded
2. **Allow overflow**: Change outer container from `overflow: hidden` to `overflowY: auto`, `overflowX: hidden` — ensures CTA is always reachable on short screens
3. **Fix font sizes**:
   - "Vem vill ni prata med?" label: 13px → 15px
   - Pill buttons: 14px → 15px
4. **Increase content bottom margin**: `marginBottom: '32px'` → `marginBottom: '24px'` to tighten the gap and give more room to the CTA area

No other files changed. No animation, color, or copy changes.

