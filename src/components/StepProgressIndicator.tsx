import { cn } from '@/lib/utils';

export interface StageStep {
  stage_key: 'oppnare' | 'tankevackare' | 'scenario' | 'teamwork';
  label: string;
}

// Canonical step definitions — one step per stage in Volume 1.
// stage_key maps to section type: opening→oppnare, reflective→tankevackare, etc.
export const STAGE_STEPS: StageStep[] = [
  { stage_key: 'oppnare',     label: 'Öppnare'     },
  { stage_key: 'tankevackare', label: 'Tankeväckare' },
  { stage_key: 'scenario',    label: 'Scenario'     },
  { stage_key: 'teamwork',    label: 'Teamwork'     },
];

// Maps section.type → stage_key
export const SECTION_TYPE_TO_STAGE: Record<string, StageStep['stage_key']> = {
  opening:    'oppnare',
  reflective: 'tankevackare',
  scenario:   'scenario',
  exercise:   'teamwork',
};

interface StepProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: number[];
  className?: string;
}

/**
 * Read-only stage indicator bar.
 * - Highlights the current stage (derived from current_step_index).
 * - Marks prior stages as completed.
 * - NOT clickable — stage progression is implicit.
 */
export default function StepProgressIndicator({
  currentStepIndex,
  completedSteps,
  className,
}: StepProgressIndicatorProps) {
  const currentStage = STAGE_STEPS[currentStepIndex]?.stage_key;

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {STAGE_STEPS.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isCompleted = completedSteps.includes(index) || index < currentStepIndex;

        return (
          <span
            key={step.stage_key}
            className={cn(
              'h-1 flex-1 max-w-[40px] rounded-full transition-colors duration-200',
            )}
            style={{
              backgroundColor: isCurrent
                ? 'var(--color-ink)'
                : isCompleted
                  ? 'hsl(var(--muted-foreground) / 0.3)'
                  : 'hsl(var(--border))',
            }}
          />
        );
      })}
    </div>
  );
}
