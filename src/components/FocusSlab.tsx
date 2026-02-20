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
      className="cursor-pointer"
      style={{
        borderRadius: '24px',
        padding: '28px 28px 24px',
        minHeight: '148px',
        maxHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        background: 'hsl(var(--muted) / 0.38)',
        boxShadow: '0 6px 20px hsl(var(--foreground) / 0.08)',
        transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
      }}
      onPointerDown={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'scale(0.98)';
        el.style.boxShadow = '0 1px 4px hsl(var(--foreground) / 0.02), 0 0px 1px hsl(var(--foreground) / 0.02)';
      }}
      onPointerUp={(e) => {
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.boxShadow = '';
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.boxShadow = '';
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
        style={{ color: 'var(--color-text-primary)', fontSize: '26px' }}
      >
        {title}
      </h2>

      {/* Button — subdued, doesn't compete with slab */}
      <div className="mt-auto pt-5">
        <span
          className="inline-flex items-center px-4 text-[12px] font-medium"
          style={{
            height: '28px',
            backgroundColor: 'var(--cta-bg)',
            color: 'var(--cta-text)',
            borderRadius: '14px',
            letterSpacing: '0.2px',
            opacity: 0.85,
          }}
        >
          {buttonLabel}
        </span>
      </div>
    </div>
  );
}
