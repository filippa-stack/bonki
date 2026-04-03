

## Fix Still Us Step Label in Resume Banner

**File:** `src/components/LibraryResumeCard.tsx`

### Change
Replace the Still Us step label block (lines ~130–149) — the `if (session.product_id === 'still_us')` branch that uses `buildDynamicSteps`/`dynSteps`/`step.label` — with the same simple count-based format used by kids products:

```tsx
if (session.product_id === 'still_us') {
  const { data: completions } = await supabase
    .from('couple_session_completions')
    .select('step_index')
    .eq('session_id', session.id);

  if (fetchId === fetchRef.current) {
    const completedCount = (completions || []).length;
    const totalPrompts = card.sections?.reduce(
      (sum, s) => sum + (s.prompts?.length ?? 0), 0
    ) ?? 0;
    stepLabel = totalPrompts > 1
      ? `Fråga ${completedCount + 1} av ${totalPrompts}`
      : '';
  }
}
```

The `buildDynamicSteps` import can also be removed if no longer used elsewhere in this file.

### Not changed
- Kids product step label logic (else branch)
- "Pausad vid" prefix logic
- Navigation, data fetching, props, or any other file

