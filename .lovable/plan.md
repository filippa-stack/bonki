

## Library — Remove "Era samtal" Card + Upgrade Resume CTA

### Change 1: Remove "Era samtal" card
**File:** `src/components/ProductLibrary.tsx`

Delete lines 1080–1141 (the `{/* Era samtal */}` comment, the entire `<motion.div>` block, and its closing `</div>` on line 1141).

Keep the bottom safe-area spacing div (line 1143–1144) intact.

### Change 2: Upgrade "Fortsätt" pill
**File:** `src/components/LibraryResumeCard.tsx`

Replace the existing `<span>` for "Fortsätt" (lines ~252–260) with a solid Bonki Orange pill:
```tsx
<span style={{
  fontFamily: "var(--font-sans)",
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  color: '#1A1A2E',
  flexShrink: 0,
  marginLeft: '12px',
  backgroundColor: '#E85D2C',
  padding: '8px 16px',
  borderRadius: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
}}>
  Fortsätt
</span>
```

### Not changed
- Resume card data fetching, navigation, props, or conditional logic
- "Nästa steg" suggestion tile
- Product tiles
- BottomNav
- Any other file

