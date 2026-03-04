import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';

export interface StageStep {
  stage_key: string;
  label: string;
}

/** Default 4-step Still Us sequence */
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

/** Labels for non-Still-Us section types (kids/family products) */
const SECTION_LABELS: Record<string, string> = {
  opening: 'Frågor',
  scenario: 'I verkligheten',
  reflective: 'Gå djupare',
  exercise: 'I verkligheten',
};

/** Still Us canonical labels */
const STILL_US_LABELS: Record<string, string> = {
  opening: 'Kom igång',
  reflective: 'Gå djupare',
  scenario: 'Föreställ er',
  exercise: 'I verkligheten',
};

/** Build dynamic steps from a card's actual section types */
export function buildDynamicSteps(sectionTypes: string[], isStillUs = false): StageStep[] {
  const labels = isStillUs ? STILL_US_LABELS : SECTION_LABELS;
  return sectionTypes.map((type, i) => ({
    stage_key: SECTION_TYPE_TO_STAGE[type] ?? type,
    label: labels[type] ?? `Del ${i + 1}`,
  }));
}

interface StepProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: number[];
  isTransitioning?: boolean;
  className?: string;
  /** Dynamic steps override. Falls back to STAGE_STEPS (Still Us). */
  steps?: StageStep[];
}

export default function StepProgressIndicator({
  currentStepIndex,
  completedSteps,
  isTransitioning = false,
  className,
  steps,
}: StepProgressIndicatorProps) {
  const activeSteps = steps ?? STAGE_STEPS;
  const currentLabel = activeSteps[currentStepIndex]?.label ?? '';

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: EMOTION, ease: [...EASE] }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            opacity: 0.38,
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          {currentLabel}
        </motion.span>
      </AnimatePresence>

      {/* Horizontal dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        {activeSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <motion.span
              key={step.stage_key}
              animate={{
                width: isCurrent ? 20 : 6,
                opacity: isCurrent ? 1 : isCompleted ? 0.30 : 0.12,
              }}
              transition={{ duration: EMOTION, ease: [...EASE] }}
              style={{
                display: 'inline-block',
                height: '4px',
                borderRadius: isCurrent ? '3px' : '50%',
                backgroundColor: isCurrent
                  ? 'var(--accent-saffron)'
                  : isCompleted
                    ? 'var(--cta-active)'
                    : 'var(--text-ghost)',
                transition: 'border-radius 0.3s ease, background-color 0.25s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
