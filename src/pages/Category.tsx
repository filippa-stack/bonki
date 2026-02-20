import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { BEAT_1, EASE } from '@/lib/motion';
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

      <div className="px-6 pt-title-above pb-0">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }}
          className="font-serif text-[32px] font-semibold leading-[1.2]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {category.title}
        </motion.h1>
        {category.entryLine && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: 0.2, ease: EASE }}
            className="text-body mt-[16px] max-w-md"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.35 }}
          >
            {category.entryLine}
          </motion.p>
        )}
      </div>

      <div className="px-6 pt-[32px] pb-[80px] flex flex-col gap-4">
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

function CardEntry({ card, index, isCompleted = false, onNavigate }: CardEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(0.08 + index * 0.05, 0.24), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <div
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); }
        }}
        className="w-full cursor-pointer rounded-[16px] px-5 py-3 flex items-center gap-3 transition-colors duration-150 ease-out hover:opacity-80 focus-visible:outline-none"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.025)' }}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="text-subheading"
            style={{ color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p
              className="text-[12px] mt-px leading-relaxed"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.32 }}
            >
              {card.subtitle}
            </p>
          )}
        </div>
        {isCompleted && (
          <Check
            size={14}
            className="flex-shrink-0"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }}
            aria-label="Avklarad"
          />
        )}
        <ChevronRight
          size={18}
          className="flex-shrink-0"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.35 }}
        />
      </div>
    </motion.div>
  );
}
