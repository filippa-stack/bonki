import { cn } from '@/lib/utils';

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
    <div className={cn('flex items-center justify-center', className)} style={{ gap: '6px' }}>
      {STAGE_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        // During transition the completing dash (prev) snaps to completed,
        // and the new current dash animates in with a 200ms delay.
        const transitionDelay = isTransitioning && isCurrent ? '200ms' : '0ms';

        const opacity = isCurrent ? 1.0 : isCompleted ? 0.55 : 0.15;
        const width = isCurrent ? 28 : 24;

        return (
          <span
            key={step.stage_key}
            style={{
              height: '3px',
              borderRadius: '2px',
              width: `${width}px`,
              backgroundColor: '#1C1B1A',
              opacity,
              transition: `width 300ms ease-out ${transitionDelay}, opacity 300ms ease-out ${transitionDelay}`,
            }}
          />
        );
      })}
    </div>
  );
}
