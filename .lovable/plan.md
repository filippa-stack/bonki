## Problem

All 7 graphics appear as the BONKI intro screen in your file preview pane, but the actual files on disk are correct (verified by direct inspection — `app-store-1-recognition.png` shows Bibliotek + Vårt Vi + "Samtalen som bär." caption, all 7 hashes distinct, sizes 80KB–756KB, timestamped from this session).

Root cause: Lovable's file preview pane caches by filename. We've written the same 7 filenames across multiple render passes, so the pane is serving a stale early-pass version where the iframe landed on the production onboarding flow.

## Approach

No re-render. No code changes. Copy the seven correct files on disk to **versioned filenames** (`_v2` suffix) and re-emit them as artifacts. Versioned names are uncached, so the preview pane fetches fresh.

## Steps

1. Copy `/mnt/documents/app-store-{n}-{name}.png` → `/mnt/documents/app-store-{n}-{name}_v2.png` for all 7 files.
2. Verify the v2 files are byte-identical to the originals (md5sum match).
3. Emit 7 fresh `<lov-artifact>` tags pointing at the v2 filenames.
4. If, after viewing the v2 files, any graphic still looks wrong, that confirms a real render issue and we re-render that specific graphic. If they look correct, the cache hypothesis is proven and we can stop.

## What this does NOT do

- Does not re-render anything (cheap, fast, deterministic).
- Does not modify any source files.
- Does not address the residual nice-to-haves from last pass (Graphic 1 13/18 progress, Graphic 6 takeaway prefill) — those are separate follow-ups if you want them.

## Risk

Zero. If the preview pane still shows intro screens for v2 files, then the renders themselves are broken and we move to a real re-render with deeper investigation (auth race, iframe redirect, etc.). Either way, this step is the right next move and takes one minute.