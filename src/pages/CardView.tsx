import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardById, getCategoryById } from '@/data/content';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import SectionView from '@/components/SectionView';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Opening',
  reflective: 'Reflection',
  scenario: 'Scenario',
  exercise: 'Exercise',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { getConversationForCard, saveConversation } = useApp();

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gentle">Card not found</p>
      </div>
    );
  }

  const activeSection = card.sections.find((s) => s.id === activeSectionId);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Card header */}
      <div className="px-6 pt-8 pb-6 border-b border-divider">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-2"
        >
          {card.title}
        </motion.h1>
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-body text-gentle italic"
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>

      {/* Section tabs */}
      <div className="px-6 py-4 border-b border-divider overflow-x-auto">
        <div className="flex gap-2">
          {card.sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveSectionId(
                activeSectionId === section.id ? null : section.id
              )}
              className={`px-4 py-2 rounded-full text-sm font-sans whitespace-nowrap transition-all ${
                activeSectionId === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {sectionTypeLabels[section.type] || section.type}
            </motion.button>
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
              className="py-16 text-center"
            >
              <p className="text-gentle mb-2">Choose a section to begin</p>
              <p className="text-sm text-muted-foreground">
                Each section offers a different way to explore this topic.
                <br />
                There is no required order.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
