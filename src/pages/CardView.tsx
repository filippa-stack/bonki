import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import SectionView from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Team Work',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

const STEP_CTA_LABELS: Record<string, string> = {
  opening: 'Gå vidare till Tankeväckare',
  reflective: 'Fortsätt till Scenario',
  scenario: 'Vidare till Teamwork',
  exercise: 'Avsluta samtalet',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
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
  } = useApp();

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // Determine initial step from session or start fresh
  const getInitialStepIndex = () => {
    if (currentSession?.cardId === cardId) {
      return currentSession.currentStepIndex;
    }
    // Check if there's an existing conversation to resume
    if (existingConversation?.lastSectionId && card) {
      const section = card.sections.find(s => s.id === existingConversation.lastSectionId);
      if (section) {
        const stepIndex = STEP_ORDER.indexOf(section.type);
        if (stepIndex !== -1) return stepIndex;
      }
    }
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    currentSession?.cardId === cardId ? currentSession.completedSteps : []
  );
  const [showOverview, setShowOverview] = useState(
    !(currentSession?.cardId === cardId) && !existingConversation
  );

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
        saveConversation(card.id, currentSection.id);
        updateSessionStep(currentStepIndex);
      }
    }
  }, [currentStepIndex, card]);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
        <p className="text-gentle">Card not found</p>
      </div>
    );
  }

  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);

  const handleNextStep = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
      completeSessionStep(currentStepIndex);
    }

    if (currentStepIndex < STEP_ORDER.length - 1) {
      // Go to next step
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // End session and return to category menu
      endSession();
      navigate('/');
    }
  };

  const handleStartFromOverview = () => {
    setShowOverview(false);
  };

  // Overview screen
  if (showOverview) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor || 'hsl(var(--background))' }}>
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
              <SectionView section={currentSection} card={card} />
              
              {/* CTA Button */}
              <div className="py-8 border-t border-divider">
                <Button
                  onClick={handleNextStep}
                  size="lg"
                  className="w-full md:w-auto gap-2"
                >
                  {currentStepIndex === STEP_ORDER.length - 1 ? (
                    <>
                      <Check className="w-4 h-4" />
                      Avsluta samtalet
                    </>
                  ) : (
                    <>
                      {STEP_CTA_LABELS[STEP_ORDER[currentStepIndex]]}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
