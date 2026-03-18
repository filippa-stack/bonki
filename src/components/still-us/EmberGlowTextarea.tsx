/**
 * EmberGlowTextarea — Styled textarea for Still Us.
 * Used for takeaway prompts, reflections, 'Fäst en tanke'.
 */

import { COLORS } from '@/lib/stillUsTokens';

interface EmberGlowTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export default function EmberGlowTextarea({
  value,
  onChange,
  placeholder = 'Skriv här...',
  rows = 3,
  maxLength,
  disabled = false,
}: EmberGlowTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: COLORS.emberGlow,
        border: 'none',
        color: COLORS.lanternGlow,
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        lineHeight: 1.6,
        resize: 'none',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}
