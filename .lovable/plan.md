

## Add free-session banner above resume card in ProductLibrary

**Single file**: `src/components/ProductLibrary.tsx`

### Change

Insert the free-session banner block between line 739 (the empty line after the ghost glow divider) and line 741 (the resume card comment). The banner renders conditionally on `showFreeBanner` — when false, nothing renders.

The JSX block to insert is exactly as specified: a glassmorphic card with a `✦` icon and the text "Du har 1 gratis samtal — valt utifrån den ålder du angav".

### Insertion point
- **After** line 739 (empty line after the `motion.div` ghost glow divider)
- **Before** line 741 (`{/* Resume card — product-colored, above Föräldrar */}`)

No imports or other changes needed — `showFreeBanner` was added in Change 1.

