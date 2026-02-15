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
                'text-[10px] tracking-wide transition-all duration-150',
                isCurrent
                  ? 'text-muted-foreground/40 font-normal'
                  : 'text-muted-foreground/20'
              )}
            >
              {step.label}
            </span>

            {/* Soft separator dot */}
            {index < STEPS.length - 1 && (
              <span className="text-muted-foreground/15 text-[6px]">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
