

## Unify DEPTH_GRAVITY Font Weights to 500

### Change

**`src/components/PromptItem.tsx`** — Update all four entries in the `DEPTH_GRAVITY` object (lines 41–45) to use `fontWeight: 500`:

```
opening:    { fontWeight: 500, ... }
reflective: { fontWeight: 500, ... }
scenario:   { fontWeight: 500, ... }
exercise:   { fontWeight: 500, ... }
```

Also remove the `isLongText ? 400 : ...` override on line ~334 so long text doesn't get a lighter weight. Replace with just `hasDoubleBreaks && isLastPara ? 500 : gravity.fontWeight` (which is always 500 now).

Single file, weight values only. No structural or layout changes.

