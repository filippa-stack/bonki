import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CoupleSpace, ConversationThread, Reflection, AppState, Category, Card, JourneyState, ReflectionsData, PrivateNote, SharedNote, TakeawayNote, SharedTakeaway } from '@/types';
import { categories as initialCategories, cards as initialCards, CONTENT_VERSION } from '@/data/content';
import { useSettingsSync, SaveStatus } from '@/hooks/useSettingsSync';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings, SiteSettings } from '@/contexts/SiteSettingsContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useSharedProgress, SharedSyncStatus } from '@/hooks/useSharedProgress';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import { DEV_MOCK } from '@/hooks/useDevState';

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

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
  // Journey state
  journeyState: JourneyState | undefined;
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
  sharedSyncStatus: SharedSyncStatus;
  sharedSyncError: string | null;
  retrySharedSync: () => void;
  /** True when a remote update changed the active cardId */
  remoteCardChanged: boolean;
  dismissRemoteCardCue: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'vi-som-foraldrar-state';
const CATEGORIES_STORAGE_KEY = 'vi-som-foraldrar-categories';
const CARDS_STORAGE_KEY = 'vi-som-foraldrar-cards';
const BACKGROUND_COLOR_KEY = 'vi-som-foraldrar-background';
const CONTENT_VERSION_KEY = 'vi-som-foraldrar-content-version';

/**
 * Merge new source categories/cards into cached data.
 * Preserves user customizations (colors, icons, etc.) for existing items,
 * adds any new items from the source.
 */
