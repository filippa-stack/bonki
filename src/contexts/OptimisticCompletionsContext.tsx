import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

interface OptimisticCompletionsContextValue {
  /** Card IDs that have been optimistically marked as completed */
  optimisticCardIds: Set<string>;
  /** Mark a card as optimistically completed */
  markCompleted: (cardId: string) => void;
}

const Ctx = createContext<OptimisticCompletionsContextValue>({
  optimisticCardIds: new Set(),
  markCompleted: () => {},
});

export function OptimisticCompletionsProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  const markCompleted = useCallback((cardId: string) => {
    setIds(prev => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ optimisticCardIds: ids, markCompleted }), [ids, markCompleted]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOptimisticCompletions() {
  return useContext(Ctx);
}
