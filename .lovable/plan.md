

# Adjust Background Illustration Position — Jag i Världen

## What & Why

The mockup measurement shows the illustration's visible area at **x=134, y=39** on a 390px-wide viewport. Currently the image is offset too far up/left. Need to reposition so it enters from the right side starting at ~34% from left, near the top.

## Changes in `src/components/JagIVarldenProductHome.tsx`

### Image positioning (lines 59-67)

Replace current values:

```tsx
top: '0',
right: '-20vw',
width: '110%',
height: '100%',
objectFit: 'cover',
objectPosition: '85% 15%',
```

### Left safe-zone gradient (line 73)

Tighten the gradient to match the ~34% illustration entry point:

```tsx
background: `linear-gradient(to right, ${BG} 0%, ${BG}F0 15%, ${BG}A0 30%, transparent 55%)`
```

### Top scrim (line 83)

Lighten to let more illustration show through at top-right:

```tsx
background: `linear-gradient(to bottom, ${BG}B0 0%, ${BG}60 50%, transparent 100%)`
```

