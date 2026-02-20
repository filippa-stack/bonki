// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastErrorOnce } from '@/lib/toastOnce';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';

import StageInterstitial from '@/components/StageInterstitial';

import ReviewDrawer from '@/components/ReviewDrawer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, BookOpen } from 'lucide-react';
import SessionTakeaway from '@/components/SessionTakeaway';
import CompletedSessionView from '@/components/CompletedSessionView';
import LockedReflectionDisplay from '@/components/LockedReflectionDisplay';

import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { isDevToolsEnabled } from '@/lib/devTools';
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { BEAT_1, BEAT_2, BEAT_3, EASE } from '@/lib/motion';

// ─────────────────────────────────────────────────────────────
// Card view mode — the single source of truth for which surface mounts.
//
//   'live'       → active paired session, SessionStepReflection visible
//   'revisit'    → read-only walkthrough via ?revisit=true query param
//   'history'    → session is completed, CompletedSessionView mounts
//   'completion' → session just finished, takeaway screen
//   'guard'      → paired but no active session, entry blocked
// ─────────────────────────────────────────────────────────────
type CardViewMode = 'live' | 'revisit' | 'history' | 'completion' | 'guard';

function resolveCardViewMode({
  isRevisitMode,
  hasActiveSession,
  hasCompletedSessionForCard,
  showCompletion,
}: {
  isRevisitMode: boolean;
  hasActiveSession: boolean;
  hasCompletedSessionForCard: boolean;
  showCompletion: boolean;
}): CardViewMode {
  // Active session ALWAYS wins — even if URL has ?revisit=true
  if (showCompletion) return 'completion';
  if (hasActiveSession) return 'live';
  // No active session — honour explicit revisit param or completed-card fallback
  if (isRevisitMode) return 'revisit';
  if (hasCompletedSessionForCard) return 'revisit';
  return 'live';
}

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

const STEP_RITUAL_HINTS: Record<string, { together: string; solo: string }> = {
  opening:    { together: 'Det finns inget rätt svar här. Bara ert.',  solo: 'Det finns inget rätt svar här. Bara ditt.' },
  reflective: { together: 'Lyssna färdigt innan ni svarar.',          solo: 'Ta tid på dig innan du svarar.' },
  scenario:   { together: 'Välj ett perspektiv — inte en skyldig.',   solo: 'Välj ett perspektiv — inte en skyldig.' },
  exercise:   { together: 'Gör en liten sak ni faktiskt kan hålla.',  solo: 'Gör en liten sak du faktiskt kan hålla.' },
};

