// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables:
// couple_sessions, couple_session_steps, couple_session_completions, couple_takeaways.

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CoupleSpace, ConversationThread, Reflection, AppState, Category, Card, ReflectionsData, PrivateNote, SharedNote, TakeawayNote, SharedTakeaway } from '@/types';
import { categories as initialCategories, cards as initialCards, CONTENT_VERSION } from '@/data/content';
import { useSettingsSync, SaveStatus } from '@/hooks/useSettingsSync';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings, SiteSettings } from '@/contexts/SiteSettingsContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useSharedProgress } from '@/hooks/useSharedProgress';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import { DEV_MOCK } from '@/hooks/useDevState';

interface AppContextType {
  updateCardDescription: (id: string, description: string) => void;
  state: AppState;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  coupleSpace: CoupleSpace | null;
  initializeCoupleSpace: (partnerAName?: string, partnerBName?: string) => void;
  savedConversations: ConversationThread[];
  saveConversation: (cardId: string, sectionId: string, stepIndex?: number) => void;
  getConversationForCard: (cardId: string) => ConversationThread | undefined;
  reflections: Reflection[];
  addReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getReflectionsForSection: (cardId: string, sectionId: string) => Reflection[];
  mostRecentConversation: ConversationThread | null;
  categories: Category[];
  updateCategory: (id: string, title: string, description: string) => void;
  updateCategoryColor: (id: string, color: string) => void;
  updateCategoryTextColor: (id: string, textColor: string) => void;
  updateCategoryBorderColor: (id: string, borderColor: string) => void;
  updateCategoryIcon: (id: string, icon: string) => void;
  cards: Card[];
  addCard: (categoryId: string) => string;
  deleteCard: (cardId: string) => void;
  updateCard: (id: string, title: string, subtitle: string) => void;
  updateCardEmptyState: (id: string, emptyStateTitle: string, emptyStateDescription: string) => void;
  updateCardColor: (id: string, color: string) => void;
  updateCardTextColor: (id: string, textColor: string) => void;
  updateCardBorderColor: (id: string, borderColor: string) => void;
  updateCardSection: (cardId: string, sectionId: string, updates: Partial<{ title: string; content: string; prompts: any[]; color: string; textColor: string }>) => void;
  getCardsByCategory: (categoryId: string) => Card[];
  getCardById: (cardId: string) => Card | undefined;
  getCategoryById: (categoryId: string) => Category | undefined;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  saveError: string | null;
  // Session management for guided flow
  currentSession: AppState['currentSession'];
  startSession: (categoryId: string, cardId: string, opts?: { force?: boolean; fromBeginning?: boolean }) => void;
  updateSessionStep: (stepIndex: number) => void;
  completeSessionStep: (stepIndex: number) => void;
  endSession: () => void;
  hasActiveSession: boolean;
  dismissSession: () => void;
  pauseSession: () => void;
  // Journey state selectors are now in spaceSnapshot selectors (selectExploredCardIds, etc.)
  getCategoryStatus: (categoryId: string) => 'not_started' | 'in_progress' | 'explored';
  getExploredCardsInCategory: (categoryId: string) => number;
  // Reflections (private/shared)
  getPrivateNote: (cardId: string) => PrivateNote | undefined;
  getSharedNote: (cardId: string) => SharedNote | undefined;
  savePrivateNote: (cardId: string, text: string) => void;
  saveSharedNote: (cardId: string, text: string) => void;
  removeSharedNote: (cardId: string) => void;
  isHighlighted: (cardId: string) => boolean;
  toggleHighlight: (cardId: string) => void;
  highlightCount: number;
  getAllSharedNotes: () => Record<string, SharedNote>;
  getHighlightedCards: () => string[];
  // Takeaways
  getTakeawayPrivate: (cardId: string) => TakeawayNote | undefined;
  getTakeawayShared: (cardId: string) => SharedTakeaway | undefined;
  saveTakeawayPrivate: (cardId: string, text: string) => void;
  saveTakeawayShared: (cardId: string, text: string) => void;
  removeTakeawayShared: (cardId: string) => void;
  isTakeawayHighlighted: (cardId: string) => boolean;
  toggleTakeawayHighlight: (cardId: string) => void;
  takeawayHighlightCount: number;
  refreshCoupleSpace: () => Promise<void>;
  switchToNewSpace: () => Promise<{ ok: boolean; spaceId?: string }>;
  setOverrideCoupleSpaceId: (id: string | null) => void;
  /** True when a remote update changed the active cardId */
  remoteCardChanged: boolean;
  dismissRemoteCardCue: () => void;
  /** Clear session when partner leaves the space */
  clearForPartnerLeave: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'vi-som-foraldrar-state';
const CATEGORIES_STORAGE_KEY = 'vi-som-foraldrar-categories';
const CARDS_STORAGE_KEY = 'vi-som-foraldrar-cards';
const BACKGROUND_COLOR_KEY = 'vi-som-foraldrar-background';
const CONTENT_VERSION_KEY = 'vi-som-foraldrar-content-version';

function mergeCategories(cached: Category[], source: Category[]): Category[] {
  const map = new Map(cached.map((c) => [c.id, c]));
  return source.map((s) => {
    const existing = map.get(s.id);
    if (existing) {
      return {
        ...s,
        color: existing.color || s.color,
        textColor: existing.textColor || s.textColor,
        borderColor: existing.borderColor || s.borderColor,
        icon: existing.icon || s.icon,
      };
    }
    return s;
  });
}

function mergeCards(cached: Card[], source: Card[]): Card[] {
  const map = new Map(cached.map((c) => [c.id, c]));
  return source.map((s) => {
    const existing = map.get(s.id);
    if (existing) {
      return {
        ...s,
        color: existing.color || s.color,
        textColor: existing.textColor || s.textColor,
        borderColor: existing.borderColor || s.borderColor,
      };
    }
    return s;
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const devState = useDevState();
  const storedVersion = parseInt(localStorage.getItem(CONTENT_VERSION_KEY) || '0', 10);
  const needsMerge = storedVersion < CONTENT_VERSION;

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      const cached = JSON.parse(stored);
      if (needsMerge) return mergeCategories(cached, initialCategories);
      return cached;
    }
    return initialCategories;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const stored = localStorage.getItem(CARDS_STORAGE_KEY);
    if (stored) {
      const cached = JSON.parse(stored);
      if (needsMerge) return mergeCards(cached, initialCards);
      return cached;
    }
    return initialCards;
  });

