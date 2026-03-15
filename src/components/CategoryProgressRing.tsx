/**
 * CategoryProgressRing — small SVG ring + text counter showing category completion.
 * Always visible: empty ring when 0 completed, filling arc + "n av m" as progress grows.
 * Uses Saffron Flame for the filled arc to maintain warmth across all product themes.
 */

import { Check } from 'lucide-react';

const SAFFRON = '#E9B44C';

interface CategoryProgressRingProps {
  completed: number;
  total: number;
  /** Color for the track (usually tile text color) */
  color: string;
  /** Size in px (default 26) */
  size?: number;
}

export default function CategoryProgressRing({ completed, total, color, size = 26 }: CategoryProgressRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? completed / total : 0;
  const dashOffset = circumference * (1 - ratio);
  const allDone = total > 0 && completed === total;

  return (
    <span style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
    }}>
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={0.15}
          />
          {/* Filled arc in Saffron */}
          {ratio > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={SAFFRON}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              opacity={0.85}
            />
          )}
        </svg>
        {allDone && (
          <Check
            size={size * 0.45}
            strokeWidth={2.5}
            style={{ position: 'absolute', color: SAFFRON, opacity: 0.85 }}
          />
        )}
      </span>
      <span style={{
        fontSize: '9px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: completed > 0 ? SAFFRON : color,
        opacity: completed > 0 ? 0.85 : 0.35,
        whiteSpace: 'nowrap',
      }}>
        {completed} av {total}
      </span>
    </span>
  );
}
