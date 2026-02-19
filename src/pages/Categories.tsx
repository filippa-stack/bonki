import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { selectExploredCardIds } from '@/selectors/spaceSnapshotSelectors';
import Header from '@/components/Header';

const RECOMMENDED_CATEGORY_ORDER = [
  "emotional-intimacy",
  "communication",
  "category-8",
  "category-7",
  "parenting-together",
  "individual-needs",
  "category-9",
  "category-6",
  "daily-life",
  "category-10",
];

export default function Categories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, cards } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const exploredIds = selectExploredCardIds(snapshot);

  // Sort categories by recommended order; unlisted ones go at the end
  const sortedCategories = useMemo(() => {
    const orderMap = new Map(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
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

      <div className="px-6 pt-[80px] pb-[80px]">
        {sortedCategories.map((category, index) => {
          const catCards = cards.filter((c) => c.categoryId === category.id);
          const allExplored = catCards.length > 0 && catCards.every((c) => exploredIds.includes(c.id));
          const isGuided = category.id === guidedCategoryId;
          const isLast = index === sortedCategories.length - 1;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(0.08 + index * 0.05, 0.3), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            >
              {isGuided && (
                <p
                  className="text-[14px] mb-[8px]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  En bra plats att börja
                </p>
              )}
              <div
                onClick={() => navigate(`/category/${category.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${category.id}`); }
                }}
                className="w-full cursor-pointer py-[20px] transition-opacity hover:opacity-70"
              >
                <h3
                  className="text-[20px] font-medium leading-snug"
                  style={{ color: allExplored ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                >
                  {category.title}
                </h3>
                {category.entryLine && (
                  <p
                    className="text-body mt-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {category.entryLine}
                  </p>
                )}
              </div>
              {!isLast && (
                <div className="h-px" style={{ backgroundColor: 'var(--color-ink)', opacity: 0.06 }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
