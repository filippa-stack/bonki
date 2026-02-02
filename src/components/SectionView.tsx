import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Card } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Bookmark, PenLine, Plus, Trash2 } from 'lucide-react';

interface SectionViewProps {
  section: Section;
  card: Card;
}

export default function SectionView({ section, card }: SectionViewProps) {
  const { addReflection, getReflectionsForSection, saveConversation, updateCardSection } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const existingReflections = getReflectionsForSection(card.id, section.id);

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...(section.prompts || [])];
    newPrompts[index] = value;
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handleAddPrompt = () => {
    const newPrompts = [...(section.prompts || []), ''];
    updateCardSection(card.id, section.id, { prompts: newPrompts });
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = (section.prompts || []).filter((_, i) => i !== index);
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

  const getSectionIcon = () => {
    switch (section.type) {
      case 'opening':
        return '○';
      case 'reflective':
        return '◐';
      case 'scenario':
        return '□';
      case 'exercise':
        return '◇';
      default:
        return '•';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-primary opacity-60">{getSectionIcon()}</span>
        <input
          type="text"
          value={section.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-heading text-foreground bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-muted-foreground"
          placeholder="Sektionstitel..."
        />
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
        className="text-body text-gentle mb-8 leading-relaxed w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
        placeholder="Beskrivning..."
      />

      {/* Prompts if available */}
      {section.prompts && (
        <div className="space-y-4 mb-6">
          {section.prompts.map((prompt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-lg bg-warm border-l-2 border-primary/30 relative group"
            >
              <textarea
                value={prompt}
                onChange={(e) => handlePromptChange(index, e.target.value)}
                className="text-body text-foreground w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground min-h-[24px]"
                placeholder="Skriv en fråga..."
              />
              <button
                onClick={() => handleRemovePrompt(index)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add prompt button */}
      <button
        onClick={handleAddPrompt}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <Plus className="w-4 h-4" />
        Lägg till fråga
      </button>

      {/* Existing reflections */}
      {existingReflections.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Your reflections
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
            placeholder="Write your thoughts..."
            className="w-full min-h-[120px] p-4 rounded-lg bg-card border border-input text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans text-base"
            autoFocus
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSaveReflection}
              disabled={!reflectionText.trim()}
              className="btn-gentle disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save reflection
            </button>
            <button
              onClick={() => {
                setIsWriting(false);
                setReflectionText('');
              }}
              className="btn-soft"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsWriting(true)}
            className="btn-soft flex items-center gap-2"
          >
            <PenLine className="w-4 h-4" />
            Write a reflection
          </button>
          <button
            onClick={handleSaveForLater}
            className="btn-soft flex items-center gap-2"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save for later'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
