const STORAGE_KEY = 'still_us_together_mode';

type TogetherModeValue = 'together' | 'solo';

import { useState, useCallback } from 'react';

export function useTogetherMode() {
  const [togetherMode, _setTogetherMode] = useState<TogetherModeValue>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'solo' ? 'solo' : 'together';
  });

  const setTogetherMode = useCallback((value: TogetherModeValue) => {
    localStorage.setItem(STORAGE_KEY, value);
    _setTogetherMode(value);
  }, []);

  return { togetherMode, setTogetherMode };
}

/** True when the account is in "together" mode (the default). */
export function isTogether(togetherMode: 'together' | 'solo'): boolean {
  return togetherMode === 'together';
}
