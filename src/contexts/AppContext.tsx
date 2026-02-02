import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoupleSpace, ConversationThread, Reflection, AppState, Category, Card } from '@/types';
import { categories as initialCategories, cards as initialCards } from '@/data/content';

interface AppContextType {
  state: AppState;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  coupleSpace: CoupleSpace | null;
  initializeCoupleSpace: (partnerAName?: string, partnerBName?: string) => void;
  savedConversations: ConversationThread[];
  saveConversation: (cardId: string, sectionId: string) => void;
  getConversationForCard: (cardId: string) => ConversationThread | undefined;
  reflections: Reflection[];
  addReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getReflectionsForSection: (cardId: string, sectionId: string) => Reflection[];
  mostRecentConversation: ConversationThread | null;
  categories: Category[];
  updateCategory: (id: string, title: string, description: string) => void;
  cards: Card[];
  updateCard: (id: string, title: string, subtitle: string) => void;
  updateCardColor: (id: string, color: string) => void;
  updateCardSection: (cardId: string, sectionId: string, updates: Partial<{ title: string; content: string; prompts: string[] }>) => void;
  getCardsByCategory: (categoryId: string) => Card[];
  getCardById: (cardId: string) => Card | undefined;
  getCategoryById: (categoryId: string) => Category | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'vi-som-foraldrar-state';
const CATEGORIES_STORAGE_KEY = 'vi-som-foraldrar-categories';
const CARDS_STORAGE_KEY = 'vi-som-foraldrar-cards';

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return initialCategories;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const stored = localStorage.getItem(CARDS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return initialCards;
  });

  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (parsed.coupleSpace) {
        parsed.coupleSpace.createdAt = new Date(parsed.coupleSpace.createdAt);
        parsed.coupleSpace.conversationThreads = parsed.coupleSpace.conversationThreads.map((t: any) => ({
          ...t,
          savedAt: new Date(t.savedAt),
          lastActivityAt: new Date(t.lastActivityAt),
          reflections: t.reflections.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          })),
        }));
      }
      return parsed;
    }
    return {
      coupleSpace: null,
      hasCompletedOnboarding: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const updateCategory = (id: string, title: string, description: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, title, description } : cat
      )
    );
  };

  const updateCard = (id: string, title: string, subtitle: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, title, subtitle } : card
      )
    );
  };

  const updateCardColor = (id: string, color: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, color } : card
      )
    );
  };

  const updateCardSection = (cardId: string, sectionId: string, updates: Partial<{ title: string; content: string; prompts: string[] }>) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              sections: card.sections.map((section) =>
                section.id === sectionId
                  ? { ...section, ...updates }
                  : section
              ),
            }
          : card
      )
    );
  };

  const getCardsByCategory = (categoryId: string): Card[] => {
    return cards.filter((card) => card.categoryId === categoryId);
  };

  const getCardById = (cardId: string): Card | undefined => {
    return cards.find((card) => card.id === cardId);
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const initializeCoupleSpace = (partnerAName?: string, partnerBName?: string) => {
    const newSpace: CoupleSpace = {
      id: crypto.randomUUID(),
      mode: 'single',
      partnerAName,
      partnerBName,
      conversationThreads: [],
      createdAt: new Date(),
    };
    setState((prev) => ({ ...prev, coupleSpace: newSpace }));
  };

  const saveConversation = (cardId: string, sectionId: string) => {
    if (!state.coupleSpace) return;

    const existingIndex = state.coupleSpace.conversationThreads.findIndex(
      (t) => t.cardId === cardId
    );

    const now = new Date();
    const cardReflections = state.coupleSpace.conversationThreads
      .find((t) => t.cardId === cardId)?.reflections || [];

    const thread: ConversationThread = {
      id: existingIndex >= 0 
        ? state.coupleSpace.conversationThreads[existingIndex].id 
        : crypto.randomUUID(),
      cardId,
      lastSectionId: sectionId,
      reflections: cardReflections,
      savedAt: existingIndex >= 0 
        ? state.coupleSpace.conversationThreads[existingIndex].savedAt 
        : now,
      lastActivityAt: now,
    };

    setState((prev) => {
      if (!prev.coupleSpace) return prev;
      
      let threads = [...prev.coupleSpace.conversationThreads];
      if (existingIndex >= 0) {
        threads[existingIndex] = thread;
      } else {
        threads = [thread, ...threads];
      }

      return {
        ...prev,
        coupleSpace: {
          ...prev.coupleSpace,
          conversationThreads: threads,
        },
      };
    });
  };

  const getConversationForCard = (cardId: string) => {
    return state.coupleSpace?.conversationThreads.find((t) => t.cardId === cardId);
  };

  const addReflection = (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!state.coupleSpace) return;

    const now = new Date();
    const newReflection: Reflection = {
      ...reflection,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => {
      if (!prev.coupleSpace) return prev;

      // Find or create conversation thread for this card
      const threads = [...prev.coupleSpace.conversationThreads];
      const threadIndex = threads.findIndex((t) => t.cardId === reflection.cardId);

      if (threadIndex >= 0) {
        threads[threadIndex] = {
          ...threads[threadIndex],
          reflections: [...threads[threadIndex].reflections, newReflection],
          lastActivityAt: now,
        };
      } else {
        threads.unshift({
          id: crypto.randomUUID(),
          cardId: reflection.cardId,
          lastSectionId: reflection.sectionId,
          reflections: [newReflection],
          savedAt: now,
          lastActivityAt: now,
        });
      }

      return {
        ...prev,
        coupleSpace: {
          ...prev.coupleSpace,
          conversationThreads: threads,
        },
      };
    });
  };

  const getReflectionsForSection = (cardId: string, sectionId: string) => {
    const thread = state.coupleSpace?.conversationThreads.find((t) => t.cardId === cardId);
    return thread?.reflections.filter((r) => r.sectionId === sectionId) || [];
  };

  const mostRecentConversation = state.coupleSpace?.conversationThreads
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())[0] || null;

  return (
    <AppContext.Provider
      value={{
        state,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        completeOnboarding,
        coupleSpace: state.coupleSpace,
        initializeCoupleSpace,
        savedConversations: state.coupleSpace?.conversationThreads || [],
        saveConversation,
        getConversationForCard,
        reflections: state.coupleSpace?.conversationThreads.flatMap((t) => t.reflections) || [],
        addReflection,
        getReflectionsForSection,
        mostRecentConversation,
        categories,
        updateCategory,
        cards,
        updateCard,
        updateCardColor,
        updateCardSection,
        getCardsByCategory,
        getCardById,
        getCategoryById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
