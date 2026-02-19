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
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {STAGE_STEPS.map((step, index) => {
        const isCurrent  = index === currentStepIndex;
        const isCompleted = completedSteps.includes(index) || index < currentStepIndex;
        const isLast     = index === STAGE_STEPS.length - 1;

        return (
          <div key={step.stage_key} className="flex items-center">
            <span
              className={cn(
                'text-[10px] tracking-wide select-none transition-all duration-200 px-2 py-0.5 rounded-full',
                isCurrent && 'font-medium',
              )}
              style={{
                color: isCurrent
                  ? 'var(--color-text-primary)'
                  : isCompleted
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-text-secondary)',
                opacity: isCurrent ? 1 : isCompleted ? 0.55 : 0.3,
                textDecoration: isCompleted && !isCurrent ? 'line-through' : 'none',
              }}
            >
              {step.label}
            </span>
            {!isLast && (
              <span
                className="mx-0.5 text-[6px]"
                style={{ color: 'var(--color-text-secondary)', opacity: 0.2 }}
              >
                ›
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
