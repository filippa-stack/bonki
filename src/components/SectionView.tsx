import { forwardRef } from 'react';
import { motion } from 'framer-motion';
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
  function SectionView({ section }, ref) {
    const normalizedPrompts = (section.prompts || []).map(normalizePrompt);

    // One prompt per step: always show the first prompt in the section.
    // Preamble (scenario/exercise context) is shown above if present.
    const prompt = normalizedPrompts[0];

    if (!prompt) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="py-12"
      >
        <PromptItem
          prompt={prompt}
          promptId="prompt-0"
          index={0}
          sectionType={section.type as 'opening' | 'reflective' | 'scenario' | 'exercise'}
          preamble={
            (section.type === 'scenario' || section.type === 'exercise')
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
      </motion.div>
    );
  }
);

export default SectionView;
