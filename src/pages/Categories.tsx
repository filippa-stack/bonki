import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CompletionMarker from '@/components/CompletionMarker';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { selectExploredCardIds } from '@/selectors/spaceSnapshotSelectors';
import Header from '@/components/Header';
import ResumeBanner from '@/components/ResumeBanner';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useDevState } from '@/contexts/DevStateContext';

import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

export default function Categories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, cards } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const exploredIds = selectExploredCardIds(snapshot);
  const normalizedSession = useNormalizedSessionContext();
  const devState = useDevState();

  // In devState=pairedActive, provide a mock cardId so the ResumeBanner renders
  const effectiveCardId = normalizedSession.cardId ?? (devState === 'pairedActive' ? 'listening-presence' : null);

  // Sort categories by recommended order; unlisted ones go at the end
  const sortedCategories = useMemo(() => {
    const orderMap = new Map<string, number>(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [categories]);

  // First recommended category that still has unexplored cards
  const guidedCategoryId = useMemo(() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const catCards = cards.filter((c) => c.categoryId === catId);
      if (catCards.length === 0) continue;
      const allExplored = catCards.every((c) => exploredIds.includes(c.id));
      if (!allExplored) return catId;
    }
    return null;
  }, [cards, exploredIds]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Header showBack backTo="/" />

      <div className="px-6 pt-8 pb-24">
        {effectiveCardId && (
          <div className="mb-6">
            <ResumeBanner cardId={effectiveCardId} />
          </div>
        )}
        <h1
          className="type-h1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Var vill ni börja?
        </h1>
        {sortedCategories.map((category, index) => {
          const catCards = cards.filter((c) => c.categoryId === category.id);
          const allExplored = catCards.length > 0 && catCards.every((c) => exploredIds.includes(c.id));
          const isGuided = category.id === guidedCategoryId;
          const isLast = index === sortedCategories.length - 1;
          const prevIsGuided = index > 0 && sortedCategories[index - 1]?.id === guidedCategoryId;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(0.08 + index * 0.05, 0.3), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
              className={index === 0 ? 'mt-12' : 'mt-6'}
            >
              {isGuided && (
                <p
                  className="type-body mb-2"
                  style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
                >
                  {exploredIds.length > 0 ? 'Nästa rekommenderade' : 'Rekommenderad start'}
                </p>
              )}
                <div
                  onClick={() => navigate(`/category/${category.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={category.title}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${category.id}`); }
                  }}
                  className="row-bloom row-lift group relative w-full cursor-pointer min-h-[48px] flex flex-col justify-center rounded-sm py-3 px-2 hover:bg-black/[0.03] hover:pl-4 focus-visible:bg-black/[0.03] focus-visible:pl-4 focus-visible:outline-none active:pl-4 active:transition-none"
                >
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-px"
                    style={{ backgroundColor: 'var(--color-text-primary)', opacity: 0.4 }}
                  />
                  <div className="flex items-baseline gap-3">
                    <h3
                      className={`type-h2 leading-snug flex-1 ${isGuided ? 'font-semibold' : 'font-medium'}`}
                      style={{ color: allExplored ? 'var(--color-text-secondary)' : isGuided ? '#151413' : 'var(--color-text-primary)' }}
                    >
                      {category.title}
                    </h3>
                    <CompletionMarker completed={allExplored} />
                  </div>
                  {category.entryLine && (
                    <p
                      className="type-body mt-1"
                      style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}
                    >
                      {category.entryLine}
                    </p>
                  )}
                </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
