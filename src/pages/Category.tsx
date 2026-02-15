import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Lock } from 'lucide-react';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, getExploredCardsInCategory, getCategoryStatus, journeyState } = useApp();

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

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
          {cards.map((card, index) => {
            const isExplored = journeyState?.exploredCardIds?.includes(card.id) || false;
            const previousCard = index > 0 ? cards[index - 1] : null;
            const previousExplored = previousCard
              ? journeyState?.exploredCardIds?.includes(previousCard.id) || false
              : true;
            const hasProgress = !!(journeyState?.sessionProgress?.[card.id]);
            const isUnlocked = index === 0 || previousExplored || hasProgress || isExplored;

            return (
              <CardEntry
                key={card.id}
                card={card}
                index={index}
                explored={isExplored}
                locked={!isUnlocked}
                isPrimary={index === 0 && !isExplored}
                onNavigate={() => {
                  if (!isUnlocked) return;
                  navigate(`/card/${card.id}`);
                }}
              />
            );
          })}
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
  explored?: boolean;
  locked?: boolean;
  isPrimary?: boolean;
  onNavigate: () => void;
}

function CardEntry({ card, index, explored, locked, isPrimary, onNavigate }: CardEntryProps) {
  const { t } = useTranslation();
  const [showLockedHint, setShowLockedHint] = useState(false);

  const handleLockedTap = () => {
    setShowLockedHint(true);
    setTimeout(() => setShowLockedHint(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={locked ? handleLockedTap : onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          locked ? handleLockedTap() : onNavigate();
        }
      }}
      className={`w-full text-center card-reflection group item-colors transition-all ${
        locked
          ? 'opacity-50 cursor-default'
          : isPrimary
            ? 'cursor-pointer ring-1 ring-primary/30 hover:ring-primary/50 hover:bg-card/90'
            : 'cursor-pointer hover:bg-card/90'
      }`}
      style={{
        '--item-bg': card.color || undefined,
        '--item-border': card.borderColor || undefined,
        borderWidth: card.borderColor ? '2px' : undefined,
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
        {explored && (
          <p className="text-xs text-muted-foreground text-center mt-2 not-italic">
            {t('category_status.explored')}
          </p>
        )}
        <AnimatePresence>
          {locked && showLockedHint && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground text-center mt-2 not-italic flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              {t('category.locked_hint', 'Låses upp efter föregående')}
            </motion.p>
          )}
        </AnimatePresence>
        {locked && !showLockedHint && (
          <p className="text-xs text-muted-foreground/40 text-center mt-2 not-italic flex items-center gap-1">
            <Lock className="w-3 h-3" />
          </p>
        )}
      </div>
    </motion.div>
  );
}
