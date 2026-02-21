import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check, Circle } from 'lucide-react';
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
      <Header title={category?.title} showBack backTo="/" />

      <div className="px-6 pt-6 pb-24 flex flex-col">
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(0.08 + index * 0.05, 0.24), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <motion.div
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); }
        }}
        className="w-full cursor-pointer flex items-center gap-3 hover:opacity-80 focus-visible:outline-none"
        style={{
          padding: '18px 16px',
          marginBottom: isLast ? '0' : '10px',
          background: 'hsl(36, 20%, 97%)',
          border: '1px solid hsl(36, 15%, 88%)',
          borderRadius: '14px',
        }}
      >
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Check
              size={14}
              className="flex-shrink-0"
              style={{ color: 'hsl(158, 35%, 18%)', opacity: 0.60 }}
              aria-label="Avklarad"
            />
          )}
          <h3
            className="font-serif"
            style={{
              fontSize: '17px',
              fontWeight: 500,
              color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            }}
          >
            {card.title}
          </h3>
        </div>
          {card.subtitle && (
            <p
              className="type-meta mt-px"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {card.subtitle}
            </p>
          )}
        </div>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="flex-shrink-0"
          style={{ color: 'var(--accent-saffron)', opacity: 0.60 }}
        />
      </motion.div>
    </motion.div>
  );
}
