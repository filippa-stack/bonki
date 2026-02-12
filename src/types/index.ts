export interface Prompt {
  text: string;
  color?: string;
  textColor?: string;
}

export interface Section {
  id: string;
  type: 'opening' | 'reflective' | 'scenario' | 'exercise';
  title: string;
  content: string;
  prompts?: (string | Prompt)[];
  color?: string;
  textColor?: string;
}

export interface Card {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  categoryId: string;
  sections: Section[];
  color?: string;
  textColor?: string;
  borderColor?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export interface Category {
  id: string;
  title: string;
  entryLine?: string;
  description: string;
  cardCount: number;
  icon?: string;
  color?: string;
  textColor?: string;
  borderColor?: string;
}

export interface Reflection {
  id: string;
  cardId: string;
  sectionId: string;
  content: string;
  author?: 'A' | 'B';
  authorName?: string;
  visibility: 'private' | 'shared';
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationThread {
  id: string;
  cardId: string;
  lastSectionId: string;
  lastStepIndex: number;
  completedSteps: number[];
  reflections: Reflection[];
  savedAt: Date;
  lastActivityAt: Date;
}

export interface CoupleSpace {
  id: string;
  name?: string;
  mode: 'single' | 'dual';
  partnerAName?: string;
  partnerBName?: string;
  conversationThreads: ConversationThread[];
  createdAt: Date;
}

export interface TopicProposal {
  cardId: string;
  categoryId: string;
  proposedByUserId: string;
  proposedAt: string;
}

export interface JourneyState {
  currentCategoryId: string | null;
  lastOpenedCardId: string | null;
  lastCompletedCardId: string | null;
  suggestedNextCardId: string | null;
  pausedAt: string | null;
  updatedAt: string;
  /** Set of card IDs that have been fully explored (all 4 steps completed) */
  exploredCardIds: string[];
  /** Pending topic proposal from a partner */
  topicProposal?: TopicProposal | null;
  /** Per-user step completion keyed by cardId → userId → completedSteps */
  sessionProgress?: Record<string, {
    perUser: Record<string, { completedSteps: number[] }>;
  }>;
}

export interface PrivateNote {
  text: string;
  updatedAt: string;
}

export interface SharedNote {
  text: string;
  updatedAt: string;
  sharedAt: string;
}

export interface TakeawayNote {
  text: string;
  updatedAt: string;
}

export interface SharedTakeaway {
  text: string;
  updatedAt: string;
  sharedAt: string;
}

export interface TakeawaysData {
  private: Record<string, TakeawayNote>;
  shared: Record<string, SharedTakeaway>;
  highlights: Record<string, boolean>;
}

export interface ReflectionsData {
  private: Record<string, PrivateNote>;
  shared: Record<string, SharedNote>;
  highlights: Record<string, boolean>; // max 3
  takeaways?: TakeawaysData;
}

export interface AppState {
  coupleSpace: CoupleSpace | null;
  hasCompletedOnboarding: boolean;
  currentCardId?: string;
  currentSectionId?: string;
  journeyState?: JourneyState;
  reflectionsData?: ReflectionsData;
  // Session tracking for guided flow
  currentSession?: {
    categoryId: string;
    cardId: string;
    currentStepIndex: number; // 0-3 for opening, reflective, scenario, exercise
    completedSteps: number[]; // indices of completed steps (mutually confirmed)
    /** Per-user step completions: { [userId]: number[] } */
    userCompletions?: Record<string, number[]>;
    startedAt: Date;
    lastActivityAt: Date;
  };
}
