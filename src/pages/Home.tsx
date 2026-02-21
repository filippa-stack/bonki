import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, CSSProperties } from 'react';
import { useScrollCompression } from '@/hooks/useScrollCompression';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import { ArrowRight, Bookmark, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
import ReturnOverlay from '@/components/ReturnOverlay';
import FocusSlab from '@/components/FocusSlab';
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

  const { scrollRef, progress: scrollP } = useScrollCompression(80);

  // Derived compression styles
  const headerCompress: CSSProperties = {
    transition: 'transform 180ms ease-out, opacity 180ms ease-out',
    transform: `scale(${1 - scrollP * 0.03})`,
    opacity: 1 - scrollP * 0.15,
  };

  const slabCompress: CSSProperties = {
    transition: 'transform 200ms ease-out, opacity 200ms ease-out, box-shadow 200ms ease-out',
    transform: `translateY(${-scrollP * 12}px) scale(${1 - scrollP * 0.03})`,
    opacity: 1 - scrollP * 0.08,
  };

  return (
    <div ref={scrollRef} className="min-h-screen flex flex-col page-bg overflow-y-auto" style={{ height: '100vh' }}>
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
        <div style={headerCompress}>
          <Header showSharedLink showSettings minimal />
        </div>

        {/* Loading skeleton */}
        {mode === 'loading' && (
          <div className="px-6 pt-8 pb-16">
            <div className="h-14 rounded-card bg-muted/20 animate-pulse" />
          </div>
        )}

        {mode !== 'loading' && (
          <>
            {/* ZONE A — Identity */}
            <motion.div
              className="pt-8 px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="type-h1" style={{ color: 'var(--color-text-primary)' }}>
                Vårt utrymme
              </h1>
              <p
                className="type-body mt-4"
                style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}
              >
                Här börjar era samtal.
              </p>
            </motion.div>

            {/* 48px spacing after Zone A */}
            <div style={{ height: '48px' }} />

            {/* Categories — depth layer */}
            <div
              className="px-6 pb-24"
              style={{
                marginLeft: '-16px',
                marginRight: '-16px',
                paddingLeft: 'calc(24px + 16px)',
                paddingRight: 'calc(24px + 16px)',
                paddingTop: '16px',
                marginTop: '-16px',
                background: 'hsl(var(--foreground) / 0.02)',
                borderRadius: '32px',
              }}
            >
              <div className="flex flex-col" style={{ gap: '24px' }}>
                {sortedCategories.map((category, index) => {
                  const catCards = cards.filter((c) => c.categoryId === category.id);
                  const allExplored = catCards.length > 0 && catCards.every((c) => exploredIds.includes(c.id));
                  const isPrimary = index === 0;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.03, duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div
                        onClick={() => { markNavigated(); navigate(`/category/${category.id}`); }}
                        role="button"
                        tabIndex={0}
                        aria-label={category.title}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${category.id}`); }
                        }}
                        className="cursor-pointer"
                        style={{
                          borderRadius: '16px',
                          padding: '20px',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: 'rgba(0, 0, 0, 0.025)',
                          boxShadow: 'none',
                          transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
                        }}
                        onPointerDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.98)';
                          e.currentTarget.style.boxShadow = '0 2px 8px hsl(var(--foreground) / 0.08)';
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.transform = 'translateX(2px)';
                        }}
                        onPointerUp={(e) => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.transform = '';
                        }}
                        onPointerLeave={(e) => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.transform = '';
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="type-h3"
                              style={{
                                color: allExplored ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                                opacity: allExplored ? 0.7 : 0.9,
                              }}
                            >
                              {category.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {catCards.some((c) => exploredIds.includes(c.id)) && (
                              <CompletionMarker completed />
                            )}
                            <ChevronRight
                              data-chevron
                              className="w-4 h-4"
                              style={{ color: 'var(--color-text-secondary)', opacity: 0.55, transition: 'transform 120ms ease-out' }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
