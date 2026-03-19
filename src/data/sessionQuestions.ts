/**
 * Still Us v3.0 — Session question lookup.
 * Extracts Öppna, Vänd, Tänk om, and Gör content from content.ts
 * for use in SessionOneLive and SessionTwoLive.
 */

import { cards } from '@/data/content';

export interface SessionQuestion {
  text: string;
  anchor?: string;
}

export interface SessionContent {
  /** Session 1: Öppna questions (typically 2-3) */
  oppna: SessionQuestion[];
  /** Session 1: Vänd question 1 */
  vand1: SessionQuestion;
  /** Session 2: Vänd question 2 (may not exist for all cards) */
  vand2: SessionQuestion | null;
  /** Session 2: Tänk om scenario + question */
  tankOm: { scenario: string; question: string } | null;
  /** Gör exercise content + prompt */
  gor: { content: string; prompt?: string } | null;
}

/**
 * Get session content for a given card index (0-based).
 * Returns null if the card doesn't exist in content.ts.
 */
export function getSessionContent(cardIndex: number): SessionContent | null {
  const card = cards[cardIndex];
  if (!card) return null;

  const opening = card.sections.find(s => s.type === 'opening');
  const reflective = card.sections.find(s => s.type === 'reflective');
  const scenario = card.sections.find(s => s.type === 'scenario');
  const exercise = card.sections.find(s => s.type === 'exercise');

  // Öppna: first 2 prompts from opening section
  const oppna: SessionQuestion[] = (opening?.prompts ?? []).slice(0, 2).map((text, i) => ({
    text,
    anchor: opening?.anchors?.find(a => a.promptIndex === i)?.text,
  }));

  // Vänd 1: first prompt from reflective section
  const vandPrompts = reflective?.prompts ?? [];
  const vand1: SessionQuestion = {
    text: vandPrompts[0] ?? 'Vad var det viktigaste ni pratade om?',
    anchor: reflective?.anchors?.find(a => a.promptIndex === 0)?.text,
  };

  // Vänd 2: second prompt from reflective section (Session 2)
  const vand2: SessionQuestion | null = vandPrompts[1]
    ? {
        text: vandPrompts[1],
        anchor: reflective?.anchors?.find(a => a.promptIndex === 1)?.text,
      }
    : null;

  // Tänk om: scenario content + first prompt
  const tankOm = scenario
    ? {
        scenario: scenario.content ?? '',
        question: scenario.prompts?.[0] ?? '',
      }
    : null;

  // Gör: exercise content + first prompt
  const gor = exercise
    ? {
        content: exercise.content ?? '',
        prompt: exercise.prompts?.[0],
      }
    : null;

  return { oppna, vand1, vand2, tankOm, gor };
}
