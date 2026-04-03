

## Update ResumeBanner CTA to Solid Fill Pill

**Status:** NextActionBanner.tsx ✓ confirmed solid. This is the second solid fill change — for the library-level ResumeBanner.

**File:** `src/components/ResumeBanner.tsx`

### Change — "Fortsätt" button style (lines 55-69)

Update the CTA button to match NextActionBanner's solid pill:

- Add `border: 'none'`
- Add `opacity: 1`
- Change `boxShadow: 'none'` → `'0 2px 8px rgba(0,0,0,0.25)'`
- Keep existing `backgroundColor`, `color`, `borderRadius`, `letterSpacing`, `height`, `maxWidth`, `padding`

### Not changed
- Dismiss button, text, layout, navigate logic, sessionStorage logic
- NextActionBanner (already done)
- Any other file

