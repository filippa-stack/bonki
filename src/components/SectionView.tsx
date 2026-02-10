import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Card, Prompt } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Plus, ChevronDown } from 'lucide-react';
import PromptItem from '@/components/PromptItem';
import { usePromptNotes } from '@/hooks/usePromptNotes';

interface SectionViewProps {
  section: Section;
  card: Card;
}

// Helper to normalize prompts to Prompt objects
const normalizePrompt = (prompt: string | Prompt): Prompt => {
  if (typeof prompt === 'string') {
    return { text: prompt, color: undefined, textColor: undefined };
  }
  return prompt;
};

const PROGRESSIVE_TYPES = ['opening', 'reflective'];

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

  const isProgressive = PROGRESSIVE_TYPES.includes(section.type);

  // Progressive reveal state: how many questions are revealed (1-based)
  const [revealedCount, setRevealedCount] = useState(1);
  // Which question index is currently expanded (-1 = none)
  const [expandedIndex, setExpandedIndex] = useState(isProgressive ? 0 : -1);

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
    setExpandedIndex(expanded ? index : -1);
    // When expanding a question, reveal the next one (collapsed)
    if (expanded && index + 1 < normalizedPrompts.length) {
      setRevealedCount(prev => Math.max(prev, index + 2));
    }
  }, [normalizedPrompts.length]);

  const handleRevealNext = () => {
    setRevealedCount(prev => Math.min(prev + 1, normalizedPrompts.length));
  };

  // Determine which prompts to render
  const visibleCount = isProgressive
    ? Math.min(revealedCount, normalizedPrompts.length)
    : normalizedPrompts.length;
  const hasMoreToReveal = isProgressive && revealedCount < normalizedPrompts.length;

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
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Förvandlar insikt till gemensam handling.</p>
        )}
        {section.type === 'scenario' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Gör det svåra pratbart genom igenkänning.</p>
        )}
        {section.type === 'reflective' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Fördjupar, utmanar och breddar perspektivet.</p>
        )}
        {section.type === 'opening' && (
          <p className="text-sm text-gentle italic mt-2 md:ml-9">Sänker tröskeln och sätter samtalet i rörelse.</p>
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

      {/* Prompts */}
      {normalizedPrompts.length > 0 && (
        <div className="space-y-3 mb-6">
          <AnimatePresence mode="sync">
            {normalizedPrompts.slice(0, visibleCount).map((prompt, index) => {
              const promptId = `prompt-${index}`;
              const isFirstRevealed = index === 0;
              // For progressive: collapsed questions get a label prefix
              const showLabel = isProgressive && index > 0;

              return (
                <motion.div
                  key={index}
                  initial={isFirstRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showLabel && expandedIndex !== index && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
                      Fråga {index + 1}
                    </p>
                  )}
                  <PromptItem
                    prompt={prompt}
                    promptId={promptId}
                    index={index}
                    privateNote={getPrivateNote(promptId)}
                    sharedNote={getSharedNote(promptId)}
                    highlightCount={highlightCount}
                    expanded={isProgressive ? expandedIndex === index : undefined}
                    onExpandChange={isProgressive ? (exp) => handleExpandChange(index, exp) : undefined}
                    onPromptChange={handlePromptChange}
                    onPromptColorChange={handlePromptColorChange}
                    onPromptTextColorChange={handlePromptTextColorChange}
                    onRemovePrompt={handleRemovePrompt}
                    onSaveNote={saveNote}
                    onShareNote={shareNote}
                    onUnshareNote={unshareNote}
                    onToggleHighlight={toggleHighlight}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Subtle reveal affordance */}
          {hasMoreToReveal && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleRevealNext}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mt-4"
            >
              <span>Nästa fråga</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      )}

      {/* Add prompt button */}
      <div className="flex justify-center md:justify-start">
        <button
          onClick={handleAddPrompt}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <Plus className="w-4 h-4" />
          Lägg till fråga
        </button>
      </div>
    </motion.div>
  );
}
