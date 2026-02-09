import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Card, Prompt } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Bookmark, PenLine, Plus, Trash2 } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker';

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

export default function SectionView({ section, card }: SectionViewProps) {
  const { addReflection, getReflectionsForSection, saveConversation, updateCardSection } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const existingReflections = getReflectionsForSection(card.id, section.id);

  const normalizedPrompts = (section.prompts || []).map(normalizePrompt);

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

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;

    addReflection({
      cardId: card.id,
      sectionId: section.id,
      content: reflectionText,
      visibility: 'shared',
    });

    setReflectionText('');
    setIsWriting(false);
  };

  const handleSaveForLater = () => {
    saveConversation(card.id, section.id);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };


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

      {/* Prompts if available */}
      {normalizedPrompts.length > 0 && (
        <div className="space-y-4 mb-6">
          {normalizedPrompts.map((prompt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-lg border-l-2 border-primary/30 relative group"
              style={{ backgroundColor: prompt.color || 'hsl(var(--surface-warm))' }}
            >
              <textarea
                value={prompt.text}
                onChange={(e) => handlePromptChange(index, e.target.value)}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                className="text-body w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground min-h-[24px] text-center md:text-left"
                placeholder="Skriv en fråga..."
                style={{ color: prompt.textColor || 'hsl(var(--foreground))' }}
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker
                  currentColor={prompt.color}
                  onColorChange={(color) => handlePromptColorChange(index, color)}
                  currentTextColor={prompt.textColor}
                  onTextColorChange={(textColor) => handlePromptTextColorChange(index, textColor)}
                  showTextColor
                />
                <button
                  onClick={() => handleRemovePrompt(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
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

      {/* Existing reflections */}
      {existingReflections.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Dina reflektioner
          </p>
          <div className="space-y-3">
            {existingReflections.map((reflection) => (
              <div
                key={reflection.id}
                className="p-4 rounded-lg bg-card border border-border"
              >
                <p className="text-body text-foreground whitespace-pre-wrap">
                  {reflection.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(reflection.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write reflection */}
      {isWriting ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Skriv dina tankar..."
            className="w-full min-h-[120px] p-4 rounded-lg bg-card border border-input text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans text-base"
            autoFocus
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSaveReflection}
              disabled={!reflectionText.trim()}
              className="btn-gentle disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Spara reflektion
            </button>
            <button
              onClick={() => {
                setIsWriting(false);
                setReflectionText('');
              }}
              className="btn-soft"
            >
              Avbryt
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <button
            onClick={() => setIsWriting(true)}
            className="btn-soft flex items-center gap-2"
          >
            <PenLine className="w-4 h-4" />
            Skriv en reflektion
          </button>
          <button
            onClick={handleSaveForLater}
            className="btn-soft flex items-center gap-2"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Sparat' : 'Spara till senare'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
