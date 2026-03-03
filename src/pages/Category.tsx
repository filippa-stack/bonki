import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { getProductForCard, allProducts } from '@/data/products';
import { useProductTheme } from '@/hooks/useProductTheme';
import Header from '@/components/Header';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { optimisticCardIds } = useOptimisticCompletions();

  const [serverCompletedCardIds, setServerCompletedCardIds] = useState<string[]>([]);
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
          setServerCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
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

  const completedCardIds = useMemo(() => {
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds]);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Determine if this is a product category for back-navigation
  const product = useMemo(() => {
    if (!categoryId) return undefined;
    return allProducts.find(p => p.categories.some(c => c.id === categoryId));
  }, [categoryId]);
  const backTo = product ? `/product/${product.slug}` : '/';

  // Apply product theme (background + accent colors)
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    product?.backgroundColor,
  );

  if (!category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-base)' }}>
        <div className="h-14 border-b border-border" style={{ backgroundColor: 'var(--surface-raised)' }} />
        <div className="px-5 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  const allCompleted = cards.length > 0 && cards.every(c => completedCardIds.includes(c.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-base)' }}>
      <Header title={category?.title} showBack backTo={backTo} />

      <div className="px-5 pt-4 pb-24 flex flex-col">
        {/* Editorial entry line */}
        {category.entryLine && (
          <motion.p
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              marginTop: '32px',
              marginBottom: '48px',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 5.8vw, 28px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 1.35,
              color: 'var(--accent-text)',
              textWrap: 'balance',
              hyphens: 'auto',
              display: 'block',
              maxWidth: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.015em',
            } as React.CSSProperties}
          >
            {category.entryLine}
          </motion.p>
        )}

        {/* Card list */}
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
            />
          );
        })}

        {/* Bottom anchor */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--text-tertiary)',
            opacity: 0.40,
            lineHeight: 1.5,
          }}>
          {allCompleted
              ? 'Ni har utforskat det här området.'
              : 'Välj ett samtal.'}
          </p>
          {allCompleted && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              opacity: 0.50,
              lineHeight: 1.55,
              marginTop: '6px',
            }}>
              Ni är alltid välkomna tillbaka hit.
            </p>
          )}
          <button
            onClick={() => navigate(backTo)}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-tertiary)', opacity: 0.40, background: 'none', border: 'none', cursor: 'pointer', marginTop: '16px' }}
          >
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Card Entry (tile-door pattern) ─── */

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
}

function CardEntry({ card, index, isCompleted = false, isInProgress = false, onNavigate, isLast = false }: CardEntryProps) {
  const chapterNum = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
      style={{ marginBottom: isLast ? '0' : '8px' }}
    >
      <div
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); }
        }}
        className="w-full cursor-pointer group"
        style={{
          padding: '22px 20px',
          background: isCompleted
            ? 'var(--surface-raised)'
            : 'var(--surface-raised)',
          border: 'none',
          borderRadius: '12px',
          boxShadow: isCompleted
            ? '0 1px 2px hsla(30, 15%, 30%, 0.03)'
            : '0 4px 20px -4px hsla(30, 20%, 28%, 0.10), 0 12px 40px -10px hsla(30, 18%, 28%, 0.12)',
          transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease-out',
        }}
        onPointerDown={(e) => {
          if (isCompleted) return;
          const el = e.currentTarget;
          el.style.transform = 'scale(0.99)';
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = '';
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
        onPointerEnter={(e) => {
          if (isCompleted) return;
          const el = e.currentTarget;
          el.style.transform = 'translateY(-3px)';
          el.style.boxShadow =
            '0 4px 12px -4px hsla(30, 20%, 28%, 0.10), 0 12px 36px -8px hsla(30, 18%, 30%, 0.08)';
        }}
      >
        <div className="flex items-start">
          {/* In-progress dot */}
          {isInProgress && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-saffron)',
                marginRight: '10px',
                marginTop: '7px',
                flexShrink: 0,
                animation: 'saffron-pulse 2.5s ease-in-out infinite',
              }}
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Chapter number */}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'var(--text-tertiary)',
                opacity: isCompleted ? 0.30 : 0.5,
                display: 'block',
                marginBottom: '2px',
                textAlign: 'center',
              }}
            >
              {chapterNum}
            </span>
            <h3
              className="font-serif"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                opacity: isCompleted ? 0.50 : 1,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {card.title}
            </h3>
            {card.subtitle && (
              <p
                className="font-serif"
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  opacity: isCompleted ? 0.40 : 0.75,
                  lineHeight: 1.5,
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                {card.subtitle}
              </p>
            )}
          </div>

          {/* Right side: check + chevron */}
          <div className="flex items-center gap-2 shrink-0 ml-3" style={{ marginTop: '4px' }}>
            {isCompleted && (
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.04em',
                color: 'var(--cta-default)',
                opacity: 0.55,
                fontWeight: 500,
              }}>
                Avklarad
              </span>
            )}
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className="flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
              style={{ color: 'var(--accent-saffron)', opacity: 0.55 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
