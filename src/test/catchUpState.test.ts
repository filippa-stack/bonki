import { describe, it, expect } from 'vitest';
import { getCatchUpState } from '@/lib/catchUpState';

describe('getCatchUpState', () => {
  it('returns step 0 when no steps completed and session active', () => {
    const result = getCatchUpState([], 0, true);
    expect(result.effectiveStep).toBe(0);
    expect(result.isCatchingUp).toBe(false);
    expect(result.myFirstUncompletedStep).toBe(0);
  });

  it('shows catching up when user is behind shared step', () => {
    const result = getCatchUpState([0], 2, true);
    expect(result.effectiveStep).toBe(1); // min(shared=2, myFirst=1)
    expect(result.isCatchingUp).toBe(true);
  });

  it('shows effective step as shared when user is ahead', () => {
    const result = getCatchUpState([0, 1, 2], 1, true);
    expect(result.effectiveStep).toBe(1); // min(shared=1, myFirst=3)
    expect(result.isCatchingUp).toBe(false);
  });

  it('returns step 0 when no active session', () => {
    const result = getCatchUpState([0, 1], 2, false);
    expect(result.effectiveStep).toBe(0);
    expect(result.isCatchingUp).toBe(false);
  });

  it('handles all steps completed', () => {
    const result = getCatchUpState([0, 1, 2, 3], 3, true);
    expect(result.effectiveStep).toBe(3);
    expect(result.myFirstUncompletedStep).toBe(4);
    expect(result.isCatchingUp).toBe(false);
  });
});
