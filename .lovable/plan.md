

## Favicon Mockups for Both Logo Options

I'll generate two mobile screen mockups showing how each uploaded image looks as a favicon — in the browser address bar (16px), browser tab (20px), and as a home screen icon (120px).

### What I'll create

Two side-by-side PNG mockups saved to `/mnt/documents/`:

1. **Option A — Creature logo** (`2-4.png`): The embracing figures illustration
2. **Option B — BONKI wordmark** (`3-3.png`): The bold text logo

Each mockup will show an iPhone-style screen with:
- Safari address bar with 16x16 favicon next to "bonki.lovable.app"
- A browser tab preview with 20x20 favicon + "BONKI" title
- Home screen icon preview (rounded square, 120x120) simulating the PWA app icon

### Steps

1. Copy both uploaded images into the project workspace
2. Generate the mockups using Python/Pillow, rendering each image at favicon sizes against both light (address bar) and dark (home screen icon) backgrounds
3. Save to `/mnt/documents/favicon-mockup-creature.png` and `/mnt/documents/favicon-mockup-wordmark.png`

### Key detail
The creature logo has fine line art that may lose detail at 16px. The wordmark is bold text that may become illegible at 16px. The mockups will reveal exactly how each performs at small sizes.

