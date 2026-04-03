

## Fix LibraryResumeCard — Correct Question Count

**File:** `src/components/LibraryResumeCard.tsx`

**Single change** — replace lines 120–151 (both the Still Us and kids branches that query `couple_session_completions`) with a unified block that queries `step_reflections`:

```tsx
let stepLabel = '';
const { data: reflections } = await supabase
  .from('step_reflections')
  .select('step_index')
  .eq('session_id', session.id)
  .neq('text', '')
  .order('step_index', { ascending: false })
  .limit(1);

if (fetchId === fetchRef.current) {
  const totalPrompts = card.sections?.reduce(
    (sum, s) => sum + (s.prompts?.length ?? 0), 0
  ) ?? 0;

  if (reflections && reflections.length > 0) {
    const lastAnsweredIndex = reflections[0].step_index % 100;
    const currentPrompt = lastAnsweredIndex + 2;
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

**Why `% 100` works:** The app encodes step_index as `(stageIndex * 100) + promptIndex`. Kids products always use stage 0, so prompt indices are 0, 1, 2… and `% 100` extracts them directly. Still Us uses stages 0–3, and `% 100` extracts the prompt-within-stage correctly.

**Navigation unchanged** — keeps the existing portal route (`/product/{slug}/portal/{catId}?card={cardId}`).

**No other files changed.**

