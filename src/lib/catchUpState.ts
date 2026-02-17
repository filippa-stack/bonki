// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

/**
 * Shared catch-up state computation.
 * Ensures consistent behavior across CardView, Home, and any other entry point.
 */

const STEP_COUNT = 4;

export interface CatchUpState {
  /** The first step index this user hasn't completed yet (0-based, or STEP_COUNT if all done). */
  myFirstUncompletedStep: number;
  /** The shared session's current step index. */
  sharedStepIndex: number;
  /** The step the user should actually see (min of shared and their own progress). */
  effectiveStep: number;
  /** True when the user is behind the shared step and needs to catch up. */
  isCatchingUp: boolean;
}

/**
 * Compute catch-up state for a given user on a given card.
 *
 * @param myCompletedSteps - Array of step indices this user has completed
 * @param sharedStepIndex  - The current shared session step index
 * @param hasActiveSession - Whether there is an active session for this card
 */
export function getCatchUpState(
  myCompletedSteps: number[],
  sharedStepIndex: number,
  hasActiveSession: boolean
): CatchUpState {
  let myFirstUncompletedStep = STEP_COUNT;
  for (let i = 0; i < STEP_COUNT; i++) {
    if (!myCompletedSteps.includes(i)) {
      myFirstUncompletedStep = i;
      break;
    }
  }

  const effectiveStep = hasActiveSession
    ? Math.min(sharedStepIndex, myFirstUncompletedStep)
    : 0;

  const isCatchingUp = hasActiveSession && myFirstUncompletedStep < sharedStepIndex;

  return { myFirstUncompletedStep, sharedStepIndex, effectiveStep, isCatchingUp };
}