  useEffect(() => {
    if (needsMerge) {
      localStorage.setItem(CONTENT_VERSION_KEY, String(CONTENT_VERSION));
    }
  }, [needsMerge]);

  const [backgroundColor, setBackgroundColorState] = useState<string>(() => {
    const stored = localStorage.getItem(BACKGROUND_COLOR_KEY);
    return stored || '';
  });

  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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
      if (parsed.currentSession) {
        parsed.currentSession.startedAt = new Date(parsed.currentSession.startedAt);
        parsed.currentSession.lastActivityAt = new Date(parsed.currentSession.lastActivityAt);
      }
      return parsed;
    }
    return {
      coupleSpace: null,
      hasCompletedOnboarding: false,
    };
  });

  const [sessionDismissed, setSessionDismissed] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(BACKGROUND_COLOR_KEY, backgroundColor);
  }, [backgroundColor]);

  const { settings: siteSettings, loadSettings: loadSiteSettings } = useSiteSettings();

  const handleSettingsLoaded = useCallback((loadedSettings: Partial<{ backgroundColor: string; categories: Category[]; cards: Card[]; siteSettings: SiteSettings }>) => {
    if (loadedSettings.backgroundColor !== undefined) {
      setBackgroundColorState(loadedSettings.backgroundColor);
    }
    if (loadedSettings.categories) {
      setCategories(mergeCategories(loadedSettings.categories, initialCategories));
    }
    if (loadedSettings.cards) {
      setCards(mergeCards(loadedSettings.cards, initialCards));
    }
    if (loadedSettings.siteSettings) {
      loadSiteSettings(loadedSettings.siteSettings);
    }
  }, [loadSiteSettings]);

  const { saveStatus, lastSavedAt, saveError } = useSettingsSync(
    user?.id ?? null,
    { backgroundColor, categories, cards, siteSettings },
    handleSettingsLoaded
  );

  const { space: coupleSpaceDb, memberCount: coupleSpaceMemberCount, refreshSpace: refreshCoupleSpace, switchToNewSpace } = useCoupleSpaceContext();
  const [overrideCoupleSpaceId, setOverrideCoupleSpaceId] = useState<string | null>(null);
  const coupleSpaceId = overrideCoupleSpaceId ?? coupleSpaceDb?.id ?? null;

  useEffect(() => {
    if (coupleSpaceDb?.id && coupleSpaceDb.id === overrideCoupleSpaceId) {
      setOverrideCoupleSpaceId(null);
    }
  }, [coupleSpaceDb?.id, overrideCoupleSpaceId]);

  const [remoteCardChanged, setRemoteCardChanged] = useState(false);
  const lastRemoteCueCardId = useRef<string | null>(null);

  const handleRemoteProgressUpdate = useCallback((_data: unknown) => {
    // journeyState is fully removed. This callback is a no-op stub for useSharedProgress compatibility.
    setSessionDismissed(false);
  }, []);

  const dismissRemoteCardCue = useCallback(() => {
    setRemoteCardChanged(false);
  }, []);

  // DEPRECATED stub — no writes, no subscriptions. Return values are ignored.
  useSharedProgress(user?.id ?? null, coupleSpaceId, handleRemoteProgressUpdate);

  // DEPRECATED: shared journey meta no longer applied or synced.
  const hasAppliedSharedProgress = useRef(false);

  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color);
  };

  const updateCategory = (id: string, title: string, description: string) => {
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, title, description } : cat));
  };

  const updateCategoryColor = (id: string, color: string) => {
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, color } : cat));
  };

  const updateCategoryTextColor = (id: string, textColor: string) => {
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, textColor } : cat));
  };

  const updateCategoryBorderColor = (id: string, borderColor: string) => {
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, borderColor } : cat));
  };

  const updateCategoryIcon = (id: string, icon: string) => {
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, icon } : cat));
  };

  const addCard = (categoryId: string): string => {
    const newId = crypto.randomUUID();
    const newCard: Card = {
      id: newId,
      title: 'Ny underkategori',
      subtitle: 'Lägg till beskrivning...',
      categoryId,
      sections: [
        { id: `${newId}-opening`, type: 'opening', title: 'Början', content: 'Lägg till innehåll...', prompts: ['Lägg till fråga...'] },
        { id: `${newId}-reflective`, type: 'reflective', title: 'Fördjupning', content: 'Lägg till innehåll...', prompts: ['Lägg till fråga...'] },
        { id: `${newId}-scenario`, type: 'scenario', title: 'Scenario', content: 'Lägg till innehåll...', prompts: ['Lägg till fråga...'] },
        { id: `${newId}-exercise`, type: 'exercise', title: 'Tillsammans', content: 'Lägg till innehåll...', prompts: ['Lägg till uppgift...'] },
      ],
    };
    setCards((prev) => [...prev, newCard]);
    setCategories((prev) => prev.map((cat) => cat.id === categoryId ? { ...cat, cardCount: cat.cardCount + 1 } : cat));
    return newId;
  };

  const deleteCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setCategories((prev) => prev.map((cat) => cat.id === card.categoryId ? { ...cat, cardCount: Math.max(0, cat.cardCount - 1) } : cat));
  };

  const updateCard = (id: string, title: string, subtitle: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, title, subtitle } : card));
  };

  const updateCardDescription = (id: string, description: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, description } : card));
  };

  const updateCardColor = (id: string, color: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, color } : card));
  };

  const updateCardTextColor = (id: string, textColor: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, textColor } : card));
  };

  const updateCardBorderColor = (id: string, borderColor: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, borderColor } : card));
  };

  const updateCardEmptyState = (id: string, emptyStateTitle: string, emptyStateDescription: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, emptyStateTitle, emptyStateDescription } : card));
  };

  const updateCardSection = (cardId: string, sectionId: string, updates: Partial<{ title: string; content: string; prompts: any[]; color: string }>) => {
    setCards((prev) => prev.map((card) =>
      card.id === cardId
        ? { ...card, sections: card.sections.map((section) => section.id === sectionId ? { ...section, ...updates } : section) }
        : card
    ));
  };

  const getCardsByCategory = (categoryId: string): Card[] => cards.filter((card) => card.categoryId === categoryId);
  const getCardById = (cardId: string): Card | undefined => cards.find((card) => card.id === cardId);
  const getCategoryById = (categoryId: string): Category | undefined => categories.find((cat) => cat.id === categoryId);

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const initializeCoupleSpace = (partnerAName?: string, partnerBName?: string) => {
    const newSpace: CoupleSpace = {
      id: crypto.randomUUID(),
      mode: 'single',
      partnerAName,
      partnerBName,
      createdAt: new Date(),
      conversationThreads: [],
    };
    setState((prev) => ({ ...prev, coupleSpace: newSpace }));
  };

  const saveConversation = (cardId: string, sectionId: string, stepIndex?: number) => {
    if (!state.coupleSpace) return;
    const now = new Date();
    setState((prev) => {
      const space = prev.coupleSpace;
      if (!space) return prev;
      const existingThread = space.conversationThreads.find((t) => t.cardId === cardId);
      const updatedThreads = existingThread
        ? space.conversationThreads.map((t) =>
            t.cardId === cardId
              ? { ...t, lastSectionId: sectionId || t.lastSectionId, lastStepIndex: stepIndex ?? t.lastStepIndex, lastActivityAt: now }
              : t
          )
        : [
            ...space.conversationThreads,
            {
              id: crypto.randomUUID(),
              cardId,
              lastSectionId: sectionId,
              lastStepIndex: stepIndex ?? 0,
              savedAt: now,
              lastActivityAt: now,
              reflections: [],
            } as ConversationThread,
          ];
      return { ...prev, coupleSpace: { ...space, conversationThreads: updatedThreads } };
    });
  };

  const getConversationForCard = (cardId: string): ConversationThread | undefined => {
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
      const space = prev.coupleSpace;
      if (!space) return prev;
      const thread = space.conversationThreads.find((t) => t.cardId === reflection.cardId);
      if (!thread) return prev;
      const updatedThreads = space.conversationThreads.map((t) =>
        t.cardId === reflection.cardId
          ? { ...t, reflections: [...t.reflections, newReflection], lastActivityAt: now }
          : t
      );
      return { ...prev, coupleSpace: { ...space, conversationThreads: updatedThreads } };
    });
  };

  const getReflectionsForSection = (cardId: string, sectionId: string) => {
    const thread = state.coupleSpace?.conversationThreads.find((t) => t.cardId === cardId);
    return thread?.reflections.filter((r) => r.sectionId === sectionId) || [];
  };

  const mostRecentConversation = state.coupleSpace?.conversationThreads
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())[0] || null;

  // ---------------------------------------------------------------------------
  // Session management
  // All journeyState writes removed. Session progression is handled exclusively
  // by normalized RPCs (complete_couple_session_step) and useNormalizedSessionContext.
  // ---------------------------------------------------------------------------

  const startSession = (categoryId: string, cardId: string, { force = false }: { force?: boolean; fromBeginning?: boolean } = {}) => {
    if (devState) return;
    if (coupleSpaceMemberCount < 2 && !force) return;

    setState((prev) => {
      if (!force && prev.currentSession && !sessionDismissed) {
        if (prev.currentSession.cardId === cardId) return prev;
      }
      return {
        ...prev,
        currentSession: {
          categoryId,
          cardId,
          currentStepIndex: 0,
          startedAt: new Date(),
          lastActivityAt: new Date(),
        },
      };
    });
    setSessionDismissed(false);
  };

  const updateSessionStep = (stepIndex: number) => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      return { ...prev, currentSession: { ...prev.currentSession, currentStepIndex: stepIndex, lastActivityAt: new Date() } };
    });
  };

  const completeSessionStep = (stepIndex: number) => {
    if (coupleSpaceMemberCount < 2) return;
    // Authoritative completion via RPC complete_couple_session_step (called in CardView).
    // AppContext only advances local currentStepIndex for smooth UI transition.
    setState((prev) => {
      if (!prev.currentSession) return prev;
      return { ...prev, currentSession: { ...prev.currentSession, currentStepIndex: stepIndex + 1, lastActivityAt: new Date() } };
    });
  };

  const endSession = () => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      return { ...prev, currentSession: undefined };
    });
    setSessionDismissed(false);
  };

  // Thin wrapper kept for compatibility; no journeyState writes.
  const startSessionWithJourney = (categoryId: string, cardId: string, opts?: { force?: boolean; fromBeginning?: boolean }) => {
    startSession(categoryId, cardId, { force: opts?.force ?? false });
  };

  const dismissSession = () => setSessionDismissed(true);

  const pauseSession = () => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      return { ...prev, currentSession: undefined };
    });
  };

  const clearForPartnerLeave = useCallback(() => {
    setState((prev) => ({ ...prev, currentSession: undefined }));
    setSessionDismissed(false);
  }, []);

  const hasActiveSession = !sessionDismissed && !!state.currentSession;

  // ---------------------------------------------------------------------------
  // Category status helpers
  // Explored state must come from spaceSnapshot selectors (selectExploredCardIds).
  // These stubs remain for legacy callers; they fall back to conversationThreads.
  // ---------------------------------------------------------------------------

  const getCategoryStatus = useCallback((categoryId: string): 'not_started' | 'in_progress' | 'explored' => {
    const categoryCards = cards.filter((c) => c.categoryId === categoryId);
    if (categoryCards.length === 0) return 'not_started';
    const hasConversation = state.coupleSpace?.conversationThreads?.some((t) =>
      categoryCards.some((c) => c.id === t.cardId)
    );
    return hasConversation ? 'in_progress' : 'not_started';
  }, [cards, state.coupleSpace?.conversationThreads]);

  const getExploredCardsInCategory = useCallback((categoryId: string): number => {
    const categoryCards = cards.filter((c) => c.categoryId === categoryId);
    const threads = state.coupleSpace?.conversationThreads || [];
    return categoryCards.filter((c) => threads.some((t) => t.cardId === c.id)).length;
  }, [cards, state.coupleSpace?.conversationThreads]);

  // ---------------------------------------------------------------------------
  // Reflections (private/shared)
  // ---------------------------------------------------------------------------

  const getPrivateNote = useCallback((cardId: string): PrivateNote | undefined => {
    return state.reflectionsData?.private?.[cardId];
  }, [state.reflectionsData]);

  const getSharedNote = useCallback((cardId: string): SharedNote | undefined => {
    return state.reflectionsData?.shared?.[cardId];
  }, [state.reflectionsData]);

  const savePrivateNote = (cardId: string, text: string) => {
    setState((prev) => ({
      ...prev,
      reflectionsData: {
        ...prev.reflectionsData,
        private: { ...(prev.reflectionsData?.private || {}), [cardId]: { text, updatedAt: new Date().toISOString() } },
      },
    }));
  };

  const saveSharedNote = (cardId: string, text: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      reflectionsData: {
        ...prev.reflectionsData,
        shared: {
          ...(prev.reflectionsData?.shared || {}),
          [cardId]: { text, updatedAt: now, sharedAt: now },
        },
      },
    }));
  };

  const removeSharedNote = (cardId: string) => {
    setState((prev) => {
      const shared = { ...(prev.reflectionsData?.shared || {}) };
      delete shared[cardId];
      return { ...prev, reflectionsData: { ...prev.reflectionsData, shared } };
    });
  };

  const isHighlighted = useCallback((cardId: string): boolean => {
    return !!state.reflectionsData?.highlights?.[cardId];
  }, [state.reflectionsData]);

  const highlightCount = Object.keys(state.reflectionsData?.highlights || {}).length;

  const toggleHighlight = (cardId: string) => {
    setState((prev) => {
      const highlights = { ...(prev.reflectionsData?.highlights || {}) };
      if (highlights[cardId]) {
        delete highlights[cardId];
      } else {
        highlights[cardId] = true;
      }
      return { ...prev, reflectionsData: { ...prev.reflectionsData, highlights } };
    });
  };

  const getAllSharedNotes = useCallback((): Record<string, SharedNote> => {
    return state.reflectionsData?.shared || {};
  }, [state.reflectionsData]);

  const getHighlightedCards = useCallback((): string[] => {
    return Object.keys(state.reflectionsData?.highlights || {});
  }, [state.reflectionsData]);

  // ---------------------------------------------------------------------------
  // Takeaways
  // ---------------------------------------------------------------------------

  const takeaways = state.reflectionsData?.takeaways;

  const getTakeawayPrivate = useCallback((cardId: string): TakeawayNote | undefined => {
    return takeaways?.private?.[cardId];
  }, [takeaways]);

  const getTakeawayShared = useCallback((cardId: string): SharedTakeaway | undefined => {
    return takeaways?.shared?.[cardId];
  }, [takeaways]);

  const saveTakeawayPrivate = (cardId: string, text: string) => {
    setState((prev) => {
      const t = prev.reflectionsData?.takeaways || { private: {}, shared: {}, highlights: {} };
      return {
        ...prev,
        reflectionsData: {
          ...prev.reflectionsData,
          takeaways: { ...t, private: { ...t.private, [cardId]: { text, updatedAt: new Date().toISOString() } } },
        },
      };
    });
  };

  const saveTakeawayShared = (cardId: string, text: string) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const t = prev.reflectionsData?.takeaways || { private: {}, shared: {}, highlights: {} };
      return {
        ...prev,
        reflectionsData: {
          ...prev.reflectionsData,
          takeaways: { ...t, shared: { ...t.shared, [cardId]: { text, updatedAt: now, sharedAt: now } } },
        },
      };
    });
  };

  const removeTakeawayShared = (cardId: string) => {
    setState((prev) => {
      const t = prev.reflectionsData?.takeaways || { private: {}, shared: {}, highlights: {} };
      const shared = { ...t.shared };
      delete shared[cardId];
      return { ...prev, reflectionsData: { ...prev.reflectionsData, takeaways: { ...t, shared } } };
    });
  };

  const isTakeawayHighlighted = useCallback((cardId: string): boolean => {
    return !!takeaways?.highlights?.[cardId];
  }, [takeaways]);

  const takeawayHighlightCount = Object.keys(takeaways?.highlights || {}).length;

  const toggleTakeawayHighlight = (cardId: string) => {
    setState((prev) => {
      const t = prev.reflectionsData?.takeaways || { private: {}, shared: {}, highlights: {} };
      const highlights = { ...t.highlights };
      if (highlights[cardId]) {
        delete highlights[cardId];
      } else {
        highlights[cardId] = true;
      }
      return { ...prev, reflectionsData: { ...prev.reflectionsData, takeaways: { ...t, highlights } } };
    });
  };

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
        updateCategoryColor,
        updateCategoryTextColor,
        updateCategoryBorderColor,
        updateCategoryIcon,
        cards,
        addCard,
        deleteCard,
        updateCard,
        updateCardEmptyState,
        updateCardColor,
        updateCardTextColor,
        updateCardBorderColor,
        updateCardSection,
        updateCardDescription,
        getCardsByCategory,
        getCardById,
        getCategoryById,
        backgroundColor,
        setBackgroundColor,
        saveStatus,
        lastSavedAt,
        saveError,
        currentSession: devState
          ? { categoryId: DEV_MOCK.mockCategory.id, cardId: DEV_MOCK.mockCard.id, currentStepIndex: DEV_MOCK.mockSession.currentStepIndex, startedAt: new Date(DEV_MOCK.mockSession.startedAt), lastActivityAt: new Date() }
          : state.currentSession,
        startSession: startSessionWithJourney,
        updateSessionStep,
        completeSessionStep,
        endSession,
        hasActiveSession,
        dismissSession,
        pauseSession,
        getCategoryStatus,
        getExploredCardsInCategory,
        getPrivateNote,
        getSharedNote,
        savePrivateNote,
        saveSharedNote,
        removeSharedNote,
        isHighlighted,
        toggleHighlight,
        highlightCount,
        getAllSharedNotes,
        getHighlightedCards,
        getTakeawayPrivate,
        getTakeawayShared,
        saveTakeawayPrivate,
        saveTakeawayShared,
        removeTakeawayShared,
        isTakeawayHighlighted,
        toggleTakeawayHighlight,
        takeawayHighlightCount,
        refreshCoupleSpace,
        switchToNewSpace,
        setOverrideCoupleSpaceId,
        remoteCardChanged,
        dismissRemoteCardCue,
        clearForPartnerLeave,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
