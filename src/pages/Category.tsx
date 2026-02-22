import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const [completedCardIds, setCompletedCardIds] = useState<string[]>([]);
  const [inProgressCardIds, setInProgressCardIds] = useState<string[]>([]);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;

    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (!cancelled && data) {
          setCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });

    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .in('status', ['active', 'abandoned', 'in_progress'])
      .then(({ data }) => {
        if (!cancelled && data) {
          setInProgressCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });

    return () => { cancelled = true; };
  }, [space?.id]);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Map category ID to its CSS accent color
  const categoryColorMap: Record<string, string> = {
    'emotional-intimacy': 'hsl(30, 15%, 70%)',
    'communication': 'hsl(36, 20%, 75%)',
    'category-8': 'hsl(30, 10%, 65%)',
    'category-7': 'hsl(20, 12%, 68%)',
    'category-9': 'hsl(30, 8%, 72%)',
    'fun-connection': 'hsl(36, 20%, 75%)',
    'physical-intimacy': 'hsl(20, 12%, 68%)',
    'financial-harmony': 'hsl(30, 8%, 72%)',
    'growth-resilience': 'hsl(30, 10%, 65%)',
  };
  const accentColor = (categoryId && categoryColorMap[categoryId]) || 'hsl(30, 12%, 68%)';

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
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(36, 18%, 94%)', transition: 'background-color 0.4s ease' }}>
      <Header title={category?.title} showBack backTo="/" />

      <div className="px-6 pt-6 pb-24 flex flex-col">
        {/* EntryLine — editorial italic subtitle */}
        {category.entryLine && (
          <motion.p
            className="text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: '8px',
              marginBottom: '32px',
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontStyle: 'italic',
              lineHeight: 1.4,
              color: 'var(--accent-text)',
              textWrap: 'balance',
              hyphens: 'auto',
              display: 'block',
              maxWidth: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {category.entryLine}
          </motion.p>
        )}
        {cards.map((card, index) => {
          const isCompleted = completedCardIds.includes(card.id);
          const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);
          return (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
              onNavigate={() => navigate(`/card/${card.id}`)}
              isLast={index === cards.length - 1}
              accentColor={accentColor}
            />
          );
        })}

        {/* Bottom anchor */}
        {(() => {
          const allCompleted = cards.length > 0 && cards.every(c => completedCardIds.includes(c.id));
          return (
            <div style={{
              marginTop: '48px',
              textAlign: 'center',
              paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '14px',
                color: 'var(--color-text-tertiary)',
                opacity: 0.4,
                lineHeight: 1.5,
              }}>
                {allCompleted
                  ? 'Ni har utforskat det här området.'
                  : 'Välj ett samtal ovan.'}
              </p>
            </div>
          );
        })()}
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
  isInProgress?: boolean;
  onNavigate: () => void;
  isLast?: boolean;
  accentColor: string;
}

function CardEntry({ card, index, isCompleted = false, isInProgress = false, onNavigate, isLast = false, accentColor }: CardEntryProps) {
  const chapterNum = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
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
          background: isCompleted ? 'rgba(0,0,0,0.015)' : 'hsl(36, 20%, 97%)',
          border: '1px solid hsl(36, 15%, 88%)',
          borderLeft: `3px solid ${accentColor}`,
          borderRadius: '14px',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
        }}
        onPointerEnter={(e) => {
          e.currentTarget.style.borderColor = 'hsl(36, 15%, 78%)';
          e.currentTarget.style.borderLeftColor = accentColor;
          e.currentTarget.style.backgroundColor = 'hsl(36, 20%, 97%)';
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.borderColor = 'hsl(36, 15%, 72%)';
          e.currentTarget.style.borderLeftColor = accentColor;
          e.currentTarget.style.backgroundColor = 'hsl(36, 20%, 96%)';
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.borderLeftColor = '';
          e.currentTarget.style.backgroundColor = '';
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.borderLeftColor = '';
          e.currentTarget.style.backgroundColor = '';
        }}
      >
        <div className="flex-1 min-w-0 flex items-start">
          {isInProgress && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#C4821D',
                marginRight: '10px',
                marginTop: '7px',
                flexShrink: 0,
                animation: 'saffron-pulse 2.5s ease-in-out infinite',
              }}
            />
          )}
          <div className="min-w-0">
            {/* Chapter number */}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'var(--color-text-tertiary)',
                opacity: isCompleted ? 0.30 : 0.5,
                display: 'block',
                marginBottom: '2px',
              }}
            >
              {chapterNum}
            </span>
            <h3
              className="font-serif"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                color: isCompleted ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                opacity: isCompleted ? 0.45 : 1,
              }}
            >
              {card.title}
            </h3>
            {card.subtitle && (
              <p
                className="type-meta mt-px"
                style={{ color: 'var(--color-text-secondary)', opacity: isCompleted ? 0.35 : 0.80 }}
              >
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <Check
              size={16}
              className="flex-shrink-0"
              style={{ color: '#1E3D2F', opacity: 0.55 }}
              aria-label="Avklarad"
            />
          )}
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="flex-shrink-0"
            style={{ color: 'var(--accent-saffron)', opacity: 0.60 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
