

## Fix: Library page cream flash

**File:** `src/components/ProductLibrary.tsx`

### Change 1: Add `useLayoutEffect` to React import (line 1)
```tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
```

### Change 2: Remove `useDefaultTheme` import (line 4)
Delete: `import { useDefaultTheme } from '@/hooks/useDefaultTheme';`

### Change 3: Replace `useDefaultTheme()` call (~line 460)
Remove the `useDefaultTheme()` call. Keep `usePageBackground('#0B1026')`. Add inline Verdigris cleanup:

```tsx
useLayoutEffect(() => {
  document.documentElement.classList.remove('theme-verdigris');
  document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
}, []);
```

This removes the cream `--surface-base` assignment that caused the flash, while still cleaning up Verdigris classes. One file, three small edits.

