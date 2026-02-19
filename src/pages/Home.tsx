import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
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
import ConfidenceCheckPanel from '@/components/ConfidenceCheckPanel';
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

  // Suggested context for highlighting
  const suggestedContext = useMemo(() => {
    const suggestedCardId = snapshotSuggestedNextCardId
      || (snapshotLastOpenedCardId && !exploredIds.includes(snapshotLastOpenedCardId) ? snapshotLastOpenedCardId : null);
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;
    return { suggestedCardId, suggestedCard, suggestedCategory };
  }, [snapshotSuggestedNextCardId, snapshotLastOpenedCardId, exploredIds, getCardById, getCategoryById]);

  const highlightedCategoryId = normalizedSession.categoryId || suggestedContext.suggestedCategory?.id || null;

  // Recommended category: first with unexplored cards
  const recommendedCategoryId = useMemo(() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const catCards = cards.filter((c) => c.categoryId === catId);
      if (catCards.length === 0) continue;
      const allExplored = catCards.every((c) => exploredIds.includes(c.id));
      if (!allExplored) return catId;
    }
    return RECOMMENDED_CATEGORY_ORDER[0];
  }, [cards, exploredIds]);

  // Idle primary CTA: recommended card or first card of first category
  const recommendedCardId = useMemo(() => {
    const id = snapshotSuggestedNextCardId;
    if (id) return id;
    const fallbackCat = categories[0];
    if (!fallbackCat) return null;
    const fallbackCard = cards.find((c) => c.categoryId === fallbackCat.id);
    return fallbackCard?.id ?? null;
  }, [snapshotSuggestedNextCardId, categories, cards]);

  return (
    <div className="min-h-screen flex flex-col page-bg">
      {/* 7+ day return overlay — only in idle */}
      <AnimatePresence>
        {showReturnOverlay && mode !== 'active' && (
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

        {/* ═══ ACTIVE — single centered session module ═══ */}
        {mode === 'active' && normalizedSession.cardId && (() => {
          const activeCard = getCardById(normalizedSession.cardId!);
          const activeCategory = activeCard ? getCategoryById(activeCard.categoryId) : null;
          if (!activeCard || !activeCategory) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="px-6 pt-[120px] pb-[80px] flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-sm text-center">
                {/* Ritual headline */}
                <h1
                  className="text-heading mb-[40px]"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Ett samtal i taget.
                </h1>

                {/* Primary action */}
                <button
                  onClick={() => { markNavigated(); navigate(`/card/${normalizedSession.cardId}`); }}
                  className="w-full h-14 rounded-button flex items-center justify-center text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-button-primary)',
                    color: 'var(--color-button-text)',
                  }}
                >
                  Fortsätt samtalet
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* ═══ IDLE — quiet single CTA ═══ */}
        {mode === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-6 pt-[120px] pb-[80px] flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-sm text-center">
              {/* Ritual headline */}
              <h1
                className="text-heading mb-[40px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Ett samtal i taget.
              </h1>

              <button
                onClick={() => {
                  markNavigated();
                  navigate('/categories');
                }}
                className="w-full h-14 rounded-button flex items-center justify-center text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-button-primary)',
                  color: 'var(--color-button-text)',
                }}
              >
                Starta samtal
              </button>

              {/* Subtle archive link */}
              <button
                onClick={() => navigate('/saved')}
                className="mt-[40px] text-meta transition-colors hover:text-foreground"
                style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
              >
                Arkiv
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
