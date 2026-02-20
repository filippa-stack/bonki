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
            className="text-body mt-[10px] max-w-md"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.45 }}
          >
            {category.entryLine}
          </motion.p>
        )}
      </div>

      <div className="px-6 pt-[24px] pb-[80px]">
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
  const handleTap = () => onNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(0.08 + index * 0.05, 0.24), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className={index === 0 ? 'mt-[38px]' : 'mt-[49px]'}
    >
      <div
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
        }}
        className="row-bloom row-lift relative w-full cursor-pointer min-h-[56px] flex flex-col justify-center rounded-sm py-[13px] px-2 hover:bg-black/[0.03] hover:pl-[14px] focus-visible:bg-black/[0.03] focus-visible:pl-[14px] focus-visible:outline-none active:pl-[14px] active:transition-none transition-colors duration-150 ease-out"
      >
        <div className="flex items-baseline gap-3">
          <h3
            className="text-subheading flex-1"
            style={{ color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
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
      {!isLast && (
        <div
          className="mt-[13px] h-px"
          style={{ backgroundColor: 'var(--color-text-primary)', opacity: 0.08 }}
        />
      )}
    </motion.div>
  );
}
