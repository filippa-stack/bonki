// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

import { ArrowRight, ArrowLeft } from 'lucide-react';

import CompletedSessionView from '@/components/CompletedSessionView';
import LockedReflectionDisplay from '@/components/LockedReflectionDisplay';

import GorTillsammansOverlay, { hasSeenGorTillsammans } from '@/components/GorTillsammansOverlay';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { isDevToolsEnabled } from '@/lib/devTools';
// samtalsläge removed from UI — always defaults to Tillsammans
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { BEAT_1, BEAT_2, BEAT_3, EASE, PRESS, PAGE, EMOTION } from '@/lib/motion';
import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

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

/**
 * Returns the effective prompt count for a section, matching SectionView's
 * rendering logic. Content is shown as preamble (not an extra prompt step).
 */
function getEffectivePromptCount(section: { type: string; content?: string; prompts?: unknown[] } | undefined): number {
  if (!section) return 1;
  return section.prompts?.length ?? (section.content ? 1 : 1);
}

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
  const { markCompleted: markCardCompleted } = useOptimisticCompletions();

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
  const [showCompletion, _setShowCompletion] = useState(
    devState === 'completed' ? true : false
  );
  // Wrapper that also marks the card as optimistically completed
  const setShowCompletion = useCallback((val: boolean) => {
    _setShowCompletion(val);
    if (val && cardId) {
      markCardCompleted(cardId);
    }
  }, [cardId, markCardCompleted]);

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

  // ─── Stale/orphan session detection ───
  const [staleSession, setStaleSession] = useState(false);
  const staleCheckedRef = useRef(false);
  useEffect(() => {
    if (staleCheckedRef.current || devState || isFromArchive) return;
    if (!normalizedSession.sessionId || normalizedSession.loading) return;
    if (normalizedSession.cardId !== cardId) return;

    staleCheckedRef.current = true;

    (async () => {
      const { data } = await supabase
        .from('couple_sessions')
        .select('created_at')
        .eq('id', normalizedSession.sessionId!)
        .maybeSingle();

      if (!data?.created_at) return;

      const ageMs = Date.now() - new Date(data.created_at).getTime();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (ageMs > THIRTY_DAYS) {
        setStaleSession(true);
      }
    })();
  }, [normalizedSession.sessionId, normalizedSession.loading, normalizedSession.cardId, cardId, devState, isFromArchive]);

  const handleAbandonAndRestart = useCallback(async () => {
    if (!normalizedSession.sessionId || !space?.id || !cardId) return;
    const card = getCardById(cardId);
    if (!card) return;

    await supabase.rpc('abandon_active_session', { p_session_id: normalizedSession.sessionId });
    const { error } = await supabase.rpc('activate_couple_session', {
      p_couple_space_id: space.id,
      p_category_id: card.categoryId,
      p_card_id: cardId,
      p_step_count: STEP_ORDER.length,
    });
    if (!error) {
      await normalizedSession.refetch();
      setStaleSession(false);
    }
  }, [normalizedSession.sessionId, space?.id, cardId, getCardById]);

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
  // showStartScreen is a pure UX gate, decoupled from session state.
  // Set true on mount for live mode; only cleared by explicit user tap.
  const [showStartScreen, setShowStartScreen] = useState(() => {
    if (isResumed || isFromArchive) return false;
    if (devState === 'completed') return false;
    // Always show start screen when entering a card in live mode
    return true;
  });

  const hasStarted = !showStartScreen;

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
  const completingRef = useRef(false);

  const handleCompleteStep = useCallback(async () => {
    if (cardViewMode !== 'live') return;
    if (completingRef.current) return;
    completingRef.current = true;
    try {

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

    // ── Always fetch fresh session ID to avoid stale/abandoned references ──
    let sessionId: string | null = null;
    {
      const { data: freshState } = await supabase.rpc('get_active_session_state');
      const row = Array.isArray(freshState) ? freshState[0] : freshState;
      sessionId = row?.session_id ?? null;
    }

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
          const { data: freshState } = await supabase.rpc('get_active_session_state');
          const row = Array.isArray(freshState) ? freshState[0] : freshState;
          sessionId = row?.session_id ?? null;
          normalizedSession.refetch();
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

    const isSessionInactive = (err: any) =>
      err?.message?.includes('session_not_active') || err?.code === 'P0001' && err?.message?.includes('session_not_active');

    const attemptRpc = async (attempt: number): Promise<'ok' | 'session_inactive' | 'error'> => {
      const { data, error } = await supabase.rpc('complete_couple_session_step', rpcParams);
      if (error) {
        if (isDevToolsEnabled()) {
          console.error(`[step-complete] attempt ${attempt} FULL ERROR:`, JSON.stringify(error, null, 2));
        }
        if (isSessionInactive(error)) return 'session_inactive';
        return 'error';
      }
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.is_session_complete) {
        setShowCompletion(true);
      }
      return 'ok';
    };

    const result = await attemptRpc(1);

    if (result === 'session_inactive') {
      // Session was abandoned/replaced — try to recover with the current active session
      if (isDevToolsEnabled()) console.log('[step-complete] session_inactive — attempting recovery');
      const { data: freshState } = await supabase.rpc('get_active_session_state');
      const row = Array.isArray(freshState) ? freshState[0] : freshState;
      const freshSessionId = row?.session_id ?? null;

      if (freshSessionId && freshSessionId !== sessionId && row?.card_id === cardId) {
        // We have a valid active session for THIS card — retry with it
        if (isDevToolsEnabled()) console.log('[step-complete] recovered fresh sessionId:', freshSessionId);
        const { data: retryData, error: retryErr } = await supabase.rpc('complete_couple_session_step', {
          p_session_id: freshSessionId,
          p_step_index: displayIndex,
        });
        if (!retryErr) {
          const retryResult = Array.isArray(retryData) ? retryData[0] : retryData;
          if (retryResult?.is_session_complete) {
            setShowCompletion(true);
          } else if (!isLastStep) {
            setLocalStepIndex(displayIndex + 1);
          }
          normalizedSession.refetch();
          return;
        }
      }

      // If recovery failed or session is for a different card, redirect home
      navigate('/');
      toastOnce('session_ended', () =>
        toast('Din session avslutades. Ni kan fortsätta härifrån.', {
          duration: 4000,
          style: {
            background: 'var(--surface-base)',
            color: 'var(--color-text-primary)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        })
      );
      return;
    }

    if (result === 'ok') {
      if (isLastStep) {
        // Always show completion on the last step — single-writer model
        // doesn't require partner gating.
        setShowCompletion(true);
      } else {
        setLocalStepIndex(displayIndex + 1);
      }
      await normalizedSession.refetch();
      return;
    }

    // Generic error — advance UI anyway
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      setLocalStepIndex(displayIndex + 1);
    }
    toastOnce('step_retry', () =>
      toast('Något gick fel. Försök igen.', {
        duration: 4000,
        style: {
          background: 'var(--surface-base)',
          color: 'var(--color-text-primary)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
      })
    );

    const retryInBackground = (remaining: number) => {
      if (remaining <= 0) return;
      pendingRetryRef.current = setTimeout(async () => {
        const retryResult = await attemptRpc(3 - remaining + 1);
        if (retryResult === 'session_inactive') {
          navigate('/');
          toastOnce('session_ended', () =>
            toast('Din session avslutades. Ni kan fortsätta härifrån.', {
              duration: 4000,
              style: {
                background: 'var(--surface-base)',
                color: 'var(--color-text-primary)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
            })
          );
        } else if (retryResult === 'ok') {
          normalizedSession.refetch();
        } else if (remaining > 1) {
          retryInBackground(remaining - 1);
        }
      }, 1500);
    };
    retryInBackground(2);
    } finally {
      completingRef.current = false;
    }
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

  // ─── Post-completion navigation (hooks before early return) ───
  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;

  const [completedCardIds, setCompletedCardIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!space?.id) return;
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (data) {
          setCompletedCardIds(new Set(data.map((r: any) => r.card_id).filter(Boolean)));
        }
      });
  }, [space?.id, cardViewMode]);

  const postCompletionNav = useMemo(() => {
    if (!category || !card) return { type: 'home' as const, destination: '/', label: '' };

    const categoryCards = cards.filter(c => c.categoryId === category.id);
    const effectiveCompleted = new Set(completedCardIds);
    effectiveCompleted.add(card.id);

    const nextIncompleteInCategory = categoryCards.find(c => !effectiveCompleted.has(c.id));

    if (nextIncompleteInCategory) {
      return { type: 'next_card' as const, destination: `/card/${nextIncompleteInCategory.id}`, label: 'Nästa samtal' };
    }

    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      if (catId === category.id) continue;
      const catCards = cards.filter(c => c.categoryId === catId);
      const hasIncomplete = catCards.some(c => !effectiveCompleted.has(c.id));
      if (hasIncomplete) {
        return { type: 'next_category' as const, destination: `/category/${catId}`, label: 'Nästa ämne' };
      }
    }

    return { type: 'all_complete' as const, destination: '/', label: '' };
  }, [category, card, cards, completedCardIds]);

  // ─────────────────────────────────────────────────────────────
  //  Early exit (card not found)
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — session just finished, takeaway ritual
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion') {
    return (
      <motion.div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--surface-base)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
          <Header title="" showBack backTo={category ? `/category/${category.id}` : '/'} />
        </div>
        <div className="px-6 pb-16 relative" style={{ paddingTop: '32px' }}>
          {/* Back arrow — return to last step */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3, duration: EMOTION }}
            style={{ position: 'absolute', top: '12px', left: '6px', zIndex: 2 }}
          >
            <button
              onClick={() => {
                _setShowCompletion(false);
                const lastStageIndex = STEP_ORDER.length - 1;
                const lastSection = card.sections.find(s => s.type === STEP_ORDER[lastStageIndex]);
                const lastPromptCount = getEffectivePromptCount(lastSection);
                setLocalStepIndex(lastStageIndex);
                setLocalPromptIndex(lastPromptCount - 1);
              }}
              aria-label="Tillbaka till sista steget"
              style={{
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px',
              }}
            >
              <ArrowLeft
                size={20}
                style={{
                  color: 'var(--text-tertiary)',
                  opacity: 0.45,
                }}
              />
            </button>
          </motion.div>

          {/* Temporal release */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md mx-auto"
            style={{ marginBottom: '24px', paddingTop: 32 }}
          >
            <p style={{
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'var(--text-tertiary)',
              opacity: 0.50,
            }}>
              Bra jobbat.
            </p>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md mx-auto"
            style={{ marginBottom: '48px' }}
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

          {/* Takeaway field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto"
          >
            <CompletionTakeaway sessionId={activeSessionId} spaceId={space?.id ?? null} />
          </motion.div>

          {/* CTAs — cascading reveal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto flex flex-col items-center"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
          >
            {postCompletionNav.type === 'all_complete' ? (
              <div className="text-center" style={{ marginTop: '40px' }}>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'var(--accent-text)',
                }}>
                  Ni har utforskat allt. För nu.
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  opacity: 0.60,
                  marginTop: '8px',
                }}>
                  Korten öppnar sig igen när ni är redo.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px' }}
              >
                <button
                  onClick={() => navigate(postCompletionNav.destination)}
                  className="cta-primary"
                  style={{ maxWidth: '220px', width: '100%' }}
                >
                  {postCompletionNav.label}
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: EMOTION }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <button
                onClick={() => navigate('/')}
                className="type-meta transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-tertiary)', opacity: 0.35, marginTop: '24px' }}
              >
                Till översikten
              </button>

              {/* Archive shortcut */}
              <button
                onClick={() => navigate('/shared')}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  opacity: 0.55,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '16px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Se era anteckningar
              </button>

              {/* Quiet exit */}
              <button
                onClick={() => navigate('/')}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: 'var(--text-ghost)',
                  opacity: 0.40,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '8px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Avsluta för idag
              </button>
            </motion.div>
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
  const shouldShowStartScreen = showStartScreen && isLive;

  if (shouldShowStartScreen) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'var(--surface-base)', position: 'relative' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
      >
        {/* Back navigation */}
        <motion.button
          onClick={() => navigate(category ? `/category/${category.id}` : '/')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_2, duration: EMOTION }}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            minHeight: '44px',
            minWidth: '88px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            opacity: 0.55,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Välj samtal
        </motion.button>

        {/* Category name */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: EMOTION, ease: [...EASE] }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            opacity: 0.5,
            marginBottom: '8px',
          }}
        >
          {category?.title}
        </motion.span>

        {/* Topic title */}
        <motion.h1
          className="font-serif"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BEAT_1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '32px',
          }}
        >
          {card.title}
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: BEAT_2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '32px',
            height: '1px',
            background: 'var(--text-ghost)',
            margin: '0 auto 32px',
          }}
        />

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: BEAT_2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: '0' }}
        >
          <p
            className="font-serif"
            style={{
              fontSize: '20px',
              color: 'var(--text-primary)',
              opacity: 0.80,
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Ni behöver bara närvaro.
          </p>
          <p
            className="font-serif"
            style={{
              fontSize: '20px',
              color: 'var(--text-primary)',
              opacity: 0.80,
              textAlign: 'center',
              marginBottom: '0',
            }}
          >
            Läs frågorna högt för varandra.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: BEAT_3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: '200px', height: '1px', background: 'var(--text-ghost)', margin: '20px auto' }}
        />

        {/* Mechanics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_3, duration: EMOTION, ease: [...EASE] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
        >
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.65, textAlign: 'center' }}>
            Prata om frågorna tillsammans.
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.65, textAlign: 'center' }}>
            En av er antecknar det ni vill minnas.
          </p>
        </motion.div>

        {/* Orphan/stale session banner */}
        {staleSession && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: EMOTION, ease: [...EASE] }}
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--surface-sunken)',
              borderBottom: '1px solid hsl(var(--neutral-300))',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              marginBottom: '12px',
              lineHeight: 1.5,
            }}>
              Det verkar som att ett tidigare samtal inte avslutades. Vill ni fortsätta det eller börja om?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => { setStaleSession(false); setShowStartScreen(false); }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  padding: '8px 16px',
                  background: 'none',
                  border: '1px solid hsl(var(--neutral-300))',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                Fortsätt
              </button>
              <button
                onClick={handleAbandonAndRestart}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  padding: '8px 16px',
                  background: 'var(--text-primary)',
                  color: 'var(--surface-base)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Börja om
              </button>
            </div>
          </motion.div>
        )}

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => setShowStartScreen(false)}
            className="cta-primary"
            style={{ width: '60vw', maxWidth: '280px' }}
          >
            Vi är redo.
          </button>
        </motion.div>

        {/* Sub-text */}
        <motion.p
          className="font-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: EMOTION, ease: [...EASE] }}
          style={{
            fontSize: '14px',
            color: 'var(--accent-text)',
            textAlign: 'center',
            marginTop: '20px',
            opacity: 0.65,
          }}
        >
          Inget av det ni delar lämnar det här rummet.
        </motion.p>
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
        backgroundColor: 'var(--surface-base)',
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
        isDarkSurface={isReflectionStep || currentStageType === 'scenario' || isExerciseStep}
        onImmersiveBack={isLive ? undefined : () => navigate(exitBackTo)}
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
            completedSteps={Array.from({ length: currentStepIndex }, (_, i) => i)}
            isTransitioning={showInterstitial}
          />
        </motion.div>
      )}

      {/* Section content — centered, max 520px for readability */}
      <div className="px-6 relative" style={{ paddingTop: '8px', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-[520px] mx-auto">
        <AnimatePresence mode="wait">
          {!currentSection && (
            <motion.div
              key="question-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  style={{
                    width: '80%',
                    height: '20px',
                    backgroundColor: 'hsl(var(--neutral-300) / 0.6)',
                    borderRadius: '4px',
                    animation: 'skeletonPulse 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    width: '60%',
                    height: '20px',
                    backgroundColor: 'hsl(var(--neutral-300) / 0.6)',
                    borderRadius: '4px',
                    animation: 'skeletonPulse 2s ease-in-out infinite',
                    animationDelay: '0.3s',
                  }}
                />
              </div>
            </motion.div>
          )}
          {currentSection && (
            <motion.div
              key={`${currentSection.id}-${localPromptIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            >
              {/* Stage label — archive mode only */}
              {cardViewMode === 'archive' && (() => {
                const STAGE_LABELS: Record<number, string> = {
                  0: 'KOM IGÅNG',
                  1: 'GÅ DJUPARE',
                  2: 'FÖRESTÄLL ER',
                  3: 'I VERKLIGHETEN',
                };
                const label = STAGE_LABELS[currentStepIndex];
                if (!label) return null;
                return (
                  <p style={{
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-tertiary)',
                    opacity: 0.45,
                    textAlign: 'center',
                    marginBottom: '12px',
                    marginTop: '16px',
                  }}>
                    {label}
                  </p>
                );
              })()}

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
                  isExerciseStep={isExerciseStep}
                  showBackArrow={isLive && !(currentStepIndex === 0 && localPromptIndex === 0)}
                  onBack={isLive ? (() => {
                    if (localPromptIndex > 0) {
                      setLocalPromptIndex(localPromptIndex - 1);
                    } else if (currentStepIndex > 0) {
                      const prevStageIndex = currentStepIndex - 1;
                      const prevSection = card.sections.find(
                        s => s.type === STEP_ORDER[prevStageIndex]
                      );
                      const prevPromptCount = getEffectivePromptCount(prevSection);
                      setLocalStepIndex(prevStageIndex);
                      setLocalPromptIndex(prevPromptCount - 1);
                    }
                  }) : undefined}
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
                      style={{ fontSize: '17px', color: 'var(--accent-text)', opacity: 0.55 }}
                    >
                      {isTogether ? hint.together : hint.solo}
                    </p>
                  </div>
                );
              })()}

              {/* ── MODE: live — session reflection (single writer) ── */}
              {isLive && cardId && (() => {
                const sectionPromptCount = getEffectivePromptCount(currentSection);
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
                      isExerciseStep={isExerciseStep}
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
                          const prevPromptCount = getEffectivePromptCount(prevSection);
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
                  className="pb-8"
                  style={{ padding: '0 8px' }}
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

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button
                      onClick={() => handleArchiveNext(card)}
                      className="cta-primary gap-2"
                      style={{ width: '60%', margin: '0 auto' }}
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
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = user?.id;

  const hasFill = text.trim().length > 0;

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
    <div className="completion-takeaway-wrapper">
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Skriv något ni vill bära med er."
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        enterKeyHint="done"
        className={`w-full resize-none focus:outline-none focus:ring-0 ${hasFill ? 'text-left' : 'text-center'}`}
        style={{
          display: 'block',
          width: '100%',
          height: isFocused || hasFill ? 'auto' : '88px',
          minHeight: '88px',
          maxHeight: '240px',
          overflow: 'auto',
          backgroundColor: isFocused || hasFill
            ? 'var(--surface-raised)'
            : 'var(--surface-sunken)',
          border: 'none',
          borderTop: isFocused
            ? '1.5px solid var(--accent-saffron)'
            : '1px solid hsl(var(--neutral-300))',
          borderBottom: isFocused
            ? '1.5px solid var(--accent-saffron)'
            : '1px solid hsl(var(--neutral-300))',
          borderRadius: 0,
          padding: '16px 0 12px 0',
          fontFamily: hasFill ? 'var(--font-sans)' : 'var(--font-serif)',
          fontSize: hasFill ? '15px' : '17px',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          boxShadow: 'none',
          transition: 'background-color 200ms ease, border-top 200ms ease, border-bottom 200ms ease',
        }}
      />
      <style>{`
        .completion-takeaway-wrapper textarea::placeholder {
          font-family: 'Cormorant Garamond', serif !important;
          font-style: normal !important;
          font-size: 16px !important;
          color: var(--accent-text) !important;
          opacity: 0.75 !important;
          text-align: center !important;
          transition: opacity 300ms ease !important;
        }
        .completion-takeaway-wrapper textarea:focus::placeholder {
          opacity: 0 !important;
        }
      `}</style>
      <span style={{ display: 'block', textAlign: 'center', fontSize: '10px', color: 'var(--text-ghost)', marginTop: '4px' }}>
        {status === 'saving' ? 'Sparar…' : status === 'saved' ? 'Sparad' : '\u00A0'}
      </span>
    </div>
  );
}
