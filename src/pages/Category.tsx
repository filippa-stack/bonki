import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Plus } from 'lucide-react';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, updateCard, updateCardColor, updateCardTextColor, updateCardBorderColor, addCard, deleteCard, backgroundColor, getExploredCardsInCategory, getCategoryStatus } = useApp();
  
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];
  const exploredCount = categoryId ? getExploredCardsInCategory(categoryId) : 0;
  const status = categoryId ? getCategoryStatus(categoryId) : 'not_started';

  const handleAddCard = () => {
    if (!categoryId) return;
    const newCardId = addCard(categoryId);
    navigate(`/card/${newCardId}`);
  };

  const handleDeleteCard = (cardId: string, cardTitle: string) => {
    if (confirm(t('category.delete_confirm', { title: cardTitle }))) {
      deleteCard(cardId);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
        <p className="text-gentle">{t('category.not_found')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
      <Header showBack backTo="/" />

      {/* Category header */}
      <div className="px-6 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-2"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-body text-gentle"
        >
          {category.description}
        </motion.p>

        {/* Exploration status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <p className="text-xs text-muted-foreground">
            {t('category.explored_count', { explored: exploredCount, total: cards.length })}
          </p>
          {status === 'explored' && (
            <p className="text-xs text-gentle italic mt-1">
              {t('category.all_explored')}
            </p>
          )}
          {status !== 'explored' && (
            <p className="text-xs text-gentle italic mt-1">
              {t('category_status.return_note')}
            </p>
          )}
        </motion.div>
      </div>

      {/* Cards */}
      <div className="px-6 pb-12">
        <div className="space-y-3">
          {cards.map((card, index) => (
            <EditableCard
              key={card.id}
              card={card}
              index={index}
              onNavigate={() => navigate(`/card/${card.id}`)}
              onUpdate={updateCard}
              onColorChange={(color) => updateCardColor(card.id, color)}
              onTextColorChange={(textColor) => updateCardTextColor(card.id, textColor)}
              onBorderColorChange={(borderColor) => updateCardBorderColor(card.id, borderColor)}
              onDelete={() => handleDeleteCard(card.id, card.title)}
            />
          ))}
          
          {/* Add new card button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: cards.length * 0.1 }}
            onClick={handleAddCard}
            className="w-full p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">{t('category.add_card')}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

interface EditableCardProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
    sections: any[];
    color?: string;
    textColor?: string;
    borderColor?: string;
  };
  index: number;
  onNavigate: () => void;
  onUpdate: (id: string, title: string, subtitle: string) => void;
  onColorChange: (color: string) => void;
  onTextColorChange: (textColor: string) => void;
  onBorderColorChange: (borderColor: string) => void;
  onDelete: () => void;
}

function EditableCard({
  card,
  index,
  onNavigate,
}: EditableCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onNavigate}
      className="w-full text-left card-reflection group cursor-pointer"
      style={{ 
        backgroundColor: card.color || undefined,
        borderColor: card.borderColor || undefined,
        borderWidth: card.borderColor ? '2px' : undefined,
      }}
    >
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="w-full space-y-2">
          <h3
            className="w-full font-serif text-lg sm:text-xl text-center"
            style={{ color: card.textColor || 'hsl(var(--foreground))' }}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p
              className="w-full text-sm text-center"
              style={{ color: card.textColor || 'hsl(var(--gentle))' }}
            >
              {card.subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
