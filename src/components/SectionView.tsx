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
 * Renders all prompts for the current step — flat, no accordion, no expand state.
 * CardView is responsible for passing only the section that matches current_step_index.
 */
const SectionView = forwardRef<SectionViewHandle, SectionViewProps>(
  function SectionView({ section, card }, ref) {
    const normalizedPrompts = (section.prompts || []).map(normalizePrompt);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="py-12"
      >
        {normalizedPrompts.length > 0 && (
          <div className="space-y-8 mb-12">
            {normalizedPrompts.map((prompt, index) => (
              <PromptItem
                key={index}
                prompt={prompt}
                promptId={`prompt-${index}`}
                index={index}
                sectionType={section.type as 'opening' | 'reflective' | 'scenario' | 'exercise'}
                preamble={
                  index === 0 &&
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
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

export default SectionView;
