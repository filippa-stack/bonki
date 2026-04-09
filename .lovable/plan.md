

## Convert card images to WebP + preload creature illustrations

### Step 1: Convert 128 PNGs to WebP (script)

Run a shell script using `cwebp` (via nix) to convert all 128 files in `public/card-images/` from PNG to WebP at quality 85, then delete the originals.

```bash
for f in public/card-images/*.png; do
  nix run nixpkgs#libwebp -- -q 85 "$f" -o "${f%.png}.webp"
done
rm public/card-images/*.png
```

### Step 2: Update useCardImage.ts

Change line 60 from `.png` to `.webp`:
```tsx
return `/card-images/${cardId}.webp`;
```

Update the comment on line 3 accordingly.

This is the **only code reference** to `card-images/*.png` in the entire codebase.

### Step 3: Preload creature illustrations in KidsProductHome

Add a `useEffect` in `KidsProductHome` that creates `<link rel="prefetch">` tags for the product's `heroImage` and the next-card images. These are Vite-bundled assets from `src/assets/` (already hashed URLs), so prefetching them on the product home screen ensures they're cached before the user taps into a card portal.

```tsx
useEffect(() => {
  if (product.heroImage) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = product.heroImage;
    document.head.appendChild(link);
  }
}, [product.heroImage]);
```

### Files changed
- `public/card-images/` — 128 PNGs → 128 WebPs (script, ~60-70% size reduction)
- `src/hooks/useCardImage.ts` — `.png` → `.webp` on line 60
- `src/components/KidsProductHome.tsx` — add hero image prefetch in useEffect

### What stays untouched
- All card IDs, filenames (just extension change)
- All product manifests, card data, categories
- All styling, layout, navigation logic
- `src/assets/` creature PNGs (these are processed by Vite, no format change needed)

