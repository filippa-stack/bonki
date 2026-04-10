

## Remove Page Transition Animation

### Scope
Only `src/components/PageTransition.tsx` needs changing. `App.tsx` does not use `PageTransition` or `AnimatePresence`, so no changes there.

### Change

**`src/components/PageTransition.tsx`** — Replace the entire file with a simple pass-through wrapper:

```tsx
import { ReactNode, forwardRef } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, className }, ref) => (
    <div ref={ref} style={{ width: '100%', minHeight: '100vh' }} className={className || ''}>
      {children}
    </div>
  )
);

PageTransition.displayName = 'PageTransition';
export default PageTransition;
```

- Removes `framer-motion` import, `motion.div`, all animation props
- Keeps the `forwardRef` signature and `style` so any future consumer still works
- No other files touched

