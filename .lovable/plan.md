## ✅ Kids product resume at last unanswered prompt (DONE)

Fixed kids products always resuming at Q1 by querying `step_reflections` on mount to find the highest answered prompt via `step_index % 100` encoding, then setting `localPromptIndex` to the next unanswered prompt. Added `resumeLoading` state to prevent Q1 flash via the existing loading gate pattern.
