

## Polish Install to True 10/10

### 1. Give headline breathing room
- Change creature section padding from `'4px 0 0'` to `'8px 0 0'`
- Change value proposition margin from `'-8px auto 0'` to `'4px auto 0'`
- This adds ~16px of air between creature and headline

### 2. Elevate stats with subtle dividers
- Add a thin `1px` top border (`rgba(212, 245, 192, 0.08)`) to the stats container
- Bump stat numbers to `24px` and labels to `13px` for better readability
- This frames them as a distinct section rather than floating numbers

### 3. Tighten CTA group (button + subtext + login)
- Reduce login section padding from `'20px 24px 36px'` to `'14px 24px 36px'`
- This pulls "Redan medlem?" closer to the CTA sub-text, creating one cohesive action block

### 4. Boost creature presence
- Increase creature from `160px` to `172px`
- Increase glow intensity: first shadow from `0.15` to `0.20`, second from `0.06` to `0.10`
- Full opacity (`1.0` instead of `0.95`)

### File changed
`src/pages/Install.tsx` only

