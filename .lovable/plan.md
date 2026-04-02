

## Add Error Boundary

Two changes: one new file, one wrapper addition.

### 1. New file: `src/components/BonkiErrorBoundary.tsx`

React class component with `componentDidCatch` that logs `[BonkiErrorBoundary]` prefix. State tracks `hasError`. Fallback UI:

- Full-screen `#0B1026` background with saffron radial glow
- Bonki logo (120px, opacity 0.6)
- "Något gick fel" heading (display font, 24px)
- "Vi beklagar — försök igen." subtext (body font, 15px, 0.6 opacity)
- `BonkiButton` variant="primary" → `window.location.reload()`
- Text link "Tillbaka till start" → `window.location.href = "/"`
- Safe area padding top/bottom

### 2. `src/App.tsx`

Wrap the entire `App` return with `<BonkiErrorBoundary>` as outermost element, outside `QueryClientProvider` and everything else.

```tsx
const App = () => (
  <BonkiErrorBoundary>
    <QueryClientProvider client={queryClient}>
      ... existing tree unchanged ...
    </QueryClientProvider>
  </BonkiErrorBoundary>
);
```

No other files touched.

