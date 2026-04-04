

## Fix: Swap back to brand logo illustration

### Why it looks pixelated
The `pwa-512x512.png` file is actually 1920×1920px — so resolution isn't the issue. The problem is that **PWA app icons are optimized for tiny icon slots** (home screen, task bar). They use aggressive compression and simplified shapes that look fine at 48-64px but fall apart when displayed at 120px on a high-quality page. The file is also 706KB — suspiciously large for what it contains, suggesting it may be a lower-quality image upscaled to 1920px.

### Change
**File:** `src/pages/Install.tsx`

1. Add import: `import bonkiLogo from '@/assets/bonki-logo-transparent.png';`
2. Replace `src="/pwa-512x512.png"` with `src={bonkiLogo}` on line 142

The `bonki-logo-transparent.png` (1122×1629px) is the proper brand creature illustration with transparency — it will render crisply at 120px.

