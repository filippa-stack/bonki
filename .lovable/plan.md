

## Add "Fortsätt utforska" Return User Banner

**File:** `src/components/ProductLibrary.tsx`

**Single change** — insert a new conditional block after line 811 (after the `})()}` that closes the "Nästa steg" suggestion), before line 813 (`<div>`).

The block renders only when:
- `activeProductIds.size === 0` (no active session)
- `Object.keys(completedCountMap).length > 0` (has history)
- Every product in `defaultKidsOrder` has been tried (`!defaultKidsOrder.find(p => !completedCountMap[p.id])`)
- A `bonki-last-active-product` slug exists in localStorage and maps to a valid product

The JSX is exactly the code provided in the prompt — glassmorphic card matching the "Nästa steg" tile style, showing "Fortsätt utforska {product.name}" with a progress subtitle "{X} av {Y} samtal" and a faded arrow.

No other files or logic changed.

