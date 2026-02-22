import { motion, AnimatePresence } from 'framer-motion';

export interface StageStep {
  stage_key: 'oppnare' | 'tankevackare' | 'scenario' | 'teamwork';
  label: string;
}

export const STAGE_STEPS: StageStep[] = [
  { stage_key: 'oppnare',     label: 'Kom igång'        },
  { stage_key: 'tankevackare', label: 'Gå djupare'      },
  { stage_key: 'scenario',    label: 'Föreställ er'     },
  { stage_key: 'teamwork',    label: 'I verkligheten'   },
];

export const SECTION_TYPE_TO_STAGE: Record<string, StageStep['stage_key']> = {
  opening:    'oppnare',
  reflective: 'tankevackare',
  scenario:   'scenario',
  exercise:   'teamwork',
};

interface StepProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: number[];
  isTransitioning?: boolean;
  className?: string;
}

export default function StepProgressIndicator({
  currentStepIndex,
  completedSteps,
  isTransitioning = false,
  className,
}: StepProgressIndicatorProps) {
  const currentLabel = STAGE_STEPS[currentStepIndex]?.label ?? '';

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            opacity: 0.5,
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          {currentLabel}
        </motion.span>
      </AnimatePresence>

      {/* Horizontal dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        {STAGE_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <span
              key={step.stage_key}
              style={{
                display: 'inline-block',
                width: isCurrent ? '16px' : '5px',
                height: '5px',
                borderRadius: isCurrent ? '4px' : '50%',
                backgroundColor: isCurrent
                  ? '#C4821D'
                  : isCompleted
                    ? 'hsl(158, 32%, 14%)'
                    : 'var(--text-ghost)',
                opacity: isCurrent ? 1.0 : isCompleted ? 0.25 : 0.18,
                transition: 'width 0.3s ease, border-radius 0.3s ease, opacity 0.25s ease, background-color 0.25s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
