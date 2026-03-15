/**
 * CategoryProgressRing — text-only counter showing "n av m" completion.
 * Always visible. Uses Saffron when progress exists, subtle tile color when empty.
 */

const SAFFRON = '#E9B44C';

interface CategoryProgressRingProps {
  completed: number;
  total: number;
  color: string;
  size?: number;
}

export default function CategoryProgressRing({ completed, total, color }: CategoryProgressRingProps) {
  return (
    <span style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: completed > 0 ? SAFFRON : '#FFFDF8',
      opacity: completed > 0 ? 0.9 : 0.4,
      whiteSpace: 'nowrap',
    }}>
      {completed} av {total}
    </span>
  );
}
