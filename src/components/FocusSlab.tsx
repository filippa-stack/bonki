import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useMemo } from 'react';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { selectExploredCardIds } from '@/selectors/spaceSnapshotSelectors';
import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';
import { categories as allCategories } from '@/data/content';

export default function FocusSlab() {
  const navigate = useNavigate();
  const { cards, getCategoryById, getCardById } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const normalizedSession = useNormalizedSessionContext();
  const devState = useDevState();

  const effectiveCardId = normalizedSession.cardId ?? (devState === 'pairedActive' ? 'listening-presence' : null);
  const exploredIds = selectExploredCardIds(snapshot);

  // First recommended category with unexplored cards
  const guidedCategoryId = useMemo(() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const catCards = cards.filter((c) => c.categoryId === catId);
      if (catCards.length === 0) continue;
      if (!catCards.every((c) => exploredIds.includes(c.id))) return catId;
    }
    return null;
  }, [cards, exploredIds]);

  const isResume = !!effectiveCardId;

  // Resolve display data
  const card = effectiveCardId ? getCardById(effectiveCardId) : null;
  const resumeCategory = card ? getCategoryById(card.categoryId) : null;
  const guidedCategory = guidedCategoryId ? getCategoryById(guidedCategoryId) : null;

  const microLabel = isResume ? 'Fortsätt där ni slutade' : 'Rekommenderad start';
  const title = isResume
    ? (resumeCategory?.title ?? card?.title ?? 'Ert samtal')
    : (guidedCategory?.title ?? allCategories[0]?.title ?? '');
  const buttonLabel = isResume ? 'Fortsätt' : 'Börja';

  const handleTap = () => {
    if (isResume && effectiveCardId) {
      navigate(`/card/${effectiveCardId}`, { state: { resumed: true } });
    } else if (guidedCategoryId) {
      navigate(`/category/${guidedCategoryId}`);
    }
  };

  // Nothing to show
  if (!isResume && !guidedCategoryId) return null;

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
      className="cursor-pointer transition-transform active:scale-[0.985]"
      style={{
        borderRadius: '24px',
        padding: '20px 22px 18px',
        minHeight: '128px',
        maxHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, hsl(var(--muted) / 0.22) 0%, hsl(var(--muted) / 0.32) 100%)',
        boxShadow: '0 2px 8px hsl(var(--foreground) / 0.04), 0 1px 2px hsl(var(--foreground) / 0.03)',
      }}
    >
      {/* Top micro-label */}
      <p
        className="text-[11px] font-medium tracking-wide uppercase"
        style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
      >
        {microLabel}
      </p>

      {/* Session / category title */}
      <h2
        className="font-serif font-semibold leading-snug mt-1"
        style={{ color: 'var(--color-text-primary)', fontSize: '21px' }}
      >
        {title}
      </h2>

      {/* Button */}
      <div className="mt-auto pt-3">
        <span
          className="inline-flex items-center px-5 text-sm font-medium"
          style={{
            height: '32px',
            backgroundColor: 'var(--cta-bg)',
            color: 'var(--cta-text)',
            borderRadius: '16px',
            letterSpacing: '0.2px',
          }}
        >
          {buttonLabel}
        </span>
      </div>
    </div>
  );
}
