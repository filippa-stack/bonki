import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BEAT_1, EASE } from '@/lib/motion';
import CompletionMarker from '@/components/CompletionMarker';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import {
  selectExploredCardIds,
  selectCardVisitDates,
} from '@/selectors/spaceSnapshotSelectors';
import Header from '@/components/Header';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);

  const exploredIds = selectExploredCardIds(snapshot);
  const cardVisitDates = selectCardVisitDates(snapshot);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  if (!category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="h-14 border-b border-border" style={{ backgroundColor: 'var(--color-surface-primary)' }} />
        <div className="px-6 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Header showBack backTo="/" />

      <div className="px-6 pt-title-above pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-display"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {category.title}
        </motion.h1>
        {category.entryLine && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: 0.2, ease: EASE }}
            className="text-body mt-2 max-w-md"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {category.entryLine}
          </motion.p>
        )}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1 + 0.1, duration: 0.2, ease: EASE }}
          className="text-[16px] mt-[32px]"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
        >
          Utforska i er takt.
        </motion.p>
      </div>

      <div className="px-6 pt-[32px] pb-[80px]">
        {cards.map((card, index) => (
          <CardEntry
            key={card.id}
            card={card}
            index={index}
            isCompleted={exploredIds.includes(card.id)}
            lastVisitedAt={cardVisitDates[card.id] || null}
            onNavigate={() => navigate(`/card/${card.id}`)}
            isLast={index === cards.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface CardEntryProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
  };
  index: number;
  isCompleted?: boolean;
  lastVisitedAt?: string | null;
  onNavigate: () => void;
  isLast?: boolean;
}

function CardEntry({ card, index, isCompleted = false, onNavigate, isLast = false }: CardEntryProps) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => onNavigate(), 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: tapped ? 0.6 : 1, scale: tapped ? 1.02 : 1 }}
      transition={tapped
        ? { duration: 0.18, ease: [0.4, 0.0, 0.2, 1] }
        : { delay: Math.min(0.08 + index * 0.05, 0.24), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }
      }
      className={index === 0 ? 'mt-[16px]' : 'mt-[48px]'}
      style={{ transformOrigin: 'center left' }}
    >
      <div
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
        }}
        className="w-full cursor-pointer transition-opacity hover:opacity-70 min-h-[44px] flex flex-col justify-center"
      >
        <div className="flex items-baseline gap-3">
          <h3
            className="text-subheading flex-1"
            style={{ color: isCompleted ? 'var(--color-text-secondary)' : index === 0 ? '#151413' : 'var(--color-text-primary)' }}
          >
            {card.title}
          </h3>
          <CompletionMarker completed={isCompleted} />
        </div>
        {card.subtitle && (
          <p
            className="text-body mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {card.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
