// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';

import ReviewDrawer from '@/components/ReviewDrawer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, BookOpen } from 'lucide-react';
import SessionTakeaway from '@/components/SessionTakeaway';
import CompletedSessionView from '@/components/CompletedSessionView';

import { useProposalsContext } from '@/contexts/ProposalsContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
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
}: {
  isRevisitMode: boolean;
  hasActiveSession: boolean;
  hasCompletedSessionForCard: boolean;
}): CardViewMode {
  if (isRevisitMode) return 'revisit';
  if (hasActiveSession) return 'live';
  if (hasCompletedSessionForCard) return 'history';
  return 'live';
}

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

const STEP_RITUAL_HINTS: Record<string, { together: string; solo: string }> = {
  opening:    { together: 'Börja mjukt. Inga rätt eller fel.',        solo: 'Börja mjukt. Inget rätt eller fel.' },
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
  const [searchParams] = useSearchParams();
  const isRevisitMode = searchParams.get('revisit') === 'true';
  const { t } = useTranslation();
  const {
    getConversationForCard,
    saveConversation,
    getCardById,
    getCategoryById,
    // NOTE: currentSession, startSession, completeSessionStep, pauseSession
    // are REMOVED — all session authority comes from normalizedSession.
  } = useApp();
  const { memberCount, space } = useCoupleSpaceContext();
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
  useEffect(() => {
    if (devState) return;
    if (!space || !cardId) return;
    supabase
      .from('couple_sessions')
      .select('id')
      .eq('couple_space_id', space.id)
      .eq('card_id', cardId)
      .eq('status', 'completed')
      .limit(1)
      .single()
      .then(({ data }) => setHasCompletedNormalizedSession(!!data));
  }, [space, cardId, devState]);

  // showCompletion: session just finished — takeaway ritual before archive
  const [showCompletion, setShowCompletion] = useState(
    devState === 'completed' ? true : false
  );

  // ─── Auto-show completion when session disappears post-lock ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (activeSessionId && !normalizedSession.sessionId && !normalizedSession.loading && !showCompletion) {
      setShowCompletion(true);
    }
  }, [activeSessionId, normalizedSession.sessionId, normalizedSession.loading, isRevisitMode, showCompletion]);

  const isPaired = memberCount >= 2;

  // ─── Single resolver — the only gate for which surface mounts ───
  const cardViewMode: CardViewMode = resolveCardViewMode({
    isRevisitMode,
    hasActiveSession: isActiveSession,
    hasCompletedSessionForCard: hasCompletedNormalizedSession,
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
  const focusNoteParam = searchParams.get('focusNote');
  const promptParam = searchParams.get('prompt');
  const initialFocusNote = (() => {
    const raw = focusNoteParam ?? promptParam;
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : null;
  })();

  const currentStepIndex =
    cardViewMode === 'revisit' ? revisitStepIndex : normalizedSession.currentStepIndex;

  // ─── Misc ───
  const [reviewOpen, setReviewOpen] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);
  const { proposals } = useProposalsContext();

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

  // ─── Handle step completion via RPC ───
  const handleCompleteStep = useCallback(async () => {
    if (!normalizedSession.sessionId || cardViewMode !== 'live') return;

    const { data, error } = await supabase.rpc('complete_couple_session_step', {
      p_session_id: normalizedSession.sessionId,
      p_step_index: currentStepIndex,
    });

    if (error) {
      console.error('Step completion error:', error);
      toast.error('Kunde inte markera steget som klart');
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (result?.partner_left) {
      toast.error('Din partner har lämnat utrymmet');
      navigate('/');
      return;
    }

    if (result?.is_session_complete) {
      setShowCompletion(true);
    }

    await normalizedSession.refetch();
  }, [normalizedSession, currentStepIndex, cardViewMode, navigate]);

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
        onExploreAgain={() => navigate('/')}
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
        <div className="px-6 pt-24 pb-16 max-w-md mx-auto text-center space-y-6">
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
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full h-14 rounded-2xl gap-2 font-normal"
          >
            <Home className="w-4 h-4" />
            Tillbaka till Hem
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — session just finished, takeaway ritual
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion') {
    return (
      <div className="min-h-screen page-bg">
        <Header title={category?.title} showBack backTo="/" />
        <div className="px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: BEAT_3, ease: EASE }}
            className="text-center max-w-md mx-auto space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">Ta en stund.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Det ni just delade får landa. Här kan ni skriva en gemensam sammanfattning om ni vill.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
            className="max-w-md mx-auto mt-12 space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Vill ni formulera något att ta med er?
            </p>
            <SessionTakeaway sessionId={activeSessionId} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
            className="max-w-md mx-auto mt-12 space-y-6 text-center"
          >
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full h-14 rounded-2xl gap-2 font-normal"
            >
              Till Hem
            </Button>
            <div className="pt-4 text-center">
              <button
                onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Läs igen
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'live' | 'revisit' — active conversation surface
  // ─────────────────────────────────────────────────────────────
  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
  const isLive = cardViewMode === 'live';

  return (
    // Step 1 — screen-level fade: 0→1, BEAT_3 (live only; revisit uses existing timing)
    <motion.div
      className="min-h-screen page-bg"
      initial={isLive ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: BEAT_3, ease: EASE }}
    >
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Step 2 — Step label: delay BEAT_1, duration BEAT_3 (live only) */}
      {cardViewMode === 'live' && (
        <motion.div
          className="px-6 pt-6 pb-4 border-b border-border/15"
          initial={isLive ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: isLive ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
        >
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={[]}
          />
          {currentSection && STEP_RITUAL_HINTS[currentSection.type] && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground/40 tracking-wide">
              {isTogether
                ? STEP_RITUAL_HINTS[currentSection.type].together
                : STEP_RITUAL_HINTS[currentSection.type].solo}
            </p>
          )}
        </motion.div>
      )}

      <div className="px-6 pt-16 pb-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: BEAT_3, ease: EASE }}
          className="text-xl md:text-2xl font-serif text-foreground text-center leading-relaxed"
        >
          {card.title}
        </motion.h1>
        {cardViewMode === 'revisit' && (
          <div className="mt-4 text-center space-y-0.5">
            <p className="text-[11px] text-muted-foreground/50 tracking-wide">Förhandskoll</p>
          </div>
        )}
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
            className="text-sm text-muted-foreground not-italic mt-5 text-center max-w-2xl mx-auto leading-relaxed"
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>

      {/* Section content */}
      <div className="px-6 pb-10">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: BEAT_3, ease: EASE }}
            >
              {/* Step 3 — Prompt: delay BEAT_1, duration BEAT_3 (live only) */}
              <motion.div
                initial={isLive ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isLive ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
              >
                <SectionView
                  ref={sectionViewRef}
                  section={currentSection}
                  card={card}
                  isRevisitMode={cardViewMode === 'revisit'}
                  initialFocusNoteIndex={cardViewMode === 'revisit' ? initialFocusNote : null}
                  focusPromptIndex={cardViewMode === 'revisit' ? initialFocusNote : null}
                  disableShare={isActiveSession}
                />
              </motion.div>

              {/* ── MODE: live — paired session reflection ── */}
              {cardViewMode === 'live' && isPaired && cardId && (
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
                      onLocked={async () => {
                        await handleCompleteStep();
                        if (currentStepIndex >= STEP_ORDER.length - 1) {
                          setShowCompletion(true);
                        }
                      }}
                    />
                  </motion.div>
                  {currentStepIndex === 3 && (
                    <p className="text-xs text-muted-foreground/40 text-center mt-4">
                      När ni båda är klara kan ni formulera något gemensamt.
                    </p>
                  )}
                </>
              )}

              {/* ── MODE: revisit or solo — step CTA ── */}
              {(cardViewMode === 'revisit' || !isPaired) && (
                // Step 5 — CTA: delay BEAT_2 after reflection
                <motion.div
                  className="pt-10 pb-8 space-y-5"
                  initial={isLive ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isLive ? BEAT_2 + BEAT_2 : 0, duration: BEAT_3, ease: EASE }}
                >
                  <Button
                    onClick={() => handleRevisitNext(card)}
                    size="lg"
                    className="gap-2 h-14 font-normal w-full rounded-2xl"
                  >
                    {cardViewMode === 'revisit'
                      ? (currentStepIndex >= STEP_ORDER.length - 1 ? 'Klar' : 'Nästa')
                      : t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {(currentStepIndex > 0 || cardViewMode === 'revisit') && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Se sammanfattning
                      </button>
                    </div>
                  )}
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
    </motion.div>
  );
}
