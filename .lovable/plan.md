

## Fix Resume Off-by-One

Two files, minimal changes.

### 1. CardView.tsx (lines 508–517)
Replace the resume index calculation — remove the `+1` so the user returns to the prompt they were on:

```tsx
// FROM:
const lastAnswered = maxStepIndex % 100;
const nextPrompt = lastAnswered + 1;

if (nextPrompt < totalPrompts) {
  setLocalPromptIndex(nextPrompt);
} else {

// TO:
const currentPrompt = maxStepIndex % 100;

if (currentPrompt < totalPrompts) {
  setLocalPromptIndex(currentPrompt);
} else {
```

### 2. LibraryResumeCard.tsx (lines 133–134)
Collapse to one line — the `+1` here is correct (converting 0-indexed to 1-indexed display label):

```tsx
// FROM:
const lastIndex = reflections[0].step_index % 100;
const currentPrompt = lastIndex + 1;

// TO:
const currentPrompt = (reflections[0].step_index % 100) + 1; // 1-indexed for display
```

No other changes.

