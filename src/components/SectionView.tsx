import { forwardRef } from 'react';
import { Section, Card, Prompt } from '@/types';
import PromptItem from '@/components/PromptItem';
import BookmarkButton from '@/components/BookmarkButton';

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
  /** Session context for bookmarks */
  coupleSpaceId?: string | null;
  sessionId?: string | null;
  cardId?: string | null;
  stageIndex?: number;
  isLive?: boolean;
  isReflectionStep?: boolean;
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
  function SectionView({ section, promptIndex = 0, coupleSpaceId, sessionId, cardId, stageIndex, isLive, isReflectionStep }, ref) {
    // If section has no prompts but has content, treat content as the prompt
    const hasExplicitPrompts = !!(section.prompts && section.prompts.length > 0);
    const rawPrompts = hasExplicitPrompts
      ? section.prompts!
      : section.content
        ? [section.content]
        : [];
    const normalizedPrompts = rawPrompts.map(normalizePrompt);

    const prompt = normalizedPrompts[promptIndex] ?? normalizedPrompts[0];

    if (!prompt) return null;

    const showPreamble =
      hasExplicitPrompts &&
      (section.type === 'scenario' || section.type === 'exercise') &&
      promptIndex === 0;

    return (
      <div className="py-12 relative">
        {/* Bookmark button — top right, live sessions only */}
        {isLive && coupleSpaceId && sessionId && cardId && stageIndex !== undefined && (
          <div style={{ position: 'absolute', top: '12px', right: '0px', zIndex: 2 }}>
            <BookmarkButton
              coupleSpaceId={coupleSpaceId}
              sessionId={sessionId}
              cardId={cardId}
              stageIndex={stageIndex}
              promptIndex={promptIndex}
              questionText={prompt.text}
              isDarkBackground={isReflectionStep}
            />
          </div>
        )}

        <PromptItem
          key={`${section.id}-${promptIndex}`}
          prompt={prompt}
          promptId={`prompt-${promptIndex}`}
          index={promptIndex}
          sectionType={section.type as 'opening' | 'reflective' | 'scenario' | 'exercise'}
          preamble={showPreamble ? section.content : undefined}
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
