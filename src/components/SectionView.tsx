import { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { Section, Card, Prompt } from '@/types';
import { useApp } from '@/contexts/AppContext';
import PromptItem from '@/components/PromptItem';
import { usePromptNotes } from '@/hooks/usePromptNotes';

export interface SectionViewHandle {
  /** Open/focus the note UI for the currently relevant prompt */
  openNoteForCurrent: () => void;
}

interface SectionViewProps {
  section: Section;
  card: Card;
  isRevisitMode?: boolean;
  initialFocusNoteIndex?: number | null;
  focusPromptIndex?: number | null;
}

const normalizePrompt = (prompt: string | Prompt): Prompt => {
  if (typeof prompt === 'string') {
    return { text: prompt, color: undefined, textColor: undefined };
  }
  return prompt;
};

const ACCORDION_TYPES = ['opening', 'reflective'];

const SectionView = forwardRef<SectionViewHandle, SectionViewProps>(function SectionView({ section, card, isRevisitMode, initialFocusNoteIndex, focusPromptIndex }, ref) {
  const { updateCardSection } = useApp();

  const {
    saveNote,
    shareNote,
    unshareNote,
    toggleHighlight,
    getPrivateNote,
    getSharedNote,
    highlightCount,
  } = usePromptNotes(card.id, section.id);

  const normalizedPrompts = (section.prompts || []).map(normalizePrompt);
  const isAccordion = ACCORDION_TYPES.includes(section.type);

  // Auto-expand the last question that has a note, or restore from session, or fall back to Q1
  const storageKey = `expanded-${card.id}-${section.id}`;

  const getInitialExpanded = () => {
    if (!isAccordion) return null;
    const stored = sessionStorage.getItem(storageKey);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < normalizedPrompts.length) return parsed;
    }
    for (let i = normalizedPrompts.length - 1; i >= 0; i--) {
      const promptId = `prompt-${i}`;
      if (getPrivateNote(promptId)?.content || getSharedNote(promptId)?.content) {
        return i;
      }
    }
    return 0;
  };

  const [expandedIndex, setExpandedIndex] = useState<number | null>(getInitialExpanded);

  // Persist expanded index
  useEffect(() => {
    if (expandedIndex !== null) {
      sessionStorage.setItem(storageKey, String(expandedIndex));
    }
  }, [expandedIndex, storageKey]);

  // Imperative API: open note for current prompt
  useImperativeHandle(ref, () => ({
    openNoteForCurrent() {
      const target = isAccordion ? (expandedIndex ?? 0) : 0;
      if (isAccordion) {
        setExpandedIndex(target);
      }
      setFocusNoteIndex(target);
    },
  }), [isAccordion, expandedIndex]);

  const [focusNoteIndex, setFocusNoteIndex] = useState<number | null>(initialFocusNoteIndex ?? null);
  const promptRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Handle focusPromptIndex deep link: expand + focus + scroll
  useEffect(() => {
    if (focusPromptIndex == null) return;
    if (isAccordion) {
      setExpandedIndex(focusPromptIndex);
    }
    setFocusNoteIndex(focusPromptIndex);
    const timer = setTimeout(() => {
      const el = promptRefs.current.get(focusPromptIndex);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [focusPromptIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear focus signal after it's consumed
  useEffect(() => {
    if (focusNoteIndex !== null) {
      const timer = setTimeout(() => setFocusNoteIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [focusNoteIndex]);

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = normalizedPrompts.map((p, i) =>
      i === index ? { ...p, text: value } : p
    );
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handlePromptColorChange = (index: number, color: string) => {
    const newPrompts = normalizedPrompts.map((p, i) =>
      i === index ? { ...p, color } : p
    );
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handlePromptTextColorChange = (index: number, textColor: string) => {
    const newPrompts = normalizedPrompts.map((p, i) =>
      i === index ? { ...p, textColor } : p
    );
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handleAddPrompt = () => {
    const newPrompts: Prompt[] = [...normalizedPrompts, { text: '', color: undefined, textColor: undefined }];
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = normalizedPrompts.filter((_, i) => i !== index);
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handleTitleChange = (value: string) => {
    updateCardSection(card.id, section.id, { title: value });
  };

  const handleContentChange = (value: string) => {
    updateCardSection(card.id, section.id, { content: value });
  };

  const handleExpandChange = useCallback((index: number, expanded: boolean) => {
    setExpandedIndex(expanded ? index : null);
  }, []);

  // Section intro text mapping
  const sectionIntroText: Record<string, string> = {
    opening: 'Hitta in i samtalet tillsammans.',
    reflective: 'Lyssna djupare på varandra.',
    scenario: 'Känn igen er i varandras vardag.',
    exercise: 'Gör något av det ni upptäckt.',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-8"
    >
      {/* Section intro — soft, not a heading */}
      {sectionIntroText[section.type] && (
        <p className="text-[13px] text-muted-foreground/70 text-center leading-relaxed mb-8 max-w-sm mx-auto">
          {sectionIntroText[section.type]}
        </p>
      )}

      {/* Section content */}
      {section.content && (
        <p className="text-body text-gentle mb-10 leading-relaxed w-full text-center max-w-2xl mx-auto">
          {section.content}
        </p>
      )}

      {/* All questions */}
      {normalizedPrompts.length > 0 && (
        <div className="space-y-4 mb-8">
          {normalizedPrompts.map((prompt, index) => {
            const promptId = `prompt-${index}`;
            const isControlled = isAccordion;

            return (
              <div key={index} id={`prompt-anchor-${index}`} ref={(el) => { if (el) promptRefs.current.set(index, el); else promptRefs.current.delete(index); }}>
                <PromptItem
                  prompt={prompt}
                  promptId={promptId}
                  index={index}
                  label={isControlled ? `Fråga ${index + 1}` : undefined}
                  sectionType={section.type as 'opening' | 'reflective' | 'scenario' | 'exercise'}
                  privateNote={getPrivateNote(promptId)}
                  sharedNote={getSharedNote(promptId)}
                  highlightCount={highlightCount}
                  expanded={isControlled ? expandedIndex === index : undefined}
                  onExpandChange={isControlled ? (exp) => handleExpandChange(index, exp) : undefined}
                  onPromptChange={handlePromptChange}
                  onPromptColorChange={handlePromptColorChange}
                  onPromptTextColorChange={handlePromptTextColorChange}
                  onRemovePrompt={handleRemovePrompt}
                  onSaveNote={saveNote}
                  onShareNote={shareNote}
                  onUnshareNote={unshareNote}
                  onToggleHighlight={toggleHighlight}
                  autoFocusNote={focusNoteIndex === index}
                  disableShare={isRevisitMode}
                />
              </div>
            );
          })}
        </div>
      )}

    </motion.div>
  );
});

export default SectionView;
