/**
 * CategoryProgressRing — small SVG ring showing category completion progress.
 * Always visible (empty ring when 0 completed). Shows checkmark when all done.
 */

import { Check } from 'lucide-react';

interface CategoryProgressRingProps {
  completed: number;
  total: number;
  /** Color for the filled arc */
  color: string;
  /** Size in px (default 24) */
  size?: number;
}

export default function CategoryProgressRing({ completed, total, color, size = 24 }: CategoryProgressRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? completed / total : 0;
  const dashOffset = circumference * (1 - ratio);
  const allDone = total > 0 && completed === total;

  return (
    <span style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.12}
        />
        {/* Filled arc */}
        {ratio > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            opacity={0.5}
          />
        )}
      </svg>
      {allDone && (
        <Check
          size={size * 0.48}
          strokeWidth={2.5}
          style={{ position: 'absolute', color, opacity: 0.5 }}
        />
      )}
    </span>
  );
}
