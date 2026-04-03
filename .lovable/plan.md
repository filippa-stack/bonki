

## Fix Resume Banner Question Count

**File:** `src/components/LibraryResumeCard.tsx`

**Single change** — replace lines 120–145 (the `step_reflections` query block) with a `couple_session_completions` query:

```tsx
let stepLabel = '';
const { data: completions } = await supabase
  .from('couple_session_completions')
  .select('step_index')
  .eq('session_id', session.id);

if (fetchId === fetchRef.current) {
  const totalPrompts = card.sections?.reduce(
    (sum, s) => sum + (s.prompts?.length ?? 0), 0
  ) ?? 0;
  const completedCount = (completions || []).length;
  const currentPrompt = completedCount + 1;
  stepLabel = totalPrompts > 1
    ? `Fråga ${Math.min(currentPrompt, totalPrompts)} av ${totalPrompts}`
    : '';
}
```

**Why:** `couple_session_completions` tracks every prompt the user advanced past (regardless of whether they wrote text), while `step_reflections` only has rows with non-empty text. This fixes "Fråga 1 av X" showing for users who skip writing.

**No other changes** — navigation, display, styling, other files untouched.

