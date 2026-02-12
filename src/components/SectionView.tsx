import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Section, Card, Prompt } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Plus } from 'lucide-react';
import PromptItem from '@/components/PromptItem';
import StepReflection from '@/components/StepReflection';
import { usePromptNotes } from '@/hooks/usePromptNotes';

interface SectionViewProps {
  section: Section;
  card: Card;
}

const normalizePrompt = (prompt: string | Prompt): Prompt => {
  if (typeof prompt === 'string') {
    return { text: prompt, color: undefined, textColor: undefined };
  }
  return prompt;
};

const ACCORDION_TYPES = ['opening', 'reflective'];

export default function SectionView({ section, card }: SectionViewProps) {
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
    // Restore from session if available
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
    // Only one question open at a time
    setExpandedIndex(expanded ? index : null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      {/* Section header */}
      <div className="mb-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start">
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-heading text-foreground bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-muted-foreground text-center md:text-left"
            placeholder="Sektionstitel..."
          />
        </div>
        {section.type === 'exercise' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Gör något av det ni upptäckt.</p>
        )}
        {section.type === 'scenario' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Känn igen er i varandras vardag.</p>
        )}
        {section.type === 'reflective' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Lyssna djupare på varandra.</p>
        )}
        {section.type === 'opening' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Hitta in i samtalet tillsammans.</p>
        )}
      </div>

      {/* Section content */}
      <textarea
        value={section.content}
        onChange={(e) => handleContentChange(e.target.value)}
        ref={(el) => {
          if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }
        }}
        className="text-body text-gentle mb-8 leading-relaxed w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground text-center md:text-left"
        placeholder="Beskrivning..."
      />

      {/* All questions rendered — Q1 expanded, rest collapsed */}
      {normalizedPrompts.length > 0 && (
        <div className="space-y-3 mb-6">
          {normalizedPrompts.map((prompt, index) => {
            const promptId = `prompt-${index}`;
            const isControlled = isAccordion;

            return (
              <div key={index}>
                <PromptItem
                  prompt={prompt}
                  promptId={promptId}
                  index={index}
                  label={isControlled ? `Fråga ${index + 1}` : undefined}
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
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Add prompt button */}
      <div className="flex justify-center md:justify-start">
        <button
          onClick={handleAddPrompt}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <Plus className="w-4 h-4" />
          Lägg till fråga
        </button>
      </div>

      {/* Inline step reflection — compact for opening/reflective, expanded for scenario/exercise */}
      <StepReflection
        section={section}
        card={card}
        defaultExpanded={section.type === 'scenario' || section.type === 'exercise'}
      />
    </motion.div>
  );
}
