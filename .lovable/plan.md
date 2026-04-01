

## Fix: Kids product resume at last unanswered prompt

### Problem
Kids products always resume at Q1 because `localPromptIndex` is client-only state initialized to `0`. The DB tracks `current_step_index` (always 0 for single-step kids products), but the sub-prompt position is lost.

### Approach
Add a resume-restoration effect in `CardView.tsx` that queries `step_reflections` on mount, decodes the highest `step_index % 100` to find the last answered prompt, and sets `localPromptIndex` to `lastAnswered + 1`.

### Changes (1 file: `src/pages/CardView.tsx`)

**1. New state: `resumeLoading`**
- Add `const [resumeLoading, setResumeLoading] = useState(false)` near `localPromptIndex`
- This gates the kids live view with the existing loading gate pattern, preventing Q1 flash

**2. Resume restoration effect** (after eager session creation, ~line 455)
- Guard: `isKidsProduct && cardViewMode === 'live' && isActiveSession && normalizedSession.sessionId`
- Ref guard: `resumeCheckedRef` — resets on **both** `cardId` and `normalizedSession.sessionId` changes (addresses the "same card, new session" concern)
- Set `resumeLoading = true` before the query
- Query `step_reflections` where `session_id = activeSessionId`, `user_id = user.id`, `step_index >= 0 AND < 100`, `text != ''`
- Find `maxStepIndex` from results
- If no results → stay at 0 (first visit)
- If `maxStepIndex % 100 + 1 >= totalPrompts` → all prompts answered → don't set index (let completion logic handle it naturally, or set to last prompt so the completion CTA triggers)
- Otherwise → `setLocalPromptIndex(maxStepIndex % 100 + 1)`
- Set `resumeLoading = false` after
- **Race guard**: check a `cancelled` flag before setting state, so if the user navigates away before the query resolves, stale state isn't applied

**3. Extend loading gate** (~line 988)
- Add `resumeLoading` to `isInitializing`: `normalizedSession.loading || accessLoading || resumeLoading`
- This ensures the solid-background loading gate stays up until the resume position is known — no Q1 flash

### Edge cases addressed

| Concern | Solution |
|---|---|
| Same card, new session | `resumeCheckedRef` resets on `sessionId` change |
| All prompts answered | Clamp to `totalPrompts - 1` (last prompt), letting the existing "isLastPrompt" completion CTA trigger naturally |
| Race: user taps before query resolves | `resumeLoading` keeps the loading gate up — user can't interact until position is resolved |
| No reflections exist | Stays at prompt 0, identical to current behavior |
| devState / demo mode | Skip resume query entirely (matches existing guards) |

### What stays untouched
- Still Us resume logic (multi-step, uses `serverStepIndex`)
- `step_reflections` encoding scheme
- Session creation, completion, abandon logic
- Archive mode navigation
- Loading gate visual appearance

