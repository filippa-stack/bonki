export interface StageStep {
  stage_key: 'oppnare' | 'tankevackare' | 'scenario' | 'teamwork';
  label: string;
}

export const STAGE_STEPS: StageStep[] = [
  { stage_key: 'oppnare',     label: 'Öppnare'     },
  { stage_key: 'tankevackare', label: 'Tankeväckare' },
  { stage_key: 'scenario',    label: 'Scenario'     },
  { stage_key: 'teamwork',    label: 'Teamwork'     },
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
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {STAGE_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        const transitionDelay = isTransitioning && isCurrent ? '150ms' : '0ms';

        const size = isCurrent ? 8 : 6;
        const bg = isCurrent
          ? 'var(--accent-saffron)'
          : isCompleted
            ? 'var(--text-secondary)'
            : 'var(--text-ghost)';
        const opacity = isCompleted ? 0.45 : 1.0;

        return (
          <span
            key={step.stage_key}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: bg,
              opacity,
              transition: `width 250ms ease-out ${transitionDelay}, height 250ms ease-out ${transitionDelay}, opacity 250ms ease-out ${transitionDelay}`,
            }}
          />
        );
      })}
    </div>
  );
}
