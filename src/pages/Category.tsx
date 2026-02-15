import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, journeyState, currentSession, getCardById } = useApp();

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Compute single highlighted card
  const sessionCardIdForThisCategory =
    currentSession?.categoryId === categoryId ? currentSession.cardId : null;
  const suggestedId = journeyState?.suggestedNextCardId || null;
  const suggestedCard = suggestedId ? getCardById(suggestedId) : null;
  const suggestedCardIdForThisCategory =
    suggestedCard && suggestedCard.categoryId === categoryId ? suggestedCard.id : null;
  const highlightedCardId = sessionCardIdForThisCategory || suggestedCardIdForThisCategory || null;

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

      <div className="px-6 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-foreground mb-1"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-muted-foreground mt-3 max-w-md leading-relaxed"
        >
          {category.entryLine ? `${category.entryLine} ${t('category_status.return_note')}` : t('category_status.return_note')}
        </motion.p>
      </div>

      <div className="px-6 pb-12">
        <div className="space-y-3">
          {cards.map((card, index) => (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              highlighted={card.id === highlightedCardId}
              onNavigate={() => navigate(`/card/${card.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardEntryProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
    color?: string;
    textColor?: string;
    borderColor?: string;
  };
  index: number;
  highlighted?: boolean;
  onNavigate: () => void;
}

function CardEntry({ card, index, highlighted, onNavigate }: CardEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
      className={`relative w-full text-center card-reflection group item-colors transition-all cursor-pointer overflow-hidden${highlighted ? ' ring-1 ring-primary/25 shadow-sm bg-card/90' : ''}`}
      style={{
        '--item-bg': card.color || undefined,
        '--item-border': card.borderColor || undefined,
        borderWidth: highlighted ? '2.5px' : '2px',
        borderStyle: 'solid',
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center gap-1 p-6">
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
      </div>
    </motion.div>
  );
}
