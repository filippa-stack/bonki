

## Combined fix: Reflections visible in-session + batch-promote on completion

### Changes across 2 files

**File 1: `src/pages/CardView.tsx`**

**1a. Simplify prompt-change reset (lines 629–634)**
Remove `setKidsNoteLocalText('')` from the reset effect. The sync effect (1b) is now the single source of truth for text content.

**1b. Update sync effect with step validation + else branch (lines 636–643)**
Replace with version that:
- Validates `myReflection.stepIndex === kidsNoteStepIndex` (already present)
- Adds `else { setKidsNoteLocalText('') }` to clear text when no reflection exists
- Adds `localPromptIndex` to deps to force re-evaluation on back-navigation

**2. Batch-promote drafts before session completion (before line 754)**
Insert `await supabase.from('step_reflections').update({ state: 'ready' }).eq('session_id', sessionId).eq('state', 'draft')` right before `attemptRpc` is defined — after all session ID resolution is complete.

**3a. Update in-session save copy (lines 3054 and 3124)**
- Line 3054: "Det ni skriver sparas i era samtal" → "Det ni skriver sparas under samtalet"
- Line 3124: "✓ Sparat i era samtal" → "✓ Sparat"

**File 2: `src/components/SessionStepReflection.tsx`**

**3b. Update save indicator (line 284)**
- "✓ Sparat i era samtal" → "✓ Sparat"

### What stays untouched
- KidsCompletionNote (line 3780, 3821) — completion screen, keeps "era samtal"
- SimpleTakeaway (line 3989) — completion screen, keeps "era samtal"
- All protected patterns, hooks, handlers, archive/completion rendering
- No new state variables, refs, or hooks added

