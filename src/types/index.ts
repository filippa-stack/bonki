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
  categoryId: string;
  sections: Section[];
  color?: string;
  textColor?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  icon?: string;
  color?: string;
  textColor?: string;
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

export interface AppState {
  coupleSpace: CoupleSpace | null;
  hasCompletedOnboarding: boolean;
  currentCardId?: string;
  currentSectionId?: string;
}
