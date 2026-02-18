import { describe, it, expect } from 'vitest';
import { getCatchUpState } from '@/lib/catchUpState';

describe('getCatchUpState', () => {
  it('returns myFirstUncompletedStep=0 when no steps completed and session active', () => {
    const result = getCatchUpState([], 0, true);
    expect(result.isCatchingUp).toBe(false);
    expect(result.myFirstUncompletedStep).toBe(0);
    expect(result.sharedStepIndex).toBe(0);
  });

  it('shows catching up when user is behind shared step', () => {
    const result = getCatchUpState([0], 2, true);
    expect(result.isCatchingUp).toBe(true);
    expect(result.myFirstUncompletedStep).toBe(1);
    expect(result.sharedStepIndex).toBe(2);
  });

  it('not catching up when user is at or ahead of shared step', () => {
    const result = getCatchUpState([0, 1, 2], 1, true);
    expect(result.isCatchingUp).toBe(false);
    expect(result.myFirstUncompletedStep).toBe(3);
    expect(result.sharedStepIndex).toBe(1);
  });

  it('not catching up when no active session', () => {
    const result = getCatchUpState([0, 1], 2, false);
    expect(result.isCatchingUp).toBe(false);
    expect(result.myFirstUncompletedStep).toBe(2);
  });

  it('handles all steps completed', () => {
    const result = getCatchUpState([0, 1, 2, 3], 3, true);
    expect(result.myFirstUncompletedStep).toBe(4);
    expect(result.isCatchingUp).toBe(false);
  });
});
