# Product home mock — calibration pass

Three small fixes to `src/components/ProductHomeMock.tsx` based on visual review of `/product-home-mock/jag_i_mig`.

## 1. MOCK badge position

Move the badge from top-right (where it overlaps the centered title) to top-left. The back arrow's "← Biblioteket" link sits on the same row but doesn't extend far enough right to conflict.

In the `<button aria-label="Mock badge">` block:
- Change `right: 12` → `left: 12`
- Keep `top: 'calc(env(safe-area-inset-top, 0px) + 50px)'`

## 2. Varied card thumbnail placeholders

Replace the repeated product illustration in each card with a varied placeholder so the grid doesn't look broken and composition can be evaluated cleanly.

Approach: cycle through illustrations from across the product line as obvious placeholders. Each tile in the grid gets a different illustration based on its index, drawn from a fixed pool of all 6 product illustrations already imported (`illustrationJagIMig`, `illustrationJagMedAndra`, `illustrationJagIVarlden`, `illustrationVardag`, `illustrationSyskon`, `illustrationStillUs`).

Implementation:
- Add a `PLACEHOLDER_POOL: string[]` constant at module top with the six illustrations.
- In the grid `.map((card, i) => ...)`, replace `src={spec.illustration}` with `src={PLACEHOLDER_POOL[i % PLACEHOLDER_POOL.length]}`.
- Remove the now-unused `illustration` field from each `ProductSpec` (and the imports stay because they all feed the pool).

This keeps it dead-simple and visually obvious as placeholders.

## 3. Back link copy — no change

Verified in `src/pages/ProductHome.tsx` (around line 155): live ProductHome renders `<ArrowLeft /> Biblioteket` — arrow plus text. The mock already matches. No edit needed.

## Verification

- `/product-home-mock/jag_i_mig`: MOCK badge sits top-left, no overlap with the centered "Jag i Mig" title.
- Each card in the grid shows a different illustration from the pool — no two adjacent tiles are identical (within the first 4-6 cards).
- Back link still reads "← Biblioteket".
- Other product routes (`/product-home-mock/jag_med_andra`, etc.) inherit the same varied-placeholder behavior.
