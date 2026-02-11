import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import SectionView from '@/components/SectionView';
import CardReflections from '@/components/CardReflections';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import PauseDialog from '@/components/PauseDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Heart, Home } from 'lucide-react';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Team Work',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

const STEP_CTA_KEYS: Record<string, string> = {
  opening: 'card_view.cta_opening',
  reflective: 'card_view.cta_reflective',
  scenario: 'card_view.cta_scenario',
  exercise: 'card_view.cta_exercise',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    getConversationForCard, 
    saveConversation, 
    getCardById, 
    getCategoryById, 
    backgroundColor,
    currentSession,
    startSession,
    updateSessionStep,
    completeSessionStep,
    endSession,
    pauseSession,
    journeyState,
  } = useApp();

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // Determine initial step from session or saved conversation
  const getInitialStepIndex = () => {
    if (currentSession?.cardId === cardId) {
      return currentSession.currentStepIndex;
    }
    if (existingConversation && card) {
      return existingConversation.lastStepIndex ?? 0;
    }
    return 0;
  };

  const getInitialCompletedSteps = () => {
    if (currentSession?.cardId === cardId) {
      return currentSession.completedSteps;
    }
    if (existingConversation) {
      return existingConversation.completedSteps ?? [];
    }
    return [];
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<number[]>(getInitialCompletedSteps);
  const [showOverview, setShowOverview] = useState(
    !(currentSession?.cardId === cardId) && !existingConversation
  );
  const [showCompletion, setShowCompletion] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  // Start or resume session when entering card
  useEffect(() => {
    if (card && category) {
      if (!currentSession || currentSession.cardId !== cardId) {
        startSession(category.id, card.id);
      }
    }
  }, [cardId]);

  useEffect(() => {
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) {
        saveConversation(card.id, currentSection.id, currentStepIndex, completedSteps);
        updateSessionStep(currentStepIndex);
      }
    }
  }, [currentStepIndex, completedSteps, card]);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <p className="text-gentle">Kort hittades inte</p>
      </div>
    );
  }

  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);

  const TRANSITION_KEYS: Record<string, string> = {
    opening: 'card_view.transition_opening',
    reflective: 'card_view.transition_reflective',
    scenario: 'card_view.transition_scenario',
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
      completeSessionStep(currentStepIndex);
    }

    if (currentStepIndex < STEP_ORDER.length - 1) {
      const currentType = STEP_ORDER[currentStepIndex];
      const msgKey = TRANSITION_KEYS[currentType];
      if (msgKey) {
        setTransitionMessage(t(msgKey));
        setTimeout(() => {
          setTransitionMessage(null);
          setCurrentStepIndex(currentStepIndex + 1);
        }, 1800);
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } else {
      endSession();
      setShowCompletion(true);
    }
  };

  const handleStartFromOverview = () => {
    setShowOverview(false);
  };

  // Completion screen
  if (showCompletion) {
    const suggestedCardId = journeyState?.suggestedNextCardId;
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;

    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo="/"
        />
        <div className="px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md mx-auto space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Heart className="w-6 h-6 text-primary/60 mx-auto mb-4" />
              <h2 className="text-xl font-serif text-foreground leading-snug">
                {card.title}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
            >
              {t('card_view.completion_message')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="pt-4 space-y-3"
            >
              {suggestedCard && suggestedCategory && (
                <>
                  <Button
                    onClick={() => navigate(`/card/${suggestedCard.id}`)}
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                  >
                    {t('card_view.completion_next')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground/70">
                    {suggestedCategory.title} · {suggestedCard.title}
                  </p>
                </>
              )}
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="lg"
                className="w-full gap-2 text-muted-foreground"
              >
                <Home className="w-4 h-4" />
                {t('card_view.completion_home')}
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-xs text-muted-foreground/50 italic pt-2"
            >
              {t('card_view.completion_rest')}
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Overview screen
  if (showOverview) {
    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo={category ? `/category/${category.id}` : '/'}
        />
        
        <div className="px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-3">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-gentle italic mb-8">{card.subtitle}</p>
            )}
            
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Det här samtalet består av fyra delar. Ni rör er i er egen takt, 
              men ordningen är viktig för att skapa trygghet och djup.
            </p>
            
            {/* Step overview */}
            <div className="space-y-3 mb-10 text-left">
              {STEP_ORDER.map((stepType, index) => {
                const section = card.sections.find(s => s.type === stepType);
                return (
                  <motion.div
                    key={stepType}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {sectionTypeLabels[stepType]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stepType === 'opening' && 'Sänker tröskeln och sätter samtalet i rörelse.'}
                        {stepType === 'reflective' && 'Fördjupar, utmanar och breddar perspektivet.'}
                        {stepType === 'scenario' && 'Gör det svåra pratbart genom igenkänning.'}
                        {stepType === 'exercise' && 'Förvandlar insikt till gemensam handling.'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <Button
              onClick={handleStartFromOverview}
              size="lg"
              className="w-full md:w-auto gap-2"
            >
              Börja med Öppnare
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Progress indicator */}
      <div className="px-4 pt-6 pb-4 border-b border-divider">
        <StepProgressIndicator
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
        />
      </div>

      {/* Card header - simplified */}
      <div className="px-6 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-serif text-foreground text-center md:text-left"
        >
          {card.title}
        </motion.h1>
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gentle italic mt-1 text-center md:text-left"
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>

      {/* Transition moment */}
      <AnimatePresence>
        {transitionMessage && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="px-6 py-16 flex items-center justify-center"
          >
            <p className="text-sm text-muted-foreground italic text-center max-w-xs leading-relaxed">
              {transitionMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {currentSection && !transitionMessage && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionView section={currentSection} card={card} />
              
              {/* Navigation Buttons */}
              <div className="py-8 border-t border-divider space-y-4">
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                  {currentStepIndex > 0 && (
                    <Button
                      onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Tillbaka
                    </Button>
                  )}
                  <Button
                    onClick={handleNextStep}
                    size="lg"
                    className="gap-2"
                  >
                    {currentStepIndex === STEP_ORDER.length - 1 ? (
                      <>
                        <Check className="w-4 h-4" />
                        Avsluta samtalet
                      </>
                    ) : (
                      <>
                        {t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex justify-center md:justify-start">
                  <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                </div>
              </div>

              {/* Reflections (private → shared) */}
              <CardReflections cardId={card.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
