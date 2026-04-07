

## Card title uppercase — kids products only

### Changes

**1. `src/pages/KidsCardPortal.tsx`** — line 506-517, add `textTransform: 'uppercase'` and `letterSpacing: '1.5px'` to the card title `<h2>`.

**2. `src/components/IllustrationPeek.tsx`** — accept new `isKidsProduct` prop. On the fullscreen overlay title (line 126-142), conditionally apply `textTransform: 'uppercase'` + `letterSpacing: '1.5px'` instead of `'capitalize'`.

**3. `src/pages/CardView.tsx`** — two locations:
- **In-session header** (line 3059-3066): conditionally apply uppercase + letter-spacing using existing `isKidsProduct` (already defined at line 181).
- **IllustrationPeek calls** (lines 3436, 3480): pass `isKidsProduct` prop.

### Guard logic
All three files already have access to `product` and can derive `isKidsProduct = product?.id !== 'still_us'`. KidsCardPortal always shows kids products. IllustrationPeek gets a new boolean prop.

### Files modified
| File | Action |
|---|---|
| `src/pages/KidsCardPortal.tsx` | Edit (2 style props on title h2) |
| `src/components/IllustrationPeek.tsx` | Edit (add prop + conditional style) |
| `src/pages/CardView.tsx` | Edit (conditional style on header + pass prop) |

