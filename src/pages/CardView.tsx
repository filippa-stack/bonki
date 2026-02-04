import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import SectionView from '@/components/SectionView';
import ColorPicker from '@/components/ColorPicker';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Team Work',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { getConversationForCard, saveConversation, getCardById, getCategoryById, updateCard, updateCardSection, updateCardEmptyState, backgroundColor } = useApp();

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    existingConversation?.lastSectionId || null
  );

  useEffect(() => {
    if (card && activeSectionId) {
      saveConversation(card.id, activeSectionId);
    }
  }, [activeSectionId, card]);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
        <p className="text-gentle">Card not found</p>
      </div>
    );
  }

  const activeSection = card.sections.find((s) => s.id === activeSectionId);

  const handleSectionColorChange = (sectionId: string, color: string) => {
    updateCardSection(card.id, sectionId, { color });
  };

  const handleSectionTextColorChange = (sectionId: string, textColor: string) => {
    updateCardSection(card.id, sectionId, { textColor });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Card header */}
      <div className="px-6 pt-8 pb-6 border-b border-divider">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            value={card.title}
            onChange={(e) => updateCard(card.id, e.target.value, card.subtitle || '')}
            className="text-display text-foreground mb-2 w-full bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
            placeholder="Card title..."
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <input
            type="text"
            value={card.subtitle || ''}
            onChange={(e) => updateCard(card.id, card.title, e.target.value)}
            className="text-body text-gentle italic w-full bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
            placeholder="Subtitle..."
          />
        </motion.div>
      </div>

      {/* Section tabs */}
      <div className="px-6 py-4 border-b border-divider overflow-x-auto">
        <div className="flex gap-2 items-center">
          {card.sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-1">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveSectionId(
                  activeSectionId === section.id ? null : section.id
                )}
                className={`px-4 py-2 rounded-full text-sm font-sans whitespace-nowrap transition-all ${
                  activeSectionId === section.id
                    ? 'shadow-sm'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: section.color || '#FF0000',
                  color: section.textColor || '#FFFFFF',
                }}
              >
                {sectionTypeLabels[section.type] || section.type}
              </motion.button>
              <ColorPicker
                currentColor={section.color}
                onColorChange={(color) => handleSectionColorChange(section.id, color)}
                currentTextColor={section.textColor}
                onTextColorChange={(textColor) => handleSectionTextColorChange(section.id, textColor)}
                showTextColor
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {activeSection ? (
            <SectionView key={activeSection.id} section={activeSection} card={card} />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-4"
            >
              <textarea
                value={card.emptyStateTitle || 'Välj en sektion för att börja'}
                onChange={(e) => updateCardEmptyState(card.id, e.target.value, card.emptyStateDescription || '')}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                className="text-gentle mb-2 w-full text-center bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
                placeholder="Rubrik..."
              />
              <textarea
                value={card.emptyStateDescription || 'Varje sektion erbjuder ett annorlunda sätt att utforska ämnet.\nDet finns ingen bestämd ordning.'}
                onChange={(e) => updateCardEmptyState(card.id, card.emptyStateTitle || '', e.target.value)}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                className="text-sm text-muted-foreground w-full text-center bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
                placeholder="Beskrivning..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