function mergeCategories(cached: Category[], source: Category[]): Category[] {
  const map = new Map(cached.map((c) => [c.id, c]));
  return source.map((s) => {
    const existing = map.get(s.id);
    if (existing) {
      // Keep user customizations, update structural content
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

  // Persist content version after merge
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
      // Convert session dates
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

  // Get site settings from context
  const { settings: siteSettings, loadSettings: loadSiteSettings } = useSiteSettings();

  // Sync settings with database
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

  // Couple space for shared progress
  const { space: coupleSpaceDb, memberCount: coupleSpaceMemberCount, refreshSpace: refreshCoupleSpace, switchToNewSpace } = useCoupleSpace();
  const [overrideCoupleSpaceId, setOverrideCoupleSpaceId] = useState<string | null>(null);
  const coupleSpaceId = overrideCoupleSpaceId ?? coupleSpaceDb?.id ?? null;

  // Clear override once useCoupleSpace catches up
  useEffect(() => {
    if (coupleSpaceDb?.id && coupleSpaceDb.id === overrideCoupleSpaceId) {
      setOverrideCoupleSpaceId(null);
    }
  }, [coupleSpaceDb?.id, overrideCoupleSpaceId]);

  // Handle remote progress updates from partner
  const [remoteCardChanged, setRemoteCardChanged] = useState(false);
  const lastRemoteCueCardId = useRef<string | null>(null);

  const handleRemoteProgressUpdate = useCallback((data: { currentSession: AppState['currentSession'] | null; journeyState: JourneyState | null }) => {
    setState((prev) => {
      const prevCardId = prev.currentSession?.cardId ?? null;
      const newCardId = data.currentSession?.cardId ?? null;

      // Trigger cue only when cardId actually changes to a different card, and not the same one we already cued
      if (newCardId && prevCardId !== newCardId && lastRemoteCueCardId.current !== newCardId) {
        lastRemoteCueCardId.current = newCardId;
        // Use setTimeout to avoid setState-during-render
        setTimeout(() => setRemoteCardChanged(true), 0);
      }

      // When a server session arrives, check if we have locally completed steps
      // that the server doesn't know about yet — retry them
      const serverSession = data.currentSession as any;
      if (serverSession?.userCompletions && serverSession.cardId && user?.id) {
        const uid = user.id;
        const serverCompleted: number[] = serverSession.userCompletions[uid] || [];
        const localCardProgress = prev.journeyState?.sessionProgress?.[serverSession.cardId];
        const localCompleted: number[] = localCardProgress?.perUser?.[uid]?.completedSteps || [];
        const missing = localCompleted.filter(s => !serverCompleted.includes(s));
        if (missing.length > 0 && !devState) {
          const stepToRetry = Math.min(...missing);
          if (stepToRetry === serverSession.currentStepIndex) {
            setTimeout(() => {
              supabase.functions
                .invoke('update-step-completion', {
                  body: { card_id: serverSession.cardId, step_index: stepToRetry },
                })
                .then((res) => {
                  if (res.error) {
                    console.error('[retry] Step completion failed:', res.error);
                  }
                });
            }, 500);
          }
        }
      }

      return {
        ...prev,
        currentSession: data.currentSession ?? undefined,
        journeyState: data.journeyState ?? undefined,
      };
    });
    setSessionDismissed(false);
  }, [user?.id, devState]);

  const dismissRemoteCardCue = useCallback(() => {
    setRemoteCardChanged(false);
  }, []);

  const { initialData: sharedProgressInitial, syncToRemote, ready: sharedProgressReady, syncStatus: sharedSyncStatus, lastSyncError: sharedSyncError, retrySync: retrySharedSync } = useSharedProgress(
    user?.id ?? null,
    coupleSpaceId,
    handleRemoteProgressUpdate,
  );

  // Apply initial shared progress once
  const hasAppliedSharedProgress = useRef(false);
  useEffect(() => {
    if (devState) return; // Don't apply shared progress in dev mode
    if (!sharedProgressReady || hasAppliedSharedProgress.current || !sharedProgressInitial) return;
    hasAppliedSharedProgress.current = true;
    setState((prev) => ({
      ...prev,
      currentSession: sharedProgressInitial.currentSession ?? prev.currentSession,
      journeyState: sharedProgressInitial.journeyState ?? prev.journeyState,
    }));
  }, [sharedProgressReady, sharedProgressInitial, devState]);

  // Sync journey state changes to remote (current_session is managed by edge functions)
  useEffect(() => {
    if (!sharedProgressReady || !hasAppliedSharedProgress.current || devState) return;
    syncToRemote(undefined, state.journeyState);
  }, [state.journeyState, sharedProgressReady, syncToRemote, devState]);

  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color);
  };

  const updateCategory = (id: string, title: string, description: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, title, description } : cat
      )
    );
  };

  const updateCategoryColor = (id: string, color: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, color } : cat
      )
    );
  };

  const updateCategoryTextColor = (id: string, textColor: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, textColor } : cat
      )
    );
  };

  const updateCategoryBorderColor = (id: string, borderColor: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, borderColor } : cat
      )
    );
  };

  const updateCategoryIcon = (id: string, icon: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, icon } : cat
      )
    );
  };

  const addCard = (categoryId: string): string => {
    const newId = crypto.randomUUID();
    const newCard: Card = {
      id: newId,
      title: 'Ny underkategori',
      subtitle: 'Lägg till beskrivning...',
      categoryId,
      sections: [
        {
          id: `${newId}-opening`,
          type: 'opening',
          title: 'Början',
          content: 'Lägg till innehåll...',
          prompts: ['Lägg till fråga...'],
        },
        {
          id: `${newId}-reflective`,
          type: 'reflective',
          title: 'Fördjupning',
          content: 'Lägg till innehåll...',
          prompts: ['Lägg till fråga...'],
        },
        {
          id: `${newId}-scenario`,
          type: 'scenario',
          title: 'Scenario',
          content: 'Lägg till innehåll...',
          prompts: ['Lägg till fråga...'],
        },
        {
          id: `${newId}-exercise`,
          type: 'exercise',
          title: 'Tillsammans',
          content: 'Lägg till innehåll...',
          prompts: ['Lägg till uppgift...'],
        },
      ],
    };
    setCards((prev) => [...prev, newCard]);
    
    // Update category card count
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, cardCount: cat.cardCount + 1 } : cat
      )
    );
    
    return newId;
  };

  const deleteCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    
    // Remove the card
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    
    // Update category card count
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === card.categoryId ? { ...cat, cardCount: Math.max(0, cat.cardCount - 1) } : cat
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

  const updateCardDescription = (id: string, description: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, description } : card
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

  const updateCardTextColor = (id: string, textColor: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, textColor } : card
      )
    );
  };

  const updateCardBorderColor = (id: string, borderColor: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, borderColor } : card
      )
    );
  };

  const updateCardEmptyState = (id: string, emptyStateTitle: string, emptyStateDescription: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, emptyStateTitle, emptyStateDescription } : card
      )
    );
  };

  const updateCardSection = (cardId: string, sectionId: string, updates: Partial<{ title: string; content: string; prompts: any[]; color: string }>) => {
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

  const saveConversation = (cardId: string, sectionId: string, stepIndex?: number) => {
    if (!state.coupleSpace) return;

    const existingIndex = state.coupleSpace.conversationThreads.findIndex(
      (t) => t.cardId === cardId
    );

    const now = new Date();
    const existing = existingIndex >= 0 ? state.coupleSpace.conversationThreads[existingIndex] : undefined;
    const cardReflections = existing?.reflections || [];

    const thread: ConversationThread = {
      id: existing?.id || crypto.randomUUID(),
      cardId,
      lastSectionId: sectionId,
      lastStepIndex: stepIndex ?? existing?.lastStepIndex ?? 0,
      reflections: cardReflections,
      savedAt: existing?.savedAt || now,
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
          lastStepIndex: 0,
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


  // Authoritative completion lives in journeyState.sessionProgress[cardId].perUser[uid].completedSteps.
  const startSession = (categoryId: string, cardId: string, { force = false, fromBeginning = false }: { force?: boolean; fromBeginning?: boolean } = {}) => {
    // DevState gate: mock session already provided, no DB writes
    if (devState) return;
    // Solo gate: no shared sessions when unpaired
    if (coupleSpaceMemberCount < 2) return;
    const now = new Date();

    setState((prev) => {
      // If we already have an active session for this exact card, just touch lastActivityAt
      if (prev.currentSession?.cardId === cardId) {
        return {
          ...prev,
          currentSession: { ...prev.currentSession, lastActivityAt: now },
        };
      }

      // If there's an active session for a DIFFERENT card, only allow override via explicit action
      if (prev.currentSession && prev.currentSession.cardId !== cardId && !force) {
        return prev;
      }

      // Determine starting step from journeyState.sessionProgress (authoritative)
      const cardProgress = prev.journeyState?.sessionProgress?.[cardId];
      const perUser = cardProgress?.perUser || {};
      const requiredCount = coupleSpaceMemberCount >= 2 ? 2 : 1;

      // Find the first step that is NOT mutually completed (count-based)
      let startStep = 0;
      if (!fromBeginning) {
        for (let i = 0; i < STEP_ORDER.length; i++) {
          const completedBy = Object.values(perUser).filter(u => u?.completedSteps?.includes(i)).length;
          const mutuallyDone = completedBy >= requiredCount;
          if (!mutuallyDone) {
            startStep = i;
            break;
          }
          // If all steps are mutually done, startStep stays beyond last
          if (i === STEP_ORDER.length - 1) {
            startStep = STEP_ORDER.length; // signals full completion
          }
        }
      }

      // If all steps mutually completed, do NOT create a session
      if (startStep >= STEP_ORDER.length) {
        return prev;
      }

      return {
        ...prev,
        currentSession: {
          categoryId,
          cardId,
          currentStepIndex: startStep,
          startedAt: now,
          lastActivityAt: now,
        },
      };
    });
    setSessionDismissed(false);
  };

  const updateSessionStep = (stepIndex: number) => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      // Guard: never move shared step backward or skip ahead
      const currentShared = prev.currentSession.currentStepIndex;
      if (stepIndex !== currentShared + 1) return prev; // only allow exactly +1
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          currentStepIndex: stepIndex,
          lastActivityAt: new Date(),
        },
      };
    });
  };

  const completeSessionStep = (stepIndex: number) => {
    // Solo gate: no step completions when unpaired
    if (coupleSpaceMemberCount < 2) return;
    const uid = user?.id || 'local';

    // Optimistic local update: mark step as completed for this user
    setState((prev) => {
      if (!prev.currentSession) return prev;
      const cardId = prev.currentSession.cardId;

      const journey = prev.journeyState || {
        currentCategoryId: null,
        lastOpenedCardId: null,
        lastCompletedCardId: null,
        suggestedNextCardId: null,
        pausedAt: null,
        updatedAt: new Date().toISOString(),
        exploredCardIds: [],
        sessionProgress: {},
      };

      const progress = journey.sessionProgress || {};
      const cardProgress = progress[cardId] || { perUser: {} };
      const myCompleted = cardProgress.perUser[uid]?.completedSteps || [];
      if (myCompleted.includes(stepIndex)) return prev;

      const updatedMyCompleted = [...myCompleted, stepIndex];
      const updatedCardProgress = {
        ...cardProgress,
        perUser: {
          ...cardProgress.perUser,
          [uid]: { completedSteps: updatedMyCompleted },
        },
      };
      const updatedProgress = { ...progress, [cardId]: updatedCardProgress };

      return {
        ...prev,
        journeyState: {
          ...journey,
          sessionProgress: updatedProgress,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    // Call edge function for authoritative server-side update
    // Only call if the server session exists (indicated by userCompletions from server)
    const cardId = state.currentSession?.cardId;
    const hasServerSession = !!(state.currentSession as any)?.userCompletions;
    if (cardId && uid !== 'local' && hasServerSession && !devState) {
      supabase.functions
        .invoke('update-step-completion', {
          body: { card_id: cardId, step_index: stepIndex },
        })
        .then((res) => {
          if (res.error) {
            console.error('Step completion failed:', res.error);
            return;
          }
          const data = res.data as any;
          if (data?.success) {
            // Apply server-authoritative state
            setState((prev) => {
              const serverSession = data.session
                ? {
                    ...data.session,
                    startedAt: new Date(data.session.startedAt),
                    lastActivityAt: new Date(data.session.lastActivityAt),
                  }
                : undefined;
              const serverJourney = data.journey_state as JourneyState | null;

              return {
                ...prev,
                currentSession: serverSession,
                journeyState: serverJourney ?? prev.journeyState,
              };
            });
          }
        });
    } else if (cardId && uid !== 'local' && !hasServerSession) {
      console.warn('[completeSessionStep] Skipped edge call: no server session yet for card', cardId);
    }
  };

  const endSession = () => {
    setState((prev) => {
      const session = prev.currentSession;
      if (!session) return { ...prev, currentSession: undefined };

      const currentJourney = prev.journeyState || {
        currentCategoryId: null,
        lastOpenedCardId: null,
        lastCompletedCardId: null,
        suggestedNextCardId: null,
        pausedAt: null,
        updatedAt: new Date().toISOString(),
        exploredCardIds: [],
        sessionProgress: {},
      };

      // Check per-user completion from sessionProgress (count-based)
      const allStepIndices = STEP_ORDER.map((_, i) => i);
      const cardProgress = currentJourney.sessionProgress?.[session.cardId];
      const perUser = cardProgress?.perUser || {};
      const requiredCount = coupleSpaceMemberCount >= 2 ? 2 : 1;

      const isFullyCompleted = allStepIndices.every((step) => {
        const completedBy = Object.values(perUser).filter(
          u => u?.completedSteps?.includes(step)
        ).length;
        return completedBy >= requiredCount;
      });

      // If not fully completed by all required users, just clear session without marking explored
      if (!isFullyCompleted) {
        return {
          ...prev,
          currentSession: undefined,
        };
      }

      const exploredCardIds = !currentJourney.exploredCardIds.includes(session.cardId)
        ? [...currentJourney.exploredCardIds, session.cardId]
        : currentJourney.exploredCardIds;

      // Compute suggested next card
      const categoryCards = cards.filter(c => c.categoryId === session.categoryId);
      const currentIndex = categoryCards.findIndex(c => c.id === session.cardId);
      let suggestedNextCardId: string | null = null;

      for (let i = 1; i <= categoryCards.length; i++) {
        const nextCard = categoryCards[(currentIndex + i) % categoryCards.length];
        if (!exploredCardIds.includes(nextCard.id)) {
          suggestedNextCardId = nextCard.id;
          break;
        }
      }

      if (!suggestedNextCardId) {
        const catIndex = categories.findIndex(c => c.id === session.categoryId);
        for (let ci = 1; ci <= categories.length; ci++) {
          const nextCat = categories[(catIndex + ci) % categories.length];
          const nextCatCards = cards.filter(c => c.categoryId === nextCat.id);
          const unexplored = nextCatCards.find(c => !exploredCardIds.includes(c.id));
          if (unexplored) {
            suggestedNextCardId = unexplored.id;
            break;
          }
        }
      }

      return {
        ...prev,
        currentSession: undefined,
        journeyState: {
          ...currentJourney,
          lastCompletedCardId: session.cardId,
          suggestedNextCardId,
          exploredCardIds,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    setSessionDismissed(false);
  };

  // Update journey state when starting a session
  const startSessionWithJourney = (categoryId: string, cardId: string, opts?: { force?: boolean; fromBeginning?: boolean }) => {
    startSession(categoryId, cardId, { force: opts?.force ?? false, fromBeginning: opts?.fromBeginning ?? false });
    setState((prev) => {
      const now = new Date().toISOString();
      const uid = user?.id || 'local';
      const prevJourney = prev.journeyState || {
        currentCategoryId: null,
        lastOpenedCardId: null,
        lastCompletedCardId: null,
        suggestedNextCardId: null,
        pausedAt: null,
        updatedAt: now,
        exploredCardIds: [],
      };
      // Track last 2 initiators
      const prevInitiators = prevJourney.lastInitiators || [];
      const updatedInitiators = [...prevInitiators, uid].slice(-2);
      return {
        ...prev,
        journeyState: {
          ...prevJourney,
          currentCategoryId: categoryId,
          lastOpenedCardId: cardId,
          updatedAt: now,
          cardVisitDates: {
            ...(prevJourney.cardVisitDates || {}),
            [cardId]: now,
          },
          lastInitiators: updatedInitiators,
        },
      };
    });
  };

  const dismissSession = () => {
    setSessionDismissed(true);
  };

  const pauseSession = () => {
    setState((prev) => {
      const session = prev.currentSession;
      if (!session) return prev;

      const currentJourney = prev.journeyState || {
        currentCategoryId: null,
        lastOpenedCardId: null,
        lastCompletedCardId: null,
        suggestedNextCardId: null,
        pausedAt: null,
        updatedAt: new Date().toISOString(),
        exploredCardIds: [],
      };

      return {
        ...prev,
        currentSession: undefined,
        journeyState: {
          ...currentJourney,
          pausedAt: new Date().toISOString(),
          lastOpenedCardId: session.cardId,
          currentCategoryId: session.categoryId,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    setSessionDismissed(false);
  };

  const hasActiveSession = !sessionDismissed && !!state.currentSession;


  // Category status helpers
  const getCategoryStatus = useCallback((categoryId: string): 'not_started' | 'in_progress' | 'explored' => {
    const categoryCards = cards.filter(c => c.categoryId === categoryId);
    if (categoryCards.length === 0) return 'not_started';

    const explored = state.journeyState?.exploredCardIds || [];
    const exploredInCategory = categoryCards.filter(c => explored.includes(c.id)).length;

    if (exploredInCategory === 0) {
      // Check if any conversation exists for cards in this category
      const hasAnyActivity = categoryCards.some(c =>
        state.coupleSpace?.conversationThreads.some(t => t.cardId === c.id)
      );
      return hasAnyActivity ? 'in_progress' : 'not_started';
    }
    if (exploredInCategory >= categoryCards.length) return 'explored';
    return 'in_progress';
  }, [cards, state.journeyState?.exploredCardIds, state.coupleSpace?.conversationThreads]);

  const getExploredCardsInCategory = useCallback((categoryId: string): number => {
    const categoryCards = cards.filter(c => c.categoryId === categoryId);
    const explored = state.journeyState?.exploredCardIds || [];
    return categoryCards.filter(c => explored.includes(c.id)).length;
  }, [cards, state.journeyState?.exploredCardIds]);

  // Reflections helpers
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
        private: { ...(prev.reflectionsData?.private || {}), [cardId]: { text, updatedAt: new Date().toISOString() } },
        shared: prev.reflectionsData?.shared || {},
        highlights: prev.reflectionsData?.highlights || {},
      },
    }));
  };

  const saveSharedNote = (cardId: string, text: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      reflectionsData: {
        private: prev.reflectionsData?.private || {},
        shared: { ...(prev.reflectionsData?.shared || {}), [cardId]: { text, updatedAt: now, sharedAt: now } },
        highlights: prev.reflectionsData?.highlights || {},
      },
    }));
  };

  const removeSharedNote = (cardId: string) => {
    setState((prev) => {
      const shared = { ...(prev.reflectionsData?.shared || {}) };
      delete shared[cardId];
      const highlights = { ...(prev.reflectionsData?.highlights || {}) };
      delete highlights[cardId];
      return {
        ...prev,
        reflectionsData: {
          private: prev.reflectionsData?.private || {},
          shared,
          highlights,
        },
      };
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
        if (Object.keys(highlights).length >= 3) return prev;
        highlights[cardId] = true;
      }
      return {
        ...prev,
        reflectionsData: {
          private: prev.reflectionsData?.private || {},
          shared: prev.reflectionsData?.shared || {},
          highlights,
        },
      };
    });
  };

  const getAllSharedNotes = useCallback((): Record<string, SharedNote> => {
    return state.reflectionsData?.shared || {};
  }, [state.reflectionsData]);

  const getHighlightedCards = useCallback((): string[] => {
    return Object.keys(state.reflectionsData?.highlights || {});
  }, [state.reflectionsData]);

  // ─── Takeaways ───
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
          ...prev.reflectionsData!,
          private: prev.reflectionsData?.private || {},
          shared: prev.reflectionsData?.shared || {},
          highlights: prev.reflectionsData?.highlights || {},
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
          ...prev.reflectionsData!,
          private: prev.reflectionsData?.private || {},
          shared: prev.reflectionsData?.shared || {},
          highlights: prev.reflectionsData?.highlights || {},
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
      const highlights = { ...t.highlights };
      delete highlights[cardId];
      return {
        ...prev,
        reflectionsData: {
          ...prev.reflectionsData!,
          private: prev.reflectionsData?.private || {},
          shared: prev.reflectionsData?.shared || {},
          highlights: prev.reflectionsData?.highlights || {},
          takeaways: { ...t, shared, highlights },
        },
      };
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
        if (Object.keys(highlights).length >= 3) return prev;
        highlights[cardId] = true;
      }
      return {
        ...prev,
        reflectionsData: {
          ...prev.reflectionsData!,
          private: prev.reflectionsData?.private || {},
          shared: prev.reflectionsData?.shared || {},
          highlights: prev.reflectionsData?.highlights || {},
          takeaways: { ...t, highlights },
        },
      };
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
        updateCardDescription,
        updateCardEmptyState,
        updateCardColor,
        updateCardTextColor,
        updateCardBorderColor,
        updateCardSection,
        getCardsByCategory,
        getCardById,
        getCategoryById,
        backgroundColor,
        setBackgroundColor,
        saveStatus,
        lastSavedAt,
        saveError,
        currentSession: (devState === 'pairedActive' || devState === 'waiting' || devState === 'completed')
          ? { categoryId: DEV_MOCK.mockCategory.id, cardId: DEV_MOCK.mockCard.id, currentStepIndex: DEV_MOCK.mockSession.currentStepIndex, startedAt: new Date(DEV_MOCK.mockSession.startedAt), lastActivityAt: new Date() }
          : state.currentSession,
        startSession: startSessionWithJourney,
        updateSessionStep,
        completeSessionStep,
        endSession,
        hasActiveSession,
        dismissSession,
        pauseSession,
        journeyState: state.journeyState,
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
        switchToNewSpace: async () => {
          const result = await switchToNewSpace();
          if (result.ok && result.spaceId) {
            // Clear session & journey state for fresh home
            setState((prev) => ({
              ...prev,
              currentSession: undefined,
              journeyState: undefined,
            }));
            setSessionDismissed(false);
            // Override space ID immediately so queries use the new space
            setOverrideCoupleSpaceId(result.spaceId);
            // Allow shared progress to re-apply from the new space
            hasAppliedSharedProgress.current = false;
          }
          return result;
        },
        setOverrideCoupleSpaceId,
        sharedSyncStatus,
        sharedSyncError,
        retrySharedSync,
        remoteCardChanged,
        dismissRemoteCardCue,
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
