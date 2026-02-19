import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BEAT_1, EASE } from '@/lib/motion';
import { CheckCircle2 } from 'lucide-react';
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
      </div>

      <div className="px-6 pb-16">
        <div className="space-y-4 mt-8">
          {cards.map((card, index) => (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              isCompleted={exploredIds.includes(card.id)}
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
  };
  index: number;
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

function CardEntry({ card, index, isCompleted = false, lastVisitedAt, onNavigate }: CardEntryProps) {
  const visitLabel = getVisitMemoryLabel(lastVisitedAt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.08 + index * 0.05, 0.24), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); }
      }}
      className="w-full cursor-pointer rounded-card px-8 py-8 transition-opacity hover:opacity-80"
      style={{ backgroundColor: 'var(--color-surface-primary)' }}
    >
      <div className="flex flex-col items-center gap-1.5">
        {isCompleted && (
          <CheckCircle2
            className="w-4 h-4 mb-1"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}
          />
        )}
        <h3
          className="text-subheading text-center"
          style={{ color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
        >
          {card.title}
        </h3>
        {card.subtitle && (
          <p
            className="text-sm text-center italic mt-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {card.subtitle}
          </p>
        )}
        {visitLabel && (
          <p className="text-[11px] text-center mt-2" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
            {visitLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
