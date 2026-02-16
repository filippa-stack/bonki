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
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'text-[10px] tracking-wide transition-all duration-150',
                  isCurrent
                    ? 'text-slate-800 font-normal'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {step.label}
              </span>
              {isCurrent && (
                <span className="text-[8px] text-slate-500 mt-0.5 leading-tight">
                  {step.hint}
                </span>
              )}
            </div>

            {/* Soft separator dot */}
            {index < STEPS.length - 1 && (
              <span className="text-slate-400 text-[6px]">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