const STEP_CTA_KEYS: Record<string, string> = {
  opening: 'card_view.cta_opening',
  reflective: 'card_view.cta_reflective',
  scenario: 'card_view.cta_scenario',
  exercise: 'card_view.cta_exercise',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isRevisitMode = searchParams.get('revisit') === 'true';

  // Detect resume navigation — suppress entry animations on first paint
  const isResumed = (location.state as { resumed?: boolean } | null)?.resumed === true;
  const [suppressEntryAnim] = useState(() => isResumed);
  // Clear navigation state after first read so back-navigation animates normally
  useEffect(() => {
    if (isResumed) {
      window.history.replaceState({ ...window.history.state, usr: { resumed: false } }, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { t } = useTranslation();
  const {
    getConversationForCard,
    saveConversation,
    getCardById,
    getCategoryById,
    cards,
    // NOTE: currentSession, startSession, completeSessionStep, pauseSession
    // are REMOVED — all session authority comes from normalizedSession.
  } = useApp();
  const { space } = useCoupleSpaceContext();
  const devState = useDevState();

  // ─── Normalized session state — the ONLY session authority ───
  const normalizedSession = useNormalizedSessionContext();
  const { isTogether } = useTogetherMode();

  const isActiveSession = !!(normalizedSession.sessionId && normalizedSession.cardId === cardId);

  // Retained so the takeaway screen has a session ID after the session closes
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    devState ? 'dev-session' : null
  );
  useEffect(() => {
    if (isActiveSession && normalizedSession.sessionId) {
      setActiveSessionId(normalizedSession.sessionId);
    }
  }, [isActiveSession, normalizedSession.sessionId]);

  // ─── Completed session check ───
  const [hasCompletedNormalizedSession, setHasCompletedNormalizedSession] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

  // showCompletion: session just finished — takeaway ritual before archive
  const [showCompletion, setShowCompletion] = useState(
    devState === 'completed' ? true : false
  );

  useEffect(() => {
    if (devState) return;
    if (!space || !cardId) return;
    supabase
      .from('couple_sessions')
      .select('id')
      .eq('couple_space_id', space.id)
      .eq('card_id', cardId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setHasCompletedNormalizedSession(!!data);
        setCompletedSessionId(data?.id ?? null);
      });
  }, [space, cardId, devState, showCompletion]);

  // ─── Auto-show completion when session disappears post-lock ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (activeSessionId && !normalizedSession.sessionId && !normalizedSession.loading && !showCompletion) {
      setShowCompletion(true);
    }
  }, [activeSessionId, normalizedSession.sessionId, normalizedSession.loading, isRevisitMode, showCompletion]);

  // Volume 1: single-writer model, reflection surface always active

  // ─── Auto-activate session when entering a card in live mode ───
  // If another card's session is active, soft-complete it first, then activate for this card.
  const activatingRef = useRef(false);
  useEffect(() => {
    if (devState || isRevisitMode || showCompletion) return;
    if (normalizedSession.loading || isActiveSession) return;
    if (activatingRef.current) return;
    if (!space?.id || !cardId) return;
    // Don't activate if there's already a completed session for this card
    if (hasCompletedNormalizedSession) return;

    const card = getCardById(cardId);
    if (!card) return;

    activatingRef.current = true;

    (async () => {
      try {
        // If there's an active session for a DIFFERENT card, abandon it first (not "complete")
        if (normalizedSession.sessionId && normalizedSession.cardId !== cardId) {
          const { error: abandonErr } = await supabase.rpc('abandon_active_session', {
            p_session_id: normalizedSession.sessionId,
          });

          if (abandonErr) {
            console.warn('abandon_active_session failed:', abandonErr.message);
          }
        }

        // Activate the new session
        const { error } = await supabase.rpc('activate_couple_session', {
          p_couple_space_id: space.id,
          p_category_id: card.categoryId,
          p_card_id: cardId,
          p_step_count: STEP_ORDER.length,
        });
        if (error) {
          console.error('Session activation failed:', error);
          toastErrorOnce('activate_session_fail', 'Kunde inte starta samtalet');
        } else {
          await normalizedSession.refetch();
        }
      } finally {
        activatingRef.current = false;
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devState, isRevisitMode, showCompletion, normalizedSession.loading, isActiveSession, normalizedSession.sessionId, space?.id, cardId, hasCompletedNormalizedSession]);
  

  // ─── Sanitize URL: strip revisit=true when an active session exists ───
  useEffect(() => {
    if (isRevisitMode && isActiveSession) {
      const cleaned = new URLSearchParams(searchParams);
      cleaned.delete('revisit');
      const qs = cleaned.toString();
      navigate(`/card/${cardId}${qs ? `?${qs}` : ''}`, { replace: true });
    }
  }, [isRevisitMode, isActiveSession, searchParams, cardId, navigate]);

  // ─── Single resolver — the only gate for which surface mounts ───
  const cardViewMode: CardViewMode = resolveCardViewMode({
    isRevisitMode,
    hasActiveSession: isActiveSession,
    hasCompletedSessionForCard: hasCompletedNormalizedSession,
    showCompletion,
  });

  // ─── Step index ───
  const initialRevisitStep = (() => {
    const stepParam = searchParams.get('step');
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < STEP_ORDER.length) return parsed;
    }
    return 0;
  })();
  const [revisitStepIndex, setRevisitStepIndex] = useState(initialRevisitStep);

  // ─── Local display step (live mode) ───
  // Null = follow normalizedSession.currentStepIndex (server authority).
  // Set to a number to display a previous step without touching the server.
  // __sc_dev_step: screenshot capture param that forces a specific step (dev only)
  const scDevStep = (() => {
    const raw = searchParams.get('__sc_dev_step');
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return !isNaN(n) ? n : null;
  })();
  const [localStepIndex, setLocalStepIndex] = useState<number | null>(scDevStep);

  // ─── Sub-prompt index within current stage ───
  // Tracks which prompt within a section is currently displayed.
  // Resets to 0 whenever the stage changes.
  const [localPromptIndex, setLocalPromptIndex] = useState(0);

  // Reset local override whenever the server advances (e.g. after refetch)
  const serverStepIndex = normalizedSession.currentStepIndex;
  useEffect(() => {
    setLocalStepIndex(null);
    setLocalPromptIndex(0);
  }, [serverStepIndex]);

  const focusNoteParam = searchParams.get('focusNote');
  const promptParam = searchParams.get('prompt');
  const initialFocusNote = (() => {
    const raw = focusNoteParam ?? promptParam;
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : null;
  })();

  const currentStepIndex =
    cardViewMode === 'revisit'
      ? revisitStepIndex
      : (localStepIndex ?? serverStepIndex);

  // ─── DEV-ONLY debug strip ───
  const _devDebug = isDevToolsEnabled() && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', color: '#0f0', fontSize: 10, fontFamily: 'monospace', padding: '4px 8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <span>mode={cardViewMode}</span>
      <span>active={String(isActiveSession)}</span>
      <span>sid={normalizedSession.sessionId?.slice(0,8) ?? '∅'}</span>
      <span>nCard={normalizedSession.cardId ?? '∅'}</span>
      <span>rCard={cardId}</span>
      <span>completed={String(hasCompletedNormalizedSession)}</span>
      <span>cSid={completedSessionId?.slice(0,8) ?? '∅'}</span>
      <span>step={currentStepIndex}/{serverStepIndex}</span>
      <span>revisit={String(isRevisitMode)}</span>
      <span>loading={String(normalizedSession.loading)}</span>
      <span>showComp={String(showCompletion)}</span>
    </div>
  );

  // ─── Stage interstitial (micro-moment between depth layers) ───
  const [showInterstitial, setShowInterstitial] = useState(false);
  const prevStepRef = useRef(currentStepIndex);

  // Track whether first render has passed (to allow interstitial after resume)
  const firstRenderRef = useRef(true);
  useEffect(() => { firstRenderRef.current = false; }, []);

  useEffect(() => {
    if (cardViewMode !== 'live') return;
    // Skip interstitial on the very first render when resuming
    if (prevStepRef.current !== currentStepIndex && currentStepIndex > 0) {
      if (!firstRenderRef.current) {
        setShowInterstitial(true);
        const timer = setTimeout(() => setShowInterstitial(false), 700);
        prevStepRef.current = currentStepIndex;
        return () => clearTimeout(timer);
      }
    }
    prevStepRef.current = currentStepIndex;
  }, [currentStepIndex, cardViewMode]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);
  

  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // ─── Save conversation for local resume (live mode only) ───
  useEffect(() => {
    if (cardViewMode !== 'live') return;
    const card = cardId ? getCardById(cardId) : undefined;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) saveConversation(card.id, currentSection.id, currentStepIndex);
    }
  }, [currentStepIndex, cardId, cardViewMode, getCardById, saveConversation]);

  // ─── Handle step completion / advance ───
  // If the user is viewing a previous step (local < server), just advance locally.
  // If at the real frontier, call the RPC then clear the local override (refetch drives it).
  const handleCompleteStep = useCallback(async () => {
    if (cardViewMode !== 'live') return;

    const displayIndex = localStepIndex ?? serverStepIndex;
    const atFrontier = displayIndex >= serverStepIndex;

    // Navigating forward through an already-completed step — no RPC needed
    if (!atFrontier) {
      setLocalStepIndex(displayIndex + 1);
      return;
    }

    // DevState: advance locally without RPC (no real session exists)
    if (devState) {
      if (displayIndex >= STEP_ORDER.length - 1) {
        setShowCompletion(true);
      } else {
        setLocalStepIndex(displayIndex + 1);
      }
      return;
    }

    if (!normalizedSession.sessionId) return;

    const { data, error } = await supabase.rpc('complete_couple_session_step', {
      p_session_id: normalizedSession.sessionId,
      p_step_index: displayIndex,
    });

    if (error) {
      console.error('Step completion error:', error);
      toastErrorOnce('step_complete_fail', 'Kunde inte markera steget som klart');
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.is_session_complete) {
      setShowCompletion(true);
      return;
    }

    // Refetch → server increments → useEffect resets localStepIndex → re-render
    await normalizedSession.refetch();
  }, [normalizedSession, localStepIndex, serverStepIndex, cardViewMode, devState]);

  // ─── Revisit "Next" handler ───
  const handleRevisitNext = (card: ReturnType<typeof getCardById>) => {
    if (!card) return;
    if (revisitStepIndex < STEP_ORDER.length - 1) {
      const next = revisitStepIndex + 1;
      setRevisitStepIndex(next);
      const promptSuffix = initialFocusNote !== null ? `&prompt=${initialFocusNote}` : '';
      navigate(`/card/${card.id}?revisit=true&step=${next}${promptSuffix}`, { replace: true });
    } else {
      const category = getCardById(card.id) ? getCategoryById(card.categoryId) : undefined;
      navigate(category ? `/category/${category.id}` : '/');
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Early exits (card not found)
  // ─────────────────────────────────────────────────────────────
  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;

  if (!card) {
    return (
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="h-14 border-b border-border bg-card" />
        <div className="px-6 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">{t('card_view.not_found')}</p>
        </div>
      </div>
    );
  }

  // ─── Post-completion navigation (Case A / B) ───────────────────
  // Case A: more unexplored topics remain in this category → /category/:id
  // Case B: this was the last topic → /categories
  const postCompletionDestination = (() => {
    if (!category) return '/categories';
    const categoryCards = cards.filter(c => c.categoryId === category.id);
    const remainingCards = categoryCards.filter(c => c.id !== card.id);
    return remainingCards.length > 0 ? `/category/${category.id}` : '/categories';
  })();

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'history' — completed session archive view
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'history') {
    return (
      <CompletedSessionView
        cardId={card.id}
        cardTitle={card.title}
        categoryId={category?.id}
        categoryTitle={category?.title}
        onExploreAgain={() => navigate(postCompletionDestination)}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'guard' — paired but no active session
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'guard') {
    return (
      <div className="min-h-screen page-bg">
        <Header title={category?.title} showBack backTo="/" />
        <div className="px-6 pt-title-above pb-16 max-w-md mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: BEAT_3, ease: EASE }}
            className="space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">Inget aktivt samtal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ni behöver föreslå och acceptera detta samtal innan ni kan börja.
            </p>
          </motion.div>
          <button
            onClick={() => navigate('/')}
            className="cta-primary gap-2"
          >
            <Home className="w-4 h-4" />
            Tillbaka till Hem
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — session just finished, takeaway ritual
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion') {
    return (
      <motion.div
        className="min-h-screen page-bg"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
      >
        <Header title={category?.title} showBack backTo="/" />
        <div className="px-6 pt-title-above pb-16">

          {/* Heading — grounded, intentional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: BEAT_3, ease: EASE }}
            className="text-center max-w-md mx-auto"
            style={{ paddingTop: 24 }}
          >
            <h2 className="text-display text-foreground">Det ni just gjorde betyder något.</h2>
          </motion.div>

          {/* Takeaway input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
            className="max-w-md mx-auto mt-10 space-y-3"
          >
            <p className="text-body text-muted-foreground/70 text-center leading-relaxed">
              Vad vill ni bära med er?
            </p>
            <SessionTakeaway sessionId={activeSessionId} />
          </motion.div>

          {/* CTAs — exhale pause before exit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3, duration: BEAT_3, ease: EASE }}
            className="max-w-md mx-auto mt-16 flex flex-col items-center gap-4"
          >
            <button
              onClick={() => navigate(category ? `/category/${category.id}` : '/categories')}
              className="cta-primary"
            >
              Fortsätt utforska
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="text-sm transition-opacity hover:opacity-100"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
            >
              Till översikten
            </button>
          </motion.div>

        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'live' | 'revisit' — active conversation surface
  // ─────────────────────────────────────────────────────────────
  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
  const isLive = cardViewMode === 'live';

  const exitBackTo = category ? `/category/${category.id}` : '/';

  const handleSessionExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => navigate(exitBackTo), 300);
  };

  return (
    <>
    {_devDebug}
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-base)' }}
      initial={
        suppressEntryAnim
          ? { opacity: 0 }
          : isLive
            ? { opacity: 0, scale: 0.97 }
            : false
      }
      animate={isExiting ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
      transition={
        isExiting
          ? { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
          : suppressEntryAnim
            ? { duration: 0.12, ease: [0.4, 0.0, 0.2, 1] }
            : { duration: 0.28, ease: [0.4, 0.0, 0.2, 1] }
      }
    >
      <StageInterstitial visible={showInterstitial} />
      <Header
        title={category?.title}
        showBack
        backTo={exitBackTo}
        variant="immersive"
        onImmersiveBack={undefined}
        onLeaveSession={isLive ? () => navigate('/') : undefined}
      />

      {/* Step progress — neutral text only */}
      {cardViewMode === 'live' && (
        <motion.div
          className="px-6 pt-6 pb-2"
          initial={isLive && !suppressEntryAnim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: isLive && !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
        >
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={Array.from({ length: serverStepIndex }, (_, i) => i)}
          />
          {currentSection && STEP_RITUAL_HINTS[currentSection.type] && (
            <p className="mt-4 text-center text-[11px] tracking-wide" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>
              {isTogether
                ? STEP_RITUAL_HINTS[currentSection.type].together
                : STEP_RITUAL_HINTS[currentSection.type].solo}
            </p>
          )}
        </motion.div>
      )}

      <div className="px-6 pb-8" style={{ paddingTop: 'calc(var(--space-title-above) + 24px)' }}>
        <motion.h1
          initial={suppressEntryAnim ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: BEAT_3, ease: EASE }}
          className="text-xl md:text-2xl font-serif text-center"
          style={{ color: 'var(--color-text-primary)', lineHeight: '1.7' }}
        >
          {card.title}
        </motion.h1>
        {cardViewMode === 'revisit' && (
          <div className="mt-3 text-center">
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
              {completedSessionId ? 'Visar tidigare samtal' : 'Förhandskoll'}
            </p>
          </div>
        )}
        {card.subtitle && (
          <motion.p
            initial={suppressEntryAnim ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: suppressEntryAnim ? 0 : BEAT_1, duration: BEAT_3, ease: EASE }}
            className="text-sm not-italic mt-4 text-center max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>

      {/* Section content — centered, max 520px for readability */}
      <div className="px-6 pb-8 relative">
        <div className="max-w-[520px] mx-auto">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Step 3 — Prompt: delay BEAT_1, duration BEAT_3 (live only) */}
              <motion.div
                initial={isLive && !suppressEntryAnim ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isLive && !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
              >
                <SectionView
                  ref={sectionViewRef}
                  section={currentSection}
                  card={card}
                  isRevisitMode={cardViewMode === 'revisit'}
                  initialFocusNoteIndex={cardViewMode === 'revisit' ? initialFocusNote : null}
                  focusPromptIndex={cardViewMode === 'revisit' ? initialFocusNote : null}
                  disableShare={isActiveSession}
                  promptIndex={cardViewMode === 'live' ? localPromptIndex : undefined}
                />
              </motion.div>

              {/* ── MODE: live — session reflection (single writer) ── */}
              {cardViewMode === 'live' && cardId && (() => {
                const sectionPromptCount = currentSection.prompts?.length ?? 1;
                const isLastPromptInStage = localPromptIndex >= sectionPromptCount - 1;
                const isLastStage = currentStepIndex >= STEP_ORDER.length - 1;

                return (
                  <>
                    {/* Step 4 — Reflection box: delay BEAT_2, duration BEAT_3 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
                    >
                      <SessionStepReflection
                        sessionId={normalizedSession.sessionId}
                        stepIndex={currentStepIndex}
                        isLastStep={isLastStage && isLastPromptInStage}
                        onLocked={async () => {
                          if (isLastPromptInStage) {
                            await handleCompleteStep();
                          } else {
                            setLocalPromptIndex(localPromptIndex + 1);
                          }
                        }}
                        onBack={() => {
                          if (localPromptIndex > 0) {
                            setLocalPromptIndex(localPromptIndex - 1);
                          } else if (currentStepIndex > 0) {
                            const prevStageIndex = currentStepIndex - 1;
                            const prevSection = card.sections.find(
                              s => s.type === STEP_ORDER[prevStageIndex]
                            );
                            const prevPromptCount = prevSection?.prompts?.length ?? 1;
                            setLocalStepIndex(prevStageIndex);
                            setLocalPromptIndex(prevPromptCount - 1);
                          } else {
                            navigate('/');
                          }
                        }}
                      />
                    </motion.div>
                  </>
                );
              })()}

              {/* ── MODE: revisit — saved reflection + step navigation ── */}
              {cardViewMode === 'revisit' && (
                <motion.div
                  className="pb-8 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
                >
                  {/* Read-only saved reflection (only when revisiting a completed card) */}
                  {completedSessionId && (
                    <LockedReflectionDisplay
                      sessionId={completedSessionId}
                      stepIndex={currentStepIndex}
                    />
                  )}

                  <div className="pt-6 space-y-4">
                    <button
                      onClick={() => handleRevisitNext(card)}
                      className="cta-primary gap-2"
                    >
                      {currentStepIndex >= STEP_ORDER.length - 1 ? 'Klar' : 'Nästa'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 text-[12px] transition-colors"
                        style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Se sammanfattning
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <ReviewDrawer
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                card={card}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
    </>
  );
}
