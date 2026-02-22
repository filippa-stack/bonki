import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, CSSProperties } from 'react';
import { useScrollCompression } from '@/hooks/useScrollCompression';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import { ArrowRight, Bookmark, Share2, ChevronDown, ChevronRight, Check, Circle } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';

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

  // Direct DB query for completed card IDs (bypasses snapshot)
  const [completedCardIds, setCompletedCardIds] = useState<string[]>([]);
  const [inProgressCardIds, setInProgressCardIds] = useState<string[]>([]);
  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    // Fetch completed
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
    // Fetch active/abandoned (in-progress)
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .in('status', ['active', 'abandoned'])
      .then(({ data }) => {
        if (!cancelled && data) {
          setInProgressCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });
    return () => { cancelled = true; };
  }, [space?.id]);

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

  // Dynamic recommendation logic
  const resumeBannerCardId = snapshot?.sessions?.session?.card_id ?? null;
  const resumeBannerCategoryId = useMemo(() => {
    if (!resumeBannerCardId) return null;
    const c = cards.find(c => c.id === resumeBannerCardId);
    return c?.categoryId ?? null;
  }, [resumeBannerCardId, cards]);

  const recommendedCategory = useMemo(() => {
    if (!completedCardIds) return null;
    for (const category of sortedCategories) {
      const catCards = cards.filter(c => c.categoryId === category.id);
      if (catCards.length === 0) continue;
      const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
      if (completedCount < catCards.length) {
        return category;
      }
    }
    return null;
  }, [sortedCategories, cards, completedCardIds]);

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
    <div ref={scrollRef} className="min-h-screen flex flex-col overflow-y-auto" style={{ height: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="type-h1" style={{ color: 'var(--text-primary)' }}>
                Vårt utrymme
              </h1>
              <p
                className="type-body mt-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                {snapshot?.sessions
                  ? 'Ni har börjat. Fortsätt i er takt.'
                  : exploredIds.length === 0
                    ? 'Välj ett ämne.'
                    : exploredIds.length <= 5
                      ? 'Ni har börjat. Fortsätt i er takt.'
                      : 'Ert samtal fortsätter.'}
              </p>
            </motion.div>

            {/* Resume banner — active session */}
            {(() => {
              const activeSession = snapshot?.sessions;
              if (!activeSession) return null;
              const { session } = activeSession;
              const cardId = session.card_id;
              if (!cardId) return null;
              const card = getCardById(cardId);
              const cat = session.category_id ? getCategoryById(session.category_id) : null;

              return (
                <motion.div
                  className="px-6 mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    onClick={() => { markNavigated(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }
                    }}
                    className="cursor-pointer flex items-center justify-between"
                    style={{
                      borderRadius: '14px',
                      padding: '16px 20px',
                      background: 'hsl(36, 20%, 97%)',
                      border: '1px solid hsl(36, 15%, 88%)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-sans uppercase"
                        style={{ fontSize: '11px', color: 'var(--accent-saffron)', opacity: 0.75, letterSpacing: '0.08em' }}
                      >
                        Fortsätt där ni slutade
                      </p>
                      <p className="font-serif text-xl font-medium mt-1" style={{ color: 'var(--text-primary)', textWrap: 'balance', hyphens: 'auto' }}>
                        {card?.title || cardId}
                      </p>
                      {cat && (
                        <p className="font-sans mt-0.5" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {cat.title}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 shrink-0 ml-3" style={{ color: 'var(--accent-saffron)', opacity: 0.6 }} />
                  </div>
                </motion.div>
              );
            })()}

            {/* 20px spacing before categories */}
            <div style={{ height: '20px' }} />

            {/* Recommendation section */}
            {recommendedCategory && (() => {
              const recCat = recommendedCategory;
              return (
                <div className="px-6" style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#C4821D',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    opacity: 0.85,
                    marginBottom: '10px',
                    display: 'block',
                  }}>
                    Rekommenderad start
                  </p>
                  <div
                    onClick={() => { markNavigated(); navigate(`/category/${recCat.id}`); }}
                    role="button"
                    tabIndex={0}
                    aria-label={recCat.title}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${recCat.id}`); }
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
                      background: 'hsl(36, 22%, 96%)',
                      border: '1px solid hsl(36, 20%, 84%)',
                      transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.98)';
                      e.currentTarget.style.boxShadow = '0 2px 8px hsl(var(--foreground) / 0.08)';
                    }}
                    onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="type-h3" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '16px', textWrap: 'balance', hyphens: 'auto' }}>
                        {recCat.title}
                      </h3>
                      {recCat.entryLine && (
                        <p className="type-body" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                          {recCat.entryLine}
                        </p>
                      )}
                    </div>
                    <ChevronRight data-chevron className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-saffron)', opacity: 0.6 }} />
                  </div>
                </div>
              );
            })()}

            {/* Categories */}
            <div className="px-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 64px)' }}>
              <div className="flex flex-col" style={{ gap: '24px' }}>
                {(recommendedCategory ? sortedCategories.filter(c => c.id !== recommendedCategory.id) : sortedCategories).map((category, index) => {
                  const catCards = cards.filter((c) => c.categoryId === category.id);
                  const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
                  const allCompleted = completedCount === catCards.length && catCards.length > 0;
                  const hasInProgressCards = catCards.some(c => inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id));
                   const someStarted = (completedCount > 0 || hasInProgressCards) && !allCompleted;
                  

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
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
                          borderRadius: '14px',
                          padding: '16px 18px',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: 'hsl(36, 20%, 98%)',
                          border: '1px solid hsl(36, 15%, 90%)',
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
                              color: 'var(--text-primary)',
                                fontWeight: 500,
                                fontSize: '16px',
                                textWrap: 'balance',
                                hyphens: 'auto',
                              }}
                            >
                              {category.title}
                            </h3>
                            {category.entryLine && (
                              <p
                                className="type-meta"
                                style={{ color: 'var(--text-secondary)', marginTop: '8px' }}
                              >
                                {category.entryLine}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {allCompleted ? (
                              <Check size={13} style={{ color: '#1E3D2F', opacity: 0.50, marginRight: '10px' }} />
                            ) : someStarted ? (
                              <span style={{
                                display: 'inline-block',
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#C4821D',
                                opacity: 0.70,
                              }} />
                            ) : null}
                            <ChevronRight
                              data-chevron
                              className="w-4 h-4"
                              style={{ color: 'var(--accent-saffron)', opacity: 0.6, transition: 'transform 120ms ease-out' }}
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
      
    </div>
  );
}
