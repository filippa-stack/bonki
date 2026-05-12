## Single-file change: `src/lib/platform.ts`

### Findings from exploration

- `isProductHiddenOnPlatform` already hides `sexualitetskort` on **any** native platform via `Capacitor.isNativePlatform()` (covers both iOS and Android). No logic change needed for Change 1 — Android is already covered.
- `isAndroidNative` is no longer referenced anywhere outside its own definition (`rg "isAndroidNative"` returns only line 10 of `platform.ts`). Safe to delete.

### Edits

Remove lines 6–12 (the JSDoc block and the `isAndroidNative` export). Keep `isIOSNative`, `HIDDEN_PRODUCT_IDS_NATIVE`, and `isProductHiddenOnPlatform` exactly as they are.

Resulting file:

```ts
import { Capacitor } from '@capacitor/core';

export const isIOSNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const HIDDEN_PRODUCT_IDS_NATIVE = ['sexualitetskort'] as const;

export const isProductHiddenOnPlatform = (productId: string): boolean =>
  Capacitor.isNativePlatform() &&
  (HIDDEN_PRODUCT_IDS_NATIVE as readonly string[]).includes(productId);
```

### Verification

- `rg "isAndroidNative"` → zero matches.
- `rg "isProductHiddenOnPlatform"` → unchanged matches (export in `platform.ts` + usage in `CardView.tsx`).
- Android native hides `sexualitetskort` (same path as iOS); web unaffected.

### Note on Change 1

The user's prompt says to "extend" the function to also return true on Android, but the current implementation already does this through `isNativePlatform()`. No behavior change is required to satisfy the spec — only the dead-code removal of `isAndroidNative`. Flagging this so the user knows nothing is being missed.