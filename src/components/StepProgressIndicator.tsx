import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'opening', label: 'Öppnare' },
  { id: 'reflective', label: 'Tankeväckare' },
  { id: 'scenario', label: 'Scenario' },
  { id: 'exercise', label: 'Teamwork' },
];

interface StepProgressIndicatorProps {
  currentStepIndex: number;
  completedSteps: number[];
  className?: string;
}

export default function StepProgressIndicator({
  currentStepIndex,
  className,
}: StepProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {STEPS.map((step, index) => {
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                'text-xs transition-all duration-300',
                isCurrent
                  ? 'text-foreground/70 font-medium'
                  : 'text-muted-foreground/30'
              )}
            >
              {step.label}
            </span>

            {/* Soft separator dot */}
            {index < STEPS.length - 1 && (
              <span className="text-muted-foreground/20 text-[8px]">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
