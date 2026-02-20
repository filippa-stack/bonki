import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import { ArrowRight, Bookmark, Share2, ChevronDown } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
import ReturnOverlay from '@/components/ReturnOverlay';
import ResumeBanner from '@/components/ResumeBanner';
import ConfidenceCheckPanel from '@/components/ConfidenceCheckPanel';
import CompletionMarker from '@/components/CompletionMarker';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastSuccessOnce, toastErrorOnce } from '@/lib/toastOnce';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import {
  selectLastActivityAt,
  selectExploredCardIds,
  selectLastOpenedCardId,
  selectLastCompletedCardId,
  selectSuggestedNextCardId,
} from '@/selectors/spaceSnapshotSelectors';
import { categories as allCategories, cards as allCards } from '@/data/content';



/** Collapsed "Notiser" row — expands inline on tap */
function NotiserSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-6 border-t border-divider">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Notiser</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4">
          <NotificationSettings />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useThemeVars();
  const {
    savedConversations,
    categories,
    getCardById,
    getCategoryById,
    cards,
    getCategoryStatus,
    switchToNewSpace,
  } = useApp();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const devState = useDevState();
  const appModeState = useAppMode();
  const normalizedSession = useNormalizedSessionContext();
  const { mode } = appModeState;
  const { isTogether } = useTogetherMode();

  // In devState=pairedActive, provide a mock cardId so the ResumeBanner renders
  const effectiveCardId = normalizedSession.cardId ?? (devState === 'pairedActive' ? 'listening-presence' : null);

  // Snapshot-derived values
  const snapshotLastActivityAt = selectLastActivityAt(snapshot);
  const exploredIds = selectExploredCardIds(snapshot);
  const snapshotLastOpenedCardId = selectLastOpenedCardId(snapshot);
  const snapshotLastCompletedCardId = selectLastCompletedCardId(snapshot);
  const snapshotSuggestedNextCardId = selectSuggestedNextCardId(snapshot, allCategories, allCards);

  // Return-overlay dismissal (7-day gate)
  const RETURN_OVERLAY_KEY = 'return_overlay_dismissed';
  const [returnOverlayDismissed, setReturnOverlayDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(RETURN_OVERLAY_KEY);
      if (!stored) return false;
      const { timestamp, sessionKey } = JSON.parse(stored);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (timestamp < sevenDaysAgo) return false;
      const currentKey = normalizedSession.cardId || snapshotLastOpenedCardId || '';
      if (sessionKey && currentKey && sessionKey !== currentKey) return false;
      return true;
    } catch { return false; }
  });

  const dismissReturnOverlay = () => {
    const currentKey = normalizedSession.cardId || snapshotLastOpenedCardId || '';
    localStorage.setItem(RETURN_OVERLAY_KEY, JSON.stringify({ timestamp: Date.now(), sessionKey: currentKey }));
    setReturnOverlayDismissed(true);
  };

  const lastActivityElapsed = useMemo(() => {
    if (!snapshotLastActivityAt) return 0;
    return Date.now() - snapshotLastActivityAt.getTime();
  }, [snapshotLastActivityAt]);

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const showReturnOverlay = useMemo(() => {
    if (returnOverlayDismissed) return false;
    if (lastActivityElapsed < SEVEN_DAYS_MS) return false;
    return !!(mode === 'active' || snapshotLastCompletedCardId || snapshotLastOpenedCardId);
  }, [returnOverlayDismissed, lastActivityElapsed, mode, snapshotLastCompletedCardId, snapshotLastOpenedCardId]);

  const returnResumeCardId = normalizedSession.cardId || snapshotLastOpenedCardId || snapshotLastCompletedCardId || null;

  // Track navigation to skip highlighting on repeat visits
  const [hasNavigatedThisVisit] = useState(() => sessionStorage.getItem('home_navigated') === '1');
  const markNavigated = () => sessionStorage.setItem('home_navigated', '1');

  // Sorted categories by recommended order
  const sortedCategories = useMemo(() => {
    const orderMap = new Map<string, number>(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [categories]);

  // First recommended category with unexplored cards
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
    <div className="min-h-screen flex flex-col page-bg">
      {/* 7+ day return overlay */}
      <AnimatePresence>
        {showReturnOverlay && (
          <ReturnOverlay
            onResume={() => {
              dismissReturnOverlay();
              if (returnResumeCardId) { markNavigated(); navigate(`/card/${returnResumeCardId}`); }
            }}
            onStartNew={() => { dismissReturnOverlay(); }}
            onBrowse={() => { dismissReturnOverlay(); }}
          />
        )}
      </AnimatePresence>

      <div className="flex-1">
        <Header showBackgroundPicker={false} showBackupManager={false} showSaveIndicator={false} />

        {/* Loading skeleton */}
        {mode === 'loading' && (
          <div className="px-6 pt-[120px] pb-[80px]">
            <div className="h-14 rounded-card bg-muted/20 animate-pulse" />
          </div>
        )}

        {mode !== 'loading' && (
          <>
            {/* Resume banner — non-intrusive, shown when active session exists */}
            {effectiveCardId && (
              <div className="px-6 pt-8 mb-8">
                <ResumeBanner cardId={effectiveCardId} />
              </div>
            )}

            {/* Categories listing — always visible */}
            <div className={`px-6 pb-[80px] ${effectiveCardId ? 'pt-0' : 'pt-[64px]'}`}>
              <h1
                className="text-[22px] font-normal"
                style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: effectiveCardId ? '68px' : '72px',
                  opacity: effectiveCardId ? 0.9 : 1,
                }}
              >
                Var vill ni börja?
              </h1>

              {sortedCategories.map((category, index) => {
                const catCards = cards.filter((c) => c.categoryId === category.id);
                const allExplored = catCards.length > 0 && catCards.every((c) => exploredIds.includes(c.id));
                const isGuided = category.id === guidedCategoryId;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(0.08 + index * 0.05, 0.3), duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                    className={isGuided ? (index > 0 ? 'mt-[64px] mb-[-8px]' : 'mb-[-8px]') : (index > 0 ? 'mt-[48px]' : '')}
                  >
                    {isGuided && (
                      <p
                        className="text-[14px] mb-[8px]"
                        style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
                      >
                        En bra plats att börja
                      </p>
                    )}
                    <div
                      onClick={() => { markNavigated(); navigate(`/category/${category.id}`); }}
                      role="button"
                      tabIndex={0}
                      aria-label={category.title}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${category.id}`); }
                      }}
                      className="w-full cursor-pointer transition-opacity hover:opacity-70 min-h-[44px] flex flex-col justify-center"
                    >
                      <div className="flex items-baseline gap-3">
                        <h3
                          className={`text-[20px] leading-snug flex-1 ${isGuided ? 'font-semibold' : 'font-medium'}`}
                          style={{ color: allExplored ? 'var(--color-text-secondary)' : isGuided ? '#151413' : 'var(--color-text-primary)' }}
                        >
                          {category.title}
                        </h3>
                        <CompletionMarker completed={allExplored} />
                      </div>
                      {category.entryLine && (
                        <p
                          className="text-body mt-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {category.entryLine}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Subtle archive link */}
              <div className="mt-[64px] text-center">
                <button
                  onClick={() => navigate('/saved')}
                  className="text-meta transition-colors hover:text-foreground"
                  style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
                >
                  Arkiv
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
