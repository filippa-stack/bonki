import { useState, useEffect, useRef, useCallback } from 'react';
import { getCatchUpState } from '@/lib/catchUpState';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { toast } from 'sonner';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import PauseDialog from '@/components/PauseDialog';
import ReviewDrawer from '@/components/ReviewDrawer';
import ConflictingSessionModal from '@/components/ConflictingSessionModal';
import ProposalSheet from '@/components/ProposalSheet';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RotateCcw, BookOpen, PenLine, Send, Check, Loader2 } from 'lucide-react';
import CardTakeaways from '@/components/CardTakeaways';

import { useProposals } from '@/hooks/useProposals';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Teamwork',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Teamwork'];

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
    currentSession,
    startSession,
    completeSessionStep,
    pauseSession,
    journeyState,
  } = useApp();
  const { user } = useAuth();
  const { memberCount } = useCoupleSpace();

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // ─── Derive per-user completedSteps from journeyState.sessionProgress ───
  const uid = user?.id || 'local';
  const myCompletedSteps: number[] =
    (cardId && journeyState?.sessionProgress?.[cardId]?.perUser?.[uid]?.completedSteps) || [];

  // ─── Shared step index: driven entirely by currentSession ───
  const isActiveSession = !!(currentSession && currentSession.cardId === cardId);
  const sharedStepIndex = isActiveSession ? currentSession!.currentStepIndex : 0;

  // ─── Catch-up: unified helper ensures consistent rules everywhere ───
  const { myFirstUncompletedStep, effectiveStep: effectiveSharedStep, isCatchingUp } =
    getCatchUpState(myCompletedSteps, sharedStepIndex, isActiveSession);

  // ─── Determine if card is fully explored ───
  const isFullyExplored = cardId ? (journeyState?.exploredCardIds?.includes(cardId) ?? false) : false;
  const allStepsCompleted = STEP_ORDER.every((_, i) => myCompletedSteps.includes(i));

  // ─── Determine initial view state ───
  const isReturningUser = !!(isActiveSession || existingConversation);

  // For revisit mode, use local navigation; otherwise follow shared step
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
    // Support both ?focusNote= (legacy) and ?prompt= (new deep link)
    const raw = focusNoteParam ?? promptParam;
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : null;
  })();

  // The step the user sees
  const currentStepIndex = isRevisitMode ? revisitStepIndex : effectiveSharedStep;

  // Has the current user already completed the current shared step?
  const userCompletedCurrentStep = !isRevisitMode && myCompletedSteps.includes(currentStepIndex);

  // View gates
  const [showOverview, setShowOverview] = useState(!isRevisitMode && !isReturningUser);
  const [showReentry, setShowReentry] = useState(
    !isRevisitMode && isReturningUser && !isFullyExplored && !allStepsCompleted
  );
  const [showCompletion, setShowCompletion] = useState(
    !isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted)
  );
  
  
  const [reviewOpen, setReviewOpen] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const proposalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProposalSheet, setShowProposalSheet] = useState(false);

  const { sendProposal } = useProposals();


  // ─── Guard: if there's an active session for a DIFFERENT card, show modal instead of redirect ───
  const hasConflictingSession = !!(currentSession && currentSession.cardId !== cardId);
  const conflictingCard = hasConflictingSession ? getCardById(currentSession!.cardId) : undefined;

  useEffect(() => {
    if (isRevisitMode) return;
    if (hasConflictingSession) {
      setShowConflictModal(true);
    }
  }, [cardId, hasConflictingSession, isRevisitMode]);

  // ─── Save conversation for local resume ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) {
        saveConversation(card.id, currentSection.id, currentStepIndex);
      }
    }
  }, [currentStepIndex, myCompletedSteps.length, card]);

  // ─── Show completion directly when card is fully explored ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (!showCompletion && isFullyExplored) {
      setShowCompletion(true);
    }
  }, [isFullyExplored, isRevisitMode]);

  // ─── Show stage choice when effective step advances (shared or catch-up) ───
  const prevEffectiveStepRef = useRef(effectiveSharedStep);
  useEffect(() => {
    prevEffectiveStepRef.current = effectiveSharedStep;
  }, [effectiveSharedStep]);

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

  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);


  // ─── Handle "Next" press ───
  const handleNextStep = () => {
    if (isRevisitMode) {
      // In revisit mode, just navigate linearly
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

    // Mark the current step as completed for THIS user only
    if (!myCompletedSteps.includes(currentStepIndex)) {
      completeSessionStep(currentStepIndex);
    }
    // UI stays on the same step — shared step will advance when both complete
  };

  const handleStartFromOverview = () => {
    if (card && category && !isActiveSession) {
      startSession(category.id, card.id);
    }
    setShowOverview(false);
  };


  // ─── Completion screen ───
  if (showCompletion) {
    const suggestedCardId = journeyState?.suggestedNextCardId;
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;

    const completionMessageKey = memberCount >= 2
      ? (isFullyExplored
        ? 'card_view.completion_message_together'
        : 'card_view.completion_message_solo')
      : 'card_view.completion_message';

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
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">
              Ta en stund.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Det ni just delade förtjänar att landa.
            </p>
          </motion.div>

          {/* Takeaways — card-level closing ritual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-md mx-auto mt-12 space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Vill ni sammanfatta något att ta med er?
            </p>
            <CardTakeaways cardId={card.id} />
          </motion.div>

          {/* Navigation actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-md mx-auto mt-12 space-y-3 text-center"
          >
            {suggestedCard && suggestedCategory && memberCount >= 2 ? (
              <Button
                onClick={() => setShowProposalSheet(true)}
                disabled={proposalSent}
                size="lg"
                className="w-full gap-2"
              >
                {proposalSent ? (
                  <><Check className="w-4 h-4" /> Förslag skickat</>
                ) : (
                  <>{t('card_view.completion_next', 'Föreslå nästa samtal')} <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            ) : suggestedCard && suggestedCategory ? (
              <Button
                onClick={() => navigate(`/card/${suggestedCard.id}`)}
                size="lg"
                className="w-full gap-2"
              >
                {t('card_view.completion_next', 'Föreslå nästa samtal')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : null}
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              {t('card_view.completion_home', 'Tillbaka till Hem')}
            </Button>
            <Button
              onClick={() => navigate(`/card/${card.id}?revisit=true`)}
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              {t('card_view.completion_revisit', 'Läs igenom igen')}
            </Button>
          </motion.div>
        </div>

        {/* Proposal Sheet */}
        {suggestedCard && suggestedCategory && (
          <ProposalSheet
            open={showProposalSheet}
            onClose={() => setShowProposalSheet(false)}
            cardTitle={suggestedCard.title}
            categoryTitle={suggestedCategory.title}
            onSend={async (msg) => {
              const result = await sendProposal(suggestedCard.id, suggestedCategory.id, msg);
              if (result.ok) {
                setProposalSent(true);
                if (proposalTimer.current) clearTimeout(proposalTimer.current);
                proposalTimer.current = setTimeout(() => setProposalSent(false), 2000);
              } else {
                toast.error('Kunde inte skicka förslaget. Försök igen.');
              }
            }}
          />
        )}
      </div>
    );
  }

  // ─── Re-entry screen ───
  if (showReentry) {
    const resumeStepLabel = STEP_LABELS[currentStepIndex] || STEP_LABELS[0];

    // Determine rejoin state
    const isWaitingForPartner = userCompletedCurrentStep && !isCatchingUp;
    const isBothReady = !userCompletedCurrentStep && !isCatchingUp;

    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo={category ? `/category/${category.id}` : '/'}
        />
        <div className="px-6 pt-14 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center max-w-md mx-auto space-y-7"
          >
            <h1 className="text-2xl font-serif text-foreground leading-snug">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-sm text-muted-foreground not-italic">{card.subtitle}</p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
            >
              {isCatchingUp
                ? 'Din partner har kommit lite längre. Här kan du ta igen det i din egen takt.'
                : isWaitingForPartner
                  ? 'Du är redo. Väntar på din partner.'
                  : 'Ni var mitt i ett samtal. Här kan ni fortsätta där ni slutade.'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-xs text-muted-foreground/60"
            >
              Steg {currentStepIndex + 1} av 4 · {resumeStepLabel}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pt-2 space-y-3"
            >
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => setShowReentry(false)}
              >
                {isCatchingUp
                  ? t('general.catch_up_cta', 'Kom ikapp')
                  : t('card_view.reentry_continue', 'Fortsätt samtalet')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-muted-foreground"
                onClick={() => navigate('/')}
              >
                Lämna för nu
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Overview screen ───
  if (showOverview) {
    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo={category ? `/category/${category.id}` : '/'}
        />

        <div className="px-6 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center max-w-md mx-auto"
          >
            <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-gentle not-italic mb-10 max-w-2xl mx-auto">{card.subtitle}</p>
            )}

            <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
              {t('card_view.overview_description')}
            </p>

            {/* Step overview */}
            <div className="space-y-4 mb-12 text-center">
              {STEP_ORDER.map((stepType, index) => {
                const isFirst = index === 0;
                return (
                  <motion.div
                    key={stepType}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    onClick={isFirst ? handleStartFromOverview : undefined}
                    role={isFirst ? 'button' : undefined}
                    tabIndex={isFirst ? 0 : undefined}
                    onKeyDown={isFirst ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStartFromOverview(); } } : undefined}
                    className={`flex items-center gap-4 p-5 rounded-xl border ${
                      isFirst
                        ? 'bg-primary border-primary cursor-pointer hover:bg-primary/90 transition-colors'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                      isFirst
                        ? 'bg-primary-foreground text-primary font-semibold'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${isFirst ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {sectionTypeLabels[stepType]}
                      </p>
                      <p className={`text-xs mt-0.5 ${isFirst ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {stepType === 'opening' && t('card_view.step_opening_desc')}
                        {stepType === 'reflective' && t('card_view.step_reflective_desc')}
                        {stepType === 'scenario' && t('card_view.step_scenario_desc')}
                        {stepType === 'exercise' && t('card_view.step_exercise_desc')}
                      </p>
                    </div>
                    {isFirst && <ArrowRight className="w-4 h-4 text-primary-foreground shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
            {memberCount >= 2 && (
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto gap-2 mt-3"
                onClick={() => navigate(`/card/${card.id}?revisit=true&step=0`)}
              >
                Förhandskolla själv
              </Button>
            )}
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
            completedSteps={myCompletedSteps}
          />
        </div>
      )}

      <div className="px-6 pt-12 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-xl md:text-2xl font-serif text-foreground text-center leading-snug"
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
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-sm text-gentle not-italic mt-3 text-center max-w-2xl mx-auto"
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>


      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionView ref={sectionViewRef} section={currentSection} card={card} isRevisitMode={isRevisitMode} initialFocusNoteIndex={isRevisitMode ? initialFocusNote : null} focusPromptIndex={isRevisitMode ? initialFocusNote : null} />

              {/* Takeaways removed from exercise step — now rendered on completion screen */}

              {/* Navigation / waiting state */}
              {userCompletedCurrentStep ? (

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  role="status"
                  aria-live="polite"
                  className="my-8 py-8 px-5 rounded-2xl bg-card/40 border border-border/30 text-center space-y-4"
                >
                  <p className="text-sm font-serif text-foreground">
                    Du är klar.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    Ni fortsätter när båda är klara.
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => setReviewOpen(true)}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Granska
                    </Button>

                    <button
                      onClick={() => sectionViewRef.current?.openNoteForCurrent()}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Skriv en tanke
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => navigate('/saved')}
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Mina anteckningar
                    </Button>
                  </div>

                  {/* Takeaways removed — now on completion screen */}

                  <div className="pt-3 flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate('/')}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Tillbaka till Hem
                    </Button>
                    <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                  </div>
                </motion.div>
              ) : (
                <div className="pt-6 pb-6 space-y-4">
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

                  <div className="flex items-center justify-center gap-4">
                    {(currentStepIndex > 0 || isRevisitMode) && (
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {t('card_view.review_edit', 'Se era svar')}
                      </button>
                    )}
                    {!isRevisitMode && (
                      <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                    )}
                  </div>

                  {!isRevisitMode && (
                    <p className="text-[11px] text-muted-foreground/40 leading-relaxed text-center">
                      Svara i er egen takt. Ni fortsätter när båda är klara.
                    </p>
                  )}
                </div>
              )}

              {/* Review drawer */}
              <ReviewDrawer open={reviewOpen} onClose={() => setReviewOpen(false)} card={card} activeStepIndex={currentStepIndex} completedSteps={myCompletedSteps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conflicting session modal */}
      {conflictingCard && (
        <ConflictingSessionModal
          open={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          currentSessionCardTitle={conflictingCard.title}
          currentSessionCardId={conflictingCard.id}
          onSwitchToThisCard={() => {
            if (card && category) {
              pauseSession();
              startSession(category.id, card.id, { force: true });
            }
          }}
        />
      )}

      {/* Proposal Sheet — only triggered from non-revisit step completion or card completion */}
      {card && category && (
        <ProposalSheet
          open={showProposalSheet}
          onClose={() => setShowProposalSheet(false)}
          cardTitle={card.title}
          categoryTitle={category.title}
          onSend={async (msg) => {
            const result = await sendProposal(card.id, category.id, msg);
            if (result.ok) {
              setProposalSent(true);
              setShowProposalSheet(false);
              if (proposalTimer.current) clearTimeout(proposalTimer.current);
              proposalTimer.current = setTimeout(() => setProposalSent(false), 2000);
            } else {
              toast.error('Kunde inte skicka förslaget. Försök igen.');
            }
          }}
        />
      )}
    </div>
  );
}
