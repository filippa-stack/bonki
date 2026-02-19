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
              width: isCurrent ? 9 : 8,
              height: isCurrent ? 9 : 8,
              backgroundColor: 'var(--color-ink)',
              opacity: isCurrent ? 0.35 : isCompleted ? 0.15 : 0.06,
              transition: 'opacity 150ms ease, width 200ms ease-out, height 200ms ease-out',
            }}
          />
        );
      })}
    </div>
  );
}
