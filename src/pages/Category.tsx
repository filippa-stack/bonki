import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import Header from '@/components/Header';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, updateCard, updateCardColor, updateCardTextColor, updateCardBorderColor, updateCardDescription, addCard, deleteCard, backgroundColor, getExploredCardsInCategory, getCategoryStatus, journeyState, proposeCard } = useApp();
  const { user } = useAuth();
  const { memberCount } = useCoupleSpace();
  
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
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="h-14 border-b border-border bg-card" />
        <div className="px-6 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      {/* Category header */}
      <div className="px-6 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-1"
        >
          {category.title}
        </motion.h1>
        {category.entryLine && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-700 not-italic mb-3"
          >
            {category.entryLine}
          </motion.p>
        )}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-xs uppercase tracking-widest text-slate-500 font-bold"
        >
          {category.description}
        </motion.p>

        {/* Gentle orientation note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          {status === 'explored' ? (
            <p className="text-sm text-slate-400 not-italic mt-4">
              {t('category.all_explored')}
            </p>
          ) : (
            <p className="text-sm text-slate-400 not-italic mt-4">
              {t('category_status.return_note')}
            </p>
          )}
        </motion.div>
      </div>

      {/* Cards */}
      <div className="px-6 pb-12">
        <div className="space-y-3">
          {cards.map((card, index) => {
            const isExplored = journeyState?.exploredCardIds?.includes(card.id) || false;
            return (
              <EditableCard
                key={card.id}
                card={card}
                index={index}
                explored={isExplored}
                onNavigate={() => {
                  // If partner connected and card not yet started, propose instead of navigate
                  if (memberCount >= 2 && categoryId && !isExplored) {
                    proposeCard(categoryId, card.id);
                    toast(t('topic_proposal.proposed_toast'));
                    navigate('/');
                  } else {
                    navigate(`/card/${card.id}`);
                  }
                }}
                onUpdate={updateCard}
                onColorChange={(color) => updateCardColor(card.id, color)}
                onTextColorChange={(textColor) => updateCardTextColor(card.id, textColor)}
                onBorderColorChange={(borderColor) => updateCardBorderColor(card.id, borderColor)}
                onDescriptionChange={(desc) => updateCardDescription(card.id, desc)}
                onDelete={() => handleDeleteCard(card.id, card.title)}
              />
            );
          })}
          
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
    description?: string;
    sections: any[];
    color?: string;
    textColor?: string;
    borderColor?: string;
  };
  index: number;
  explored?: boolean;
  onNavigate: () => void;
  onUpdate: (id: string, title: string, subtitle: string) => void;
  onColorChange: (color: string) => void;
  onTextColorChange: (textColor: string) => void;
  onBorderColorChange: (borderColor: string) => void;
  onDescriptionChange: (description: string) => void;
  onDelete: () => void;
}

function EditableCard({
  card,
  index,
  explored,
  onNavigate,
}: EditableCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onNavigate}
      className="w-full text-left card-reflection group cursor-pointer item-colors"
      style={{ 
        '--item-bg': card.color || undefined,
        '--item-border': card.borderColor || undefined,
        borderWidth: card.borderColor ? '2px' : undefined,
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center justify-center gap-1 py-5">
        <h3
          className="w-full font-serif text-lg sm:text-xl text-center item-text"
          style={{ '--item-text': card.textColor || undefined } as React.CSSProperties}
        >
          {card.title}
        </h3>
        {card.subtitle && (
          <p
            className="w-full text-sm text-center italic item-text-gentle"
            style={{ '--item-text': card.textColor || undefined } as React.CSSProperties}
          >
            {card.subtitle}
          </p>
        )}
        {explored && (
          <p className="text-xs text-muted-foreground text-center mt-2 italic">
            {t('category_status.explored')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
