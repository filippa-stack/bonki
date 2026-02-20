import { forwardRef } from 'react';
import { Section, Card, Prompt } from '@/types';
import PromptItem from '@/components/PromptItem';

export interface SectionViewHandle {
  openNoteForCurrent: () => void;
}

interface SectionViewProps {
  section: Section;
  card: Card;
  isRevisitMode?: boolean;
  initialFocusNoteIndex?: number | null;
  focusPromptIndex?: number | null;
  disableShare?: boolean;
  /** Which prompt within the section to display (default: 0) */
  promptIndex?: number;
}

const normalizePrompt = (prompt: string | Prompt): Prompt => {
  if (typeof prompt === 'string') {
    return { text: prompt, color: undefined, textColor: undefined };
  }
  return prompt;
};

/**
 * Renders a single prompt for the current step.
 * One question per step — no stacking, no scroll.
 * CardView passes only the section matching current_step_index.
 */
const SectionView = forwardRef<SectionViewHandle, SectionViewProps>(
  function SectionView({ section, promptIndex = 0 }, ref) {
    // If section has no prompts but has content, treat content as the prompt
    // (this is the case for exercise/teamwork stages).
    const rawPrompts = section.prompts && section.prompts.length > 0
      ? section.prompts
      : section.content
        ? [section.content]
        : [];
    const normalizedPrompts = rawPrompts.map(normalizePrompt);

    // Display the specific prompt at promptIndex.
    // Falls back to index 0 if out of range.
    const prompt = normalizedPrompts[promptIndex] ?? normalizedPrompts[0];

    if (!prompt) return null;

    return (
      <div className="py-12">
        <PromptItem
          prompt={prompt}
          promptId={`prompt-${promptIndex}`}
          index={promptIndex}
          sectionType={section.type as 'opening' | 'reflective' | 'scenario' | 'exercise'}
          preamble={
            (section.type === 'scenario' || section.type === 'exercise') && promptIndex === 0
              ? section.content
              : undefined
          }
          highlightCount={0}
          privateNote={undefined}
          sharedNote={undefined}
          onPromptChange={() => {}}
          onPromptColorChange={() => {}}
          onPromptTextColorChange={() => {}}
          onRemovePrompt={() => {}}
          onSaveNote={() => {}}
          onShareNote={() => {}}
          onUnshareNote={() => {}}
          onToggleHighlight={() => {}}
        />
      </div>
    );
  }
);

export default SectionView;
