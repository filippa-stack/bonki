// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastOnce, toastErrorOnce } from '@/lib/toastOnce';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';

import StageInterstitial from '@/components/StageInterstitial';

import { ArrowRight } from 'lucide-react';

import CompletedSessionView from '@/components/CompletedSessionView';
import LockedReflectionDisplay from '@/components/LockedReflectionDisplay';

import GorTillsammansOverlay, { hasSeenGorTillsammans } from '@/components/GorTillsammansOverlay';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { isDevToolsEnabled } from '@/lib/devTools';
// samtalsläge removed from UI — always defaults to Tillsammans
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { BEAT_1, BEAT_2, BEAT_3, EASE, PRESS, PAGE, EMOTION } from '@/lib/motion';

const COMPLETION_MESSAGES = [
  'Det här samtalet tillhör er.',
  'Ni tog er tid för varandra.',
  'Det ni just gjorde betyder något.',
  'Ni lyssnade. Det är mer än de flesta gör.',
  'Varje samtal är ett val. Ni valde rätt.',
  'Det är inte självklart. Men ni gjorde det.',
  'Ni var här. Helt och hållet.',
  'Det räcker. Det mer än räcker.',
];

// ─────────────────────────────────────────────────────────────
// Card view mode — the single source of truth for which surface mounts.
//
//   'live'       → active session, SessionStepReflection visible
//   'archive'    → read-only view from Era samtal (from=archive)
//   'completion' → session just finished, takeaway screen
// ─────────────────────────────────────────────────────────────
type CardViewMode = 'live' | 'archive' | 'completion';

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
  const isFromArchive = searchParams.get('from') === 'archive';

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

  // ─── Completed session check (for count only, not gating) ───
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [completedSessionCount, setCompletedSessionCount] = useState(0);

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
        setCompletedSessionId(data?.id ?? null);
      });
    // Count all completed sessions in this space for message rotation
    supabase
      .from('couple_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ count }) => {
        setCompletedSessionCount(count ?? 0);
      });
  }, [space, cardId, devState, showCompletion]);

  // ─── Auto-show completion when session disappears post-lock ───
  useEffect(() => {
    if (isFromArchive) return;
    if (activeSessionId && !normalizedSession.sessionId && !normalizedSession.loading && !showCompletion) {
      setShowCompletion(true);
    }
  }, [activeSessionId, normalizedSession.sessionId, normalizedSession.loading, isFromArchive, showCompletion]);

  // Volume 1: single-writer model, reflection surface always active

  // ─── Auto-activate session when entering a card ───
  // Always creates a new session. If another card's session is active, abandon it first.
  const activatingRef = useRef(false);
  useEffect(() => {
    if (devState || isFromArchive || showCompletion) return;
    if (normalizedSession.loading || isActiveSession) return;
    if (activatingRef.current) return;
    if (!space?.id || !cardId) return;

    const card = getCardById(cardId);
    if (!card) return;

    activatingRef.current = true;

    (async () => {
      try {
        // If there's an active session for a DIFFERENT card, abandon it first
        const didSwitch = !!(normalizedSession.sessionId && normalizedSession.cardId !== cardId);
        if (didSwitch) {
          if (isDevToolsEnabled()) console.log('[switch] abandon called', normalizedSession.sessionId);
          const { error: abandonErr } = await supabase.rpc('abandon_active_session', {
            p_session_id: normalizedSession.sessionId,
          });

          if (abandonErr) {
            console.warn('abandon_active_session failed:', abandonErr.message);
          }
        }

        if (isDevToolsEnabled()) console.log('[switch] activate called', cardId);
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
          if (isDevToolsEnabled()) console.log('[switch] navigated to', `/card/${cardId}`, didSwitch ? '(switched)' : '(fresh)');
          await normalizedSession.refetch();
          if (didSwitch) {
            toastOnce('switch_card', () => toast('Bytte samtal. Det förra är sparat i Vårt utrymme.', { duration: 2500 }));
          }
        }
      } finally {
        activatingRef.current = false;
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devState, isFromArchive, showCompletion, normalizedSession.loading, isActiveSession, normalizedSession.sessionId, space?.id, cardId]);

  // ─── Single resolver ───
  const cardViewMode: CardViewMode = (() => {
    if (showCompletion) return 'completion';
    if (isFromArchive) return 'archive';
    return 'live';
  })();

  // ─── Step index ───
  // Archive mode: use step param from URL
  const initialArchiveStep = (() => {
    const stepParam = searchParams.get('step');
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < STEP_ORDER.length) return parsed;
    }
    return 0;
  })();
  const [archiveStepIndex, setArchiveStepIndex] = useState(initialArchiveStep);

  // ─── Local display step (live mode) ───
  const scDevStep = (() => {
    const raw = searchParams.get('__sc_dev_step');
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return !isNaN(n) ? n : null;
  })();
  const [localStepIndex, setLocalStepIndex] = useState<number | null>(scDevStep);

  // ─── Sub-prompt index within current stage ───
  const [localPromptIndex, setLocalPromptIndex] = useState(0);

  // Reset local override whenever the server advances
  const serverStepIndex = normalizedSession.currentStepIndex;
  useEffect(() => {
    setLocalStepIndex(null);
    setLocalPromptIndex(0);
  }, [serverStepIndex]);

  // ─── Session start screen — ritual gate before first question ───
  // Skip if resuming mid-session or in archive/completion mode
  const [hasStarted, setHasStarted] = useState(() => {
    if (isResumed || isFromArchive) return true;
    if (devState) return false;
    return false;
  });
  // Auto-skip start screen when server says we're past step 0
  useEffect(() => {
    if (serverStepIndex > 0 && !hasStarted) setHasStarted(true);
  }, [serverStepIndex, hasStarted]);

  const currentStepIndex =
    cardViewMode === 'archive'
      ? archiveStepIndex
      : (localStepIndex ?? serverStepIndex);

  // ─── DEV-ONLY debug strip (disabled — never visible) ───
  const _devDebug = null;

  // ─── Stage interstitial (micro-moment between depth layers) ───
  const [showInterstitial, setShowInterstitial] = useState(false);
  const prevStepRef = useRef(currentStepIndex);

  const firstRenderRef = useRef(true);
  useEffect(() => { firstRenderRef.current = false; }, []);

  useEffect(() => {
    if (cardViewMode !== 'live') return;
    if (prevStepRef.current !== currentStepIndex && currentStepIndex > 0) {
      if (!firstRenderRef.current) {
        setShowInterstitial(true);
        const timer = setTimeout(() => setShowInterstitial(false), 500);
        prevStepRef.current = currentStepIndex;
        return () => clearTimeout(timer);
      }
    }
    prevStepRef.current = currentStepIndex;
  }, [currentStepIndex, cardViewMode]);

  const [isExiting, setIsExiting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
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
  const pendingRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCompleteStep = useCallback(async () => {
    if (cardViewMode !== 'live') return;

    const displayIndex = localStepIndex ?? serverStepIndex;
    const atFrontier = displayIndex >= serverStepIndex;

    if (!atFrontier) {
      setLocalStepIndex(displayIndex + 1);
      return;
    }

    // DevState: advance locally without RPC
    if (devState) {
      if (displayIndex >= STEP_ORDER.length - 1) {
        setShowCompletion(true);
      } else {
        setLocalStepIndex(displayIndex + 1);
      }
      return;
    }

    // ── Guard: ensure we have a valid session before writing ──
    let sessionId = normalizedSession.sessionId;

    if (!sessionId) {
      const card = getCardById(cardId);
      if (space?.id && card) {
        if (isDevToolsEnabled()) console.log('[step-complete] no sessionId — attempting activate');
        const { error: actErr } = await supabase.rpc('activate_couple_session', {
          p_couple_space_id: space.id,
          p_category_id: card.categoryId,
          p_card_id: cardId,
          p_step_count: STEP_ORDER.length,
        });
        if (!actErr) {
          await normalizedSession.refetch();
          sessionId = normalizedSession.sessionId;
        }
      }

      if (!sessionId) {
        if (isDevToolsEnabled()) console.warn('[step-complete] no session after retry — advancing locally');
        if (displayIndex >= STEP_ORDER.length - 1) {
          setShowCompletion(true);
        } else {
          setLocalStepIndex(displayIndex + 1);
        }
        toastOnce('step_retry', () =>
          toast('Vi sparar så fort vi kan. Fortsätt bara.', { duration: 2500 })
        );
        return;
      }
    }

    const rpcParams = {
      p_session_id: sessionId,
      p_step_index: displayIndex,
    };

    if (isDevToolsEnabled()) {
      console.log('[step-complete] RPC params:', rpcParams);
      console.log('[step-complete] context:', {
        couple_space_id: space?.id ?? null,
        cardViewMode,
        appMode: normalizedSession.appMode,
        normalizedCardId: normalizedSession.cardId,
        routeCardId: cardId,
      });
    }

    // Always advance UI immediately
    const isLastStep = displayIndex >= STEP_ORDER.length - 1;

    const attemptRpc = async (attempt: number): Promise<boolean> => {
      const { data, error } = await supabase.rpc('complete_couple_session_step', rpcParams);
      if (error) {
        if (isDevToolsEnabled()) {
          console.error(`[step-complete] attempt ${attempt} FULL ERROR:`, JSON.stringify(error, null, 2));
        }
        return false;
      }
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.is_session_complete) {
        setShowCompletion(true);
      }
      return true;
    };

    const ok = await attemptRpc(1);
    if (ok) {
      if (!isLastStep) setLocalStepIndex(displayIndex + 1);
      await normalizedSession.refetch();
      return;
    }

    // RPC failed — advance UI anyway
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      setLocalStepIndex(displayIndex + 1);
    }
    toastOnce('step_retry', () =>
      toast('Vi sparar så fort vi kan. Fortsätt bara.', { duration: 2500 })
    );

    const retryInBackground = (remaining: number) => {
      if (remaining <= 0) return;
      pendingRetryRef.current = setTimeout(async () => {
        const retryOk = await attemptRpc(3 - remaining + 1);
        if (retryOk) {
          normalizedSession.refetch();
        } else if (remaining > 1) {
          retryInBackground(remaining - 1);
        }
      }, 1500);
    };
    retryInBackground(2);
  }, [normalizedSession, localStepIndex, serverStepIndex, cardViewMode, devState]);

  // ─── Archive "Next" handler ───
  const handleArchiveNext = (card: ReturnType<typeof getCardById>) => {
    if (!card) return;
    if (archiveStepIndex < STEP_ORDER.length - 1) {
      const next = archiveStepIndex + 1;
      setArchiveStepIndex(next);
      navigate(`/card/${card.id}?from=archive&step=${next}`, { replace: true });
    } else {
      navigate('/shared');
    }
  };

  // ─── GÖR TILLSAMMANS one-time overlay ───
  const [showGorTillsammans, setShowGorTillsammans] = useState(false);
  const preCardStageType = STEP_ORDER[currentStepIndex];
  const preCardIsExercise = preCardStageType === 'exercise';
  useEffect(() => {
    const isLiveMode = cardViewMode === 'live';
    if (isLiveMode && preCardIsExercise && !hasSeenGorTillsammans()) {
      setShowGorTillsammans(true);
    } else {
      setShowGorTillsammans(false);
    }
  }, [cardViewMode, preCardIsExercise]);

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

  // ─── Post-completion navigation ───
  const postCompletionDestination = (() => {
    if (!category) return '/';
    const categoryCards = cards.filter(c => c.categoryId === category.id);
    const remainingCards = categoryCards.filter(c => c.id !== card.id);
    return remainingCards.length > 0 ? `/category/${category.id}` : '/';
  })();

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — session just finished, takeaway ritual
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion') {
    return (
      <motion.div
        className="min-h-screen"
        style={{ backgroundColor: 'hsl(36, 28%, 93%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
      >
        <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
          <Header title={card.title} showBack backTo={category ? `/category/${category.id}` : '/'} />
        </div>
        <div className="px-6 pt-title-above pb-16">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md mx-auto"
            style={{ paddingTop: 24, marginBottom: '40px' }}
          >
            <h2
              className="font-serif"
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: 'var(--accent-saffron)',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]}
            </h2>
          </motion.div>

          {/* Takeaway prompt */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto"
          >
            <p
              className="font-serif italic text-center"
              style={{ fontSize: '18px', color: 'var(--color-text-primary)', opacity: 0.75, marginBottom: '16px' }}
            >
              Vad tar ni med er?
            </p>
          </motion.div>

          {/* Takeaway field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto"
          >
            <CompletionTakeaway sessionId={activeSessionId} spaceId={space?.id ?? null} />
          </motion.div>

          {/* Archive link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={() => navigate('/shared')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                fontSize: '10px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-tertiary)',
                opacity: 0.40,
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginTop: '24px',
                padding: '8px 0',
              }}
            >
              Se reflektionerna i Era samtal
            </button>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto flex flex-col items-center"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              onClick={() => navigate(category ? `/category/${category.id}` : '/categories')}
              className="cta-primary"
              style={{ maxWidth: '220px', width: '100%', marginTop: '32px' }}
            >
              Nästa samtal
            </button>
            <button
              onClick={() => navigate('/')}
              className="type-meta transition-opacity hover:opacity-60 mt-8"
              style={{ color: 'var(--color-text-secondary)', opacity: 0.35 }}
            >
              Stäng
            </button>
          </motion.div>

        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'live' | 'archive' — conversation surface
  // ─────────────────────────────────────────────────────────────
  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
  const currentStageType = STEP_ORDER[currentStepIndex];
  const isReflectionStep = currentStageType === 'opening' || currentStageType === 'reflective';
  const isLive = cardViewMode === 'live';
  const isExerciseStep = currentStageType === 'exercise';


  // ─── Session start screen — ritual before first question ───
  const showStartScreen = isLive && currentStepIndex === 0 && localPromptIndex === 0 && !hasStarted;

  if (showStartScreen) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'hsl(36, 20%, 95%)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Category name */}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            opacity: 0.5,
            marginBottom: '8px',
          }}
        >
          {category?.title}
        </span>

        {/* Topic title */}
        <h1
          className="font-serif"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '32px',
          }}
        >
          {card.title}
        </h1>

        {/* Divider */}
        <div
          style={{
            width: '32px',
            height: '1px',
            background: 'var(--color-text-ghost)',
            margin: '0 auto 32px',
          }}
        />

        {/* Instructions */}
        <p
          className="font-serif"
          style={{
            fontSize: '19px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          Ni behöver bara närvaro.
        </p>
        <p
          className="font-serif"
          style={{
            fontSize: '19px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          Läs frågorna högt för varandra.
        </p>

        {/* Start button */}
        <button
          onClick={() => setHasStarted(true)}
          className="cta-primary"
          style={{ width: '60%', maxWidth: '280px' }}
        >
          Vi är redo.
        </button>

        {/* Sub-text */}
        <p
          className="font-serif"
          style={{
            fontSize: '14px',
            color: 'var(--accent-text)',
            textAlign: 'center',
            marginTop: '20px',
            opacity: 0.65,
          }}
        >
          Inget av det ni delar lämnar det här rummet.
        </p>
      </motion.div>
    );
  }

  const exitBackTo = isFromArchive ? '/shared' : (category ? `/category/${category.id}` : '/');

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
      style={{
        backgroundColor: isLive && isReflectionStep ? 'hsl(36, 22%, 92%)' : 'hsl(36, 20%, 95%)',
        transition: 'background-color 0.6s ease',
      }}
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
          ? { duration: PAGE, ease: [...EASE] }
          : suppressEntryAnim
            ? { duration: PRESS, ease: [...EASE] }
            : { duration: PAGE, ease: [...EASE] }
      }
    >
      <StageInterstitial visible={showInterstitial} />
      <Header
        title={card?.title ?? category?.title}
        showBack
        backTo={exitBackTo}
        variant="immersive"
        isDarkSurface={isReflectionStep}
        onImmersiveBack={isLive ? (() => {
          // Step back through prompts → stages → confirmation at step 0
          const displayIndex = localStepIndex ?? serverStepIndex;
          if (localPromptIndex > 0) {
            setLocalPromptIndex(localPromptIndex - 1);
          } else if (displayIndex > 0) {
            const prevStageIndex = displayIndex - 1;
            const prevSection = card.sections.find(
              s => s.type === STEP_ORDER[prevStageIndex]
            );
            const prevPromptCount = prevSection?.prompts?.length ?? 1;
            setLocalStepIndex(prevStageIndex);
            setLocalPromptIndex(prevPromptCount - 1);
          } else {
            setShowLeaveConfirm(true);
          }
        }) : () => navigate(exitBackTo)}
        onLeaveSession={isLive ? () => setShowLeaveConfirm(true) : undefined}
      />

      {/* Step progress — centered horizontal dots (live only) */}
      {isLive && (
        <motion.div
          style={{ paddingTop: '16px', marginTop: '20px' }}
          initial={!suppressEntryAnim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
        >
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={Array.from({ length: serverStepIndex }, (_, i) => i)}
            isTransitioning={showInterstitial}
          />
        </motion.div>
      )}

      {/* Section content — centered, max 520px for readability */}
      <div className="px-6 pt-4 relative" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-[520px] mx-auto">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0.4, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Prompt content */}
              <motion.div
                initial={isLive && !suppressEntryAnim ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isLive && !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
              >
                <SectionView
                  ref={sectionViewRef}
                  section={currentSection}
                  card={card}
                  isRevisitMode={cardViewMode === 'archive'}
                  initialFocusNoteIndex={null}
                  focusPromptIndex={null}
                  disableShare={isActiveSession}
                  promptIndex={isLive ? localPromptIndex : undefined}
                  coupleSpaceId={space?.id ?? null}
                  sessionId={normalizedSession.sessionId ?? null}
                  cardId={cardId ?? null}
                  stageIndex={currentStepIndex}
                  isLive={isLive}
                  isReflectionStep={isReflectionStep}
                />
              </motion.div>

              {/* ── Ritual hint (live only) ── */}
              {isLive && (() => {
                const stageKey = STEP_ORDER[currentStepIndex];
                const hint = STEP_RITUAL_HINTS[stageKey];
                if (!hint) return null;
                return (
                  <div style={{ marginTop: '20px', marginBottom: '0' }} className="text-center">
                    <p
                      className="font-serif italic"
                      style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', opacity: 0.55 }}
                    >
                      {isTogether ? hint.together : hint.solo}
                    </p>
                  </div>
                );
              })()}

              {/* ── MODE: live — session reflection (single writer) ── */}
              {isLive && cardId && (() => {
                const sectionPromptCount = currentSection.prompts?.length ?? 1;
                const isLastPromptInStage = localPromptIndex >= sectionPromptCount - 1;
                const isLastStage = currentStepIndex >= STEP_ORDER.length - 1;

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
                  >
                    <SessionStepReflection
                      key={`${currentStepIndex}-${localPromptIndex}`}
                      sessionId={normalizedSession.sessionId}
                      stepIndex={currentStepIndex}
                      promptIndex={localPromptIndex}
                      isLastStep={isLastStage && isLastPromptInStage}
                      isFirstVisit={false}
                      isReflectionStep={isReflectionStep}
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
                          setShowLeaveConfirm(true);
                        }
                      }}
                    />
                  </motion.div>
                );
              })()}

              {/* ── MODE: archive — read-only saved reflection ── */}
              {cardViewMode === 'archive' && (
                <motion.div
                  className="pb-8 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
                >
                  {completedSessionId && (
                    <LockedReflectionDisplay
                      sessionId={completedSessionId}
                      stepIndex={currentStepIndex}
                    />
                  )}

                  <div className="pt-6 space-y-4">
                    <button
                      onClick={() => handleArchiveNext(card)}
                      className="cta-primary gap-2"
                    >
                      {currentStepIndex >= STEP_ORDER.length - 1 ? 'Klar' : 'Nästa'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>

    {/* GÖR TILLSAMMANS one-time overlay */}
    <AnimatePresence>
      {showGorTillsammans && (
        <GorTillsammansOverlay onDismiss={() => setShowGorTillsammans(false)} />
      )}
    </AnimatePresence>

    {/* Leave session confirmation */}
    <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-lg">Avsluta samtalet?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            Era svar sparas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel>Fortsätt</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => navigate(exitBackTo)}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Avsluta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

/* ─── Inline takeaway for completion screen ─── */
const TAKEAWAY_AUTOSAVE = 800;

function CompletionTakeaway({ sessionId, spaceId }: { sessionId: string | null; spaceId: string | null }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [rowId, setRowId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = user?.id;

  const handleChange = useCallback((value: string) => {
    setText(value);
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!sessionId || !userId || !spaceId) return;
      if (rowId) {
        await supabase.from('couple_takeaways').update({ content: value } as any).eq('id', rowId);
      } else if (value.trim()) {
        const { data } = await supabase
          .from('couple_takeaways')
          .insert({ session_id: sessionId, couple_space_id: spaceId, content: value, created_by: userId } as any)
          .select('id')
          .single();
        if (data) setRowId(data.id);
      }
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    }, TAKEAWAY_AUTOSAVE);
  }, [sessionId, userId, spaceId, rowId]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Skriv något ni vill bära med er."
        rows={3}
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        enterKeyHint="done"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '100px',
          backgroundColor: 'hsl(36, 24%, 93%)',
          border: '1px solid hsl(36, 20%, 82%)',
          borderRadius: '14px',
          padding: '20px',
          fontFamily: 'var(--font-serif)',
          fontSize: '17px',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          resize: 'none' as const,
          outline: 'none',
          boxSizing: 'border-box' as const,
        }}
        className="placeholder:font-serif placeholder:italic placeholder:text-[16px] placeholder:text-[var(--text-ghost)]"
      />
      <span style={{ display: 'block', textAlign: 'right', fontSize: '10px', color: 'rgba(0,0,0,0.25)', marginTop: '4px', paddingRight: '4px' }}>
        {status === 'saving' ? 'Sparar…' : status === 'saved' ? 'Sparad' : '\u00A0'}
      </span>
    </div>
  );
}
