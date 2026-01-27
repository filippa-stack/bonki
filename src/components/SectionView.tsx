import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Card } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Bookmark, PenLine } from 'lucide-react';

interface SectionViewProps {
  section: Section;
  card: Card;
}

export default function SectionView({ section, card }: SectionViewProps) {
  const { addReflection, getReflectionsForSection, saveConversation } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const existingReflections = getReflectionsForSection(card.id, section.id);

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
        <h2 className="text-heading text-foreground">{section.title}</h2>
      </div>

      {/* Section content */}
      <p className="text-body text-gentle mb-8 leading-relaxed">
        {section.content}
      </p>

      {/* Prompts if available */}
      {section.prompts && section.prompts.length > 0 && (
        <div className="space-y-4 mb-10">
          {section.prompts.map((prompt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-lg bg-warm border-l-2 border-primary/30"
            >
              <p className="text-body text-foreground">{prompt}</p>
            </motion.div>
          ))}
        </div>
      )}

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
