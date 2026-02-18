// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';

import ReviewDrawer from '@/components/ReviewDrawer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RotateCcw, BookOpen, Check } from 'lucide-react';
import SessionTakeaway from '@/components/SessionTakeaway';
import CompletedSessionView from '@/components/CompletedSessionView';

import { useProposalsContext, type Proposal } from '@/contexts/ProposalsContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Början',
  reflective: 'Fördjupning',
  scenario: 'I vardagen',
  exercise: 'Tillsammans',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS = ['Början', 'Fördjupning', 'I vardagen', 'Tillsammans'];

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
  const { user } = useAuth();
  const { memberCount, space } = useCoupleSpaceContext();
  const devState = useDevState();

  // ─── Normalized session state — the ONLY session authority ───
  const normalizedSession = useNormalizedSessionContext();

  // Derive active session state from normalized context
  const isActiveSession = !!(normalizedSession.sessionId && normalizedSession.cardId === cardId);
  const currentStepIndexFromSession = normalizedSession.currentStepIndex;

  // Active session ID for takeaways on the completion screen
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    devState ? 'dev-session' : null
  );

  // Track session ID from normalized context
  useEffect(() => {
    if (isActiveSession && normalizedSession.sessionId) {
      setActiveSessionId(normalizedSession.sessionId);
    }
  }, [isActiveSession, normalizedSession.sessionId]);

  // Whether the card has a completed session in couple_sessions (normalized)
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
      .then(({ data }) => {
        setHasCompletedNormalizedSession(!!data);
      });
  }, [space, cardId, devState]);

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // ─── Step index: driven entirely by normalized session ───
  // For revisit mode, use local navigation; otherwise follow normalized step
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

  // The step the user sees
  const currentStepIndex = isRevisitMode ? revisitStepIndex : currentStepIndexFromSession;

  // Waiting state from normalized session
  const userCompletedCurrentStep = !isRevisitMode && normalizedSession.waiting;

  // ─── Determine if card is fully explored ───
  const isFullyExplored = hasCompletedNormalizedSession;

  // ─── Determine initial view state ───
  const isReturningUser = !!(isActiveSession || existingConversation);

  // View gates
  const [showCompletion, setShowCompletion] = useState(
    devState === 'completed' ? true :
    !isRevisitMode && isReturningUser && isFullyExplored
  );

  // Dev state: force waiting view
  const devWaiting = devState === 'waiting';
  
  const [reviewOpen, setReviewOpen] = useState(false);

  const sectionViewRef = useRef<SectionViewHandle>(null);

  const { proposals } = useProposalsContext();

  // ─── Proposal gate ───
  const isPaired = memberCount >= 2;
  const hasAcceptedProposal = !!(cardId && proposals.some(
    p => p.card_id === cardId && p.status === 'accepted'
  ));

  // ─── Save conversation for local resume ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) {
        saveConversation(card.id, currentSection.id, currentStepIndex);
      }
    }
  }, [currentStepIndex, card, isRevisitMode, saveConversation]);

  // ─── Show completion when normalized session ends ───
  useEffect(() => {
    if (isRevisitMode) return;
    // If session was active but now null/completed, show completion
    if (!showCompletion && isFullyExplored) {
      setShowCompletion(true);
    }
  }, [isFullyExplored, isRevisitMode, showCompletion]);

  // ─── Auto-show completion when session status becomes completed ───
  useEffect(() => {
    if (isRevisitMode) return;
    // activeSessionId was set, but normalized session shows no active session → completed
    if (activeSessionId && !normalizedSession.sessionId && !normalizedSession.loading && !showCompletion) {
      setShowCompletion(true);
    }
  }, [activeSessionId, normalizedSession.sessionId, normalizedSession.loading, isRevisitMode, showCompletion]);

  // ─── Handle step completion via RPC ───
  const handleCompleteStep = useCallback(async () => {
    if (!normalizedSession.sessionId || isRevisitMode) return;

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

    // Refetch normalized state to pick up changes
    await normalizedSession.refetch();
  }, [normalizedSession, currentStepIndex, isRevisitMode, navigate]);

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

  // ─── CARD ENTRY GUARD ───
  // If paired, not revisit, not completed, and no matching active session → block
  const needsSessionGuard =
    isPaired &&
    !isRevisitMode &&
    !showCompletion &&
    !isFullyExplored &&
    !normalizedSession.loading &&
    !isActiveSession;

  if (needsSessionGuard) {
    return (
      <div className="min-h-screen page-bg">
        <Header title={category?.title} showBack backTo="/" />
        <div className="px-6 pt-24 pb-16 max-w-md mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">
              Inget aktivt samtal
            </h2>
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

  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);

  // ─── Handle "Next" press ───
  const handleNextStep = () => {
    if (isRevisitMode) {
      if (revisitStepIndex < STEP_ORDER.length - 1) {
        const next = revisitStepIndex + 1;
        setRevisitStepIndex(next);
        const promptParam_ = initialFocusNote !== null ? `&prompt=${initialFocusNote}` : '';
        navigate(`/card/${card.id}?revisit=true&step=${next}${promptParam_}`, { replace: true });
      } else {
        navigate(category ? `/category/${category.id}` : '/');
      }
      return;
    }

    // Solo gate: no step completion when unpaired
    if (!isPaired) return;

    // Complete step via normalized RPC
    handleCompleteStep();
  };

  // ─── History view: returning to a fully-explored card with no active session ───
  const isHistoryView = showCompletion && !activeSessionId;

  if (isHistoryView && card && cardId) {
    return (
      <CompletedSessionView
        cardId={cardId}
        cardTitle={card.title}
        categoryId={category?.id}
        categoryTitle={category?.title}
        onExploreAgain={() => {
          // In normalized model, new sessions are only started via proposal flow
          // Navigate to home where user can propose a new session
          navigate('/');
        }}
      />
    );
  }

  // ─── Completion screen (just finished — active session still open) ───
  if (showCompletion) {
    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo="/"
        />
        <div className="px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-center max-w-md mx-auto space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">
              Ta en stund.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Det ni just delade får landa. Här kan ni skriva en gemensam sammanfattning om ni vill.
            </p>
          </motion.div>

          {/* Takeaways — card-level closing ritual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.15 }}
            className="max-w-md mx-auto mt-12 space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Vill ni formulera något att ta med er?
            </p>
            <SessionTakeaway sessionId={activeSessionId} />
          </motion.div>

          {/* Navigation actions — single primary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.15 }}
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

  // ─── Active conversation view ───
  return (
    <div className="min-h-screen page-bg">
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Progress indicator — hidden in revisit/preview mode */}
      {!isRevisitMode && (
        <div className="px-4 pt-6 pb-4 border-b border-border/15">
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={[]} // Normalized model tracks completions server-side
          />
        </div>
      )}

      <div className="px-6 pt-16 pb-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-xl md:text-2xl font-serif text-foreground text-center leading-relaxed"
        >
          {card.title}
        </motion.h1>
        {isRevisitMode && (
          <div className="mt-4 text-center space-y-0.5">
            <p className="text-[11px] text-muted-foreground/50 tracking-wide">Förhandskoll</p>
          </div>
        )}
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.03, duration: 0.15 }}
            className="text-sm text-muted-foreground not-italic mt-5 text-center max-w-2xl mx-auto leading-relaxed"
          >
            {card.subtitle}
          </motion.p>
        )}

        {/* Proposal creation is only allowed from the Home IDLE proposal mode surface. */}
      </div>


      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Waiting state — partner hasn't completed this step yet */}
              {isPaired && !isRevisitMode && userCompletedCurrentStep && !devWaiting && (
                <p className="text-xs text-muted-foreground/50 text-center mb-6">
                  Väntar på att din partner ska markera steget som klart.
                </p>
              )}

              <SectionView ref={sectionViewRef} section={currentSection} card={card} isRevisitMode={isRevisitMode} initialFocusNoteIndex={isRevisitMode ? initialFocusNote : null} focusPromptIndex={isRevisitMode ? initialFocusNote : null} disableShare={isActiveSession} />

              {/* Session-driven reflection for paired users */}
              {isPaired && !isRevisitMode && cardId && (
                <SessionStepReflection
                  cardId={cardId}
                  stepIndex={currentStepIndex}
                  onLocked={async () => {
                    await handleCompleteStep();
                    if (currentStepIndex >= STEP_ORDER.length - 1) {
                      setShowCompletion(true);
                    }
                  }}
                />
              )}

              {/* Final-step hint — only on exercise (step 3) for paired users */}
              {isPaired && !isRevisitMode && currentStepIndex === 3 && (
                <p className="text-xs text-muted-foreground/40 text-center mt-4">
                  När ni båda är klara kan ni formulera något gemensamt.
                </p>
              )}

              {/* Solo / revisit: keep legacy step CTA */}
              {(!isPaired || isRevisitMode) && (
                <div className="pt-10 pb-8 space-y-5">
                  <Button
                    onClick={handleNextStep}
                    size="lg"
                    className="gap-2 h-14 font-normal w-full rounded-2xl"
                  >
                    {isRevisitMode
                      ? (currentStepIndex >= STEP_ORDER.length - 1 ? 'Klar' : 'Nästa')
                      : t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {(currentStepIndex > 0 || isRevisitMode) && (
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
                </div>
              )}

              {/* Review drawer */}
              <ReviewDrawer open={reviewOpen} onClose={() => setReviewOpen(false)} card={card} activeStepIndex={currentStepIndex} completedSteps={[]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
