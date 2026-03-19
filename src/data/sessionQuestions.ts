/**
 * Still Us v3.0 — Session question lookup.
 * Extracts Öppna, Vänd, Tänk om, and Gör content from content.ts
 * for use in SessionOneLive and SessionTwoLive.
 */

import { cards } from '@/data/content';
import type { Prompt } from '@/types';

export interface SessionQ {
  text: string;
  anchor?: string;
}

export interface SessionContent {
  oppna: SessionQ[];
  vand1: SessionQ;
  vand2: SessionQ | null;
  tankOm: { scenario: string; question: string } | null;
  gor: { content: string; prompt?: string } | null;
}

function promptText(p: string | Prompt): string {
  return typeof p === 'string' ? p : p.text;
}

export function getSessionContent(cardIndex: number): SessionContent | null {
  const card = cards[cardIndex];
  if (!card) return null;

  const opening = card.sections.find(s => s.type === 'opening');
  const reflective = card.sections.find(s => s.type === 'reflective');
  const scenario = card.sections.find(s => s.type === 'scenario');
  const exercise = card.sections.find(s => s.type === 'exercise');

  const oppna: SessionQ[] = (opening?.prompts ?? []).slice(0, 2).map((p, i) => ({
    text: promptText(p),
    anchor: opening?.anchors?.find(a => a.promptIndex === i)?.text,
  }));

  const vandPrompts = reflective?.prompts ?? [];
  const vand1: SessionQ = {
    text: vandPrompts[0] ? promptText(vandPrompts[0]) : 'Vad var det viktigaste ni pratade om?',
    anchor: reflective?.anchors?.find(a => a.promptIndex === 0)?.text,
  };

  const vand2: SessionQ | null = vandPrompts[1]
    ? { text: promptText(vandPrompts[1]), anchor: reflective?.anchors?.find(a => a.promptIndex === 1)?.text }
    : null;

  const tankOm = scenario
    ? { scenario: scenario.content ?? '', question: scenario.prompts?.[0] ? promptText(scenario.prompts[0]) : '' }
    : null;

  const gor = exercise
    ? { content: exercise.content ?? '', prompt: exercise.prompts?.[0] ? promptText(exercise.prompts[0]) : undefined }
    : null;

  return { oppna, vand1, vand2, tankOm, gor };
}
