import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'opening', label: 'Början', hint: 'Börja här.' },
  { id: 'reflective', label: 'Fördjupning', hint: 'Gå lite djupare.' },
  { id: 'scenario', label: 'I vardagen', hint: 'Utforska en situation.' },
  { id: 'exercise', label: 'Tillsammans', hint: 'Vad gör ni av det här?' },
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
              className="text-[10px] tracking-wide transition-all duration-150"
              style={{
                color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                opacity: isCurrent ? 1 : 0.45,
                fontWeight: isCurrent ? 500 : 400,
              }}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span style={{ color: 'var(--color-text-secondary)', opacity: 0.25, fontSize: '6px' }}>·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
