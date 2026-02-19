import { cn } from '@/lib/utils';

const STEP_LABELS: Record<string, string> = {
  opening: 'Början',
  reflective: 'Fördjupning',
  scenario: 'I vardagen',
  exercise: 'Tillsammans',
};

const STEP_IDS = ['opening', 'reflective', 'scenario', 'exercise'];

interface StepProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: number[];
  className?: string;
}

/**
 * Shows only the current stage name as a small, passive subtitle.
 * Stage switching is implicit — no tabs, no clickable navigation.
 */
export default function StepProgressIndicator({
  currentStepIndex,
  className,
}: StepProgressIndicatorProps) {
  const stepId = STEP_IDS[currentStepIndex] ?? 'opening';
  const label = STEP_LABELS[stepId];

  return (
    <p
      className={cn('text-center text-[11px] tracking-wide', className)}
      style={{ color: 'var(--color-text-secondary)', opacity: 0.45 }}
    >
      {label}
    </p>
  );
}
