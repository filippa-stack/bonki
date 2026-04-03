

## Fix Session Resume — Include Empty Reflections

Two files changed.

### 1. CardView.tsx (line 502)
Remove `.neq('text', '')` from the resume query. No other lines touched.

### 2. LibraryResumeCard.tsx (lines 120–135)
Replace the `couple_session_completions` block with a `step_reflections` query (without `.neq('text', '')`):

```tsx
let stepLabel = '';
const { data: reflections } = await supabase
  .from('step_reflections')
  .select('step_index')
  .eq('session_id', session.id)
  .order('step_index', { ascending: false })
  .limit(1);

if (fetchId === fetchRef.current) {
  const totalPrompts = card.sections?.reduce(
    (sum, s) => sum + (s.prompts?.length ?? 0), 0
  ) ?? 0;
  if (reflections && reflections.length > 0) {
    const lastIndex = reflections[0].step_index % 100;
    const currentPrompt = lastIndex + 1;
    stepLabel = totalPrompts > 1
      ? `Fråga ${Math.min(currentPrompt, totalPrompts)} av ${totalPrompts}`
      : '';
  } else {
    stepLabel = totalPrompts > 1
      ? `Fråga 1 av ${totalPrompts}`
      : '';
  }
}
```

### Why
`useSessionReflections` creates a draft row (with empty text) when the user lands on each prompt. The empty-text filter was discarding these rows, causing resume to always start at prompt 1. Removing it lets the highest `step_index` accurately reflect how far the user got.

