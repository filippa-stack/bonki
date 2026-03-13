import { motion } from 'framer-motion';
import { EMOTION, EASE } from '@/lib/motion';

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
  /** Current question index within step (0-based) */
  currentPromptIndex?: number;
  /** Total questions in current step */
  totalPromptsInStep?: number;
}

export default function StepProgressIndicator({
  currentStepIndex,
  completedSteps,
  isTransitioning = false,
  className,
  steps,
  currentPromptIndex,
  totalPromptsInStep,
}: StepProgressIndicatorProps) {
  const activeSteps = steps ?? STAGE_STEPS;
  const showCounter = currentPromptIndex !== undefined && totalPromptsInStep !== undefined && totalPromptsInStep > 0;

  return (
    <div className={className} style={{ width: '100%', padding: '0 24px' }}>
      {/* Labels row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        {activeSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <motion.span
              key={step.stage_key}
              animate={{
                color: isCurrent
                  ? 'hsl(41, 78%, 48%)'
                  : isCompleted
                    ? '#DA9D1D'
                    : 'rgba(255, 255, 255, 0.35)',
              }}
              transition={{ duration: EMOTION, ease: [...EASE] }}
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: isCurrent ? 600 : 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {step.label}
            </motion.span>
          );
        })}
      </div>

      {/* Progress lines row */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {activeSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.stage_key}
              style={{
                flex: 1,
                height: '2px',
                borderRadius: '1px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: isCurrent || isCompleted
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.12)',
                ...(!isCurrent && !isCompleted ? {
                  backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 3px, transparent 3px, transparent 7px)',
                  backgroundColor: 'transparent',
                } : {}),
              }}
            >
              {(isCurrent || isCompleted) && (
                <motion.div
                  initial={false}
                  animate={{ scaleX: isCompleted ? 1 : 0.5 }}
                  transition={{ duration: EMOTION * 1.5, ease: [...EASE] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '1px',
                    transformOrigin: 'left',
                    backgroundColor: isCurrent
                      ? 'hsl(41, 78%, 48%)'
                      : '#DA9D1D',
                    opacity: isCompleted ? 0.6 : 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
