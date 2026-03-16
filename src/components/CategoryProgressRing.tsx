/**
 * CategoryProgressRing — text-only counter showing "n av m" completion.
 * Positioned bottom-left of tile. Uses Saffron when progress exists.
 */

const SAFFRON = '#E9B44C';

interface CategoryProgressRingProps {
  completed: number;
  total: number;
  color: string;
  size?: number;
}

export default function CategoryProgressRing({ completed, total }: CategoryProgressRingProps) {
  return (
    <span style={{
      position: 'absolute',
      bottom: '12px',
      left: '14px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: completed > 0 ? SAFFRON : `#FDF6E380`, // Lantern Glow at 50%
      whiteSpace: 'nowrap',
    }}>
      {completed} av {total}
    </span>
  );
}
