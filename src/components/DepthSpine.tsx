interface DepthSpineProps {
  totalSteps: number;
  currentStepIndex: number;
}

/**
 * Vertical depth spine — 4 circular markers on the right edge.
 * Current step is darker, completed steps slightly lighter, future steps faintest.
 */
export default function DepthSpine({ totalSteps, currentStepIndex }: DepthSpineProps) {
  return (
    <div className="flex flex-col items-center gap-[16px]">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCurrent = i === currentStepIndex;
        const isCompleted = i < currentStepIndex;

        return (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: 'var(--color-ink)',
              opacity: isCurrent ? 0.5 : isCompleted ? 0.2 : 0.08,
              transition: 'opacity 150ms ease',
            }}
          />
        );
      })}
    </div>
  );
}
