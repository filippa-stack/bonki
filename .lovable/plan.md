

## Upgrade "Nästa steg" to Tile Style

**File:** `src/components/ProductLibrary.tsx`

### Change (lines 732-753)

Replace the plain text button with a glassmorphic tile matching the "Era samtal" card style.

**From:** Plain `<button>` with no background, 13px text, 0.45 opacity

**To:** Full-width tile with:
- Dark translucent background (`rgba(15, 15, 15, 0.7)`) + backdrop blur
- 16px border radius, border glow, multi-layer box shadow
- Saffron accent dot (36×36px rounded square with ✦ icon)
- Two-line text: "Prova {name}" + "Ert första samtal är gratis"
- Arrow hint (→) on the right

The conditional logic (lines 728-730, 754-755) stays exactly as-is. Only the inner JSX (lines 732-753) is replaced.

### Not changed
- Conditional logic, LibraryResumeCard, "Era samtal" card, any other file

