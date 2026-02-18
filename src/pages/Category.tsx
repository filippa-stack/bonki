import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory, journeyState, getCardById } = useApp();
  const { user } = useAuth();
  const { memberCount } = useCoupleSpaceContext();
  const normalizedSession = useNormalizedSessionContext();
  const exploredIds = journeyState?.exploredCardIds || [];
  const cardVisitDates = journeyState?.cardVisitDates || {};
  const sessionProgress = journeyState?.sessionProgress || {};
  const isPaired = memberCount >= 2;

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Highlight the active card using normalized session — the single source of truth.
  const sessionCardIdForThisCategory =
    normalizedSession.sessionId && normalizedSession.cardId && cards.some(c => c.id === normalizedSession.cardId)
      ? normalizedSession.cardId
      : null;
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

      <div className="px-6 pt-8 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-display text-foreground mb-1"
        >
          {category.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-base text-muted-foreground mt-4 max-w-md leading-relaxed"
        >
          {category.entryLine ? `${category.entryLine} ${t('category_status.return_note')}` : t('category_status.return_note')}
        </motion.p>
      </div>

      <div className="px-6 pb-10">
        <div className="space-y-6">
          {cards.map((card, index) => (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              highlighted={card.id === highlightedCardId}
              isCompleted={(() => {
                const inExplored = exploredIds.includes(card.id);
                if (!isPaired) return index === 0 || inExplored;
                // When paired, require both partners to have progress
                const perUser = sessionProgress[card.id]?.perUser;
                const hasMutualProgress = perUser ? Object.keys(perUser).length >= 2 : false;
                return inExplored && hasMutualProgress;
              })()}
              lastVisitedAt={cardVisitDates[card.id] || null}
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
  isCompleted?: boolean;
  lastVisitedAt?: string | null;
  onNavigate: () => void;
}

function getVisitMemoryLabel(lastVisitedAt: string | null | undefined): string | null {
  if (!lastVisitedAt) return null;
  const elapsed = Date.now() - new Date(lastVisitedAt).getTime();
  const days = elapsed / (1000 * 60 * 60 * 24);
  if (days < 7) return 'Ni var här nyligen.';
  if (days <= 30) return 'Ni var här för en tid sedan.';
  return 'Det var ett tag sedan ni var här.';
}

function CardEntry({ card, index, highlighted, isCompleted = false, lastVisitedAt, onNavigate }: CardEntryProps) {
  const visitLabel = getVisitMemoryLabel(lastVisitedAt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
      className={`relative w-full text-center card-sub group transition-all cursor-pointer overflow-hidden rounded-[20px] shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]${isCompleted ? '' : ' item-colors'}${highlighted ? ' ring-2 ring-primary/40' : ''}`}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="flex flex-col items-center gap-1.5 py-8 px-7">
        {isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-[#497575] mb-1" />
        )}
        <h3
          className={`w-full font-serif text-lg sm:text-xl text-center leading-snug ${isCompleted ? 'text-slate-400' : 'item-text'}`}
          style={isCompleted ? undefined : { '--item-text': card.textColor || undefined } as React.CSSProperties}
        >
          {card.title}
        </h3>
        {card.subtitle && (
          <p
            className={`w-full text-sm text-center italic mt-0.5 ${isCompleted ? 'text-slate-300' : 'item-text-gentle'}`}
            style={isCompleted ? undefined : { '--item-text': card.textColor || undefined } as React.CSSProperties}
          >
            {card.subtitle}
          </p>
        )}
        {visitLabel && (
          <p className="text-[11px] text-muted-foreground/40 text-center mt-1.5">{visitLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
