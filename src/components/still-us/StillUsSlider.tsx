/**
 * StillUsSlider — Custom slider matching Still Us v3.0 visual spec.
 * 28px Deep Saffron marker, 48px touch target, Ember Mid track.
 */

import { useCallback, useRef } from 'react';
import { COLORS } from '@/lib/stillUsTokens';

interface StillUsSliderProps {
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  ariaLabel?: string;
}

export default function StillUsSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  ariaLabel,
}: StillUsSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const getValueFromEvent = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return clamp(Math.round(pct));
  }, [value]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    onChange(getValueFromEvent(e.clientX));
  }, [onChange, getValueFromEvent]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    onChange(getValueFromEvent(e.clientX));
  }, [onChange, getValueFromEvent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let next = value;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp': next = clamp(value + 5); break;
      case 'ArrowLeft': case 'ArrowDown': next = clamp(value - 5); break;
      case 'Home': next = 0; break;
      case 'End': next = 100; break;
      default: return;
    }
    e.preventDefault();
    onChange(next);
  }, [value, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Track + marker */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={ariaLabel ?? `${leftLabel} – ${rightLabel}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          height: '48px',
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {/* Track background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          transform: 'translateY(-50%)',
          backgroundColor: COLORS.emberMid,
          borderRadius: '22px',
        }} />

        {/* Active fill */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${value}%`,
          height: '4px',
          transform: 'translateY(-50%)',
          backgroundColor: `${COLORS.deepSaffron}66`,
          borderRadius: '22px 0 0 22px',
        }} />

        {/* Marker (28px visible, 48px touch target) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${value}%`,
          transform: 'translate(-50%, -50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: COLORS.deepSaffron,
          border: '2px solid #fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }} />
      </div>

      {/* Anchor labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: COLORS.driftwood,
        }}>
          {leftLabel}
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: COLORS.driftwood,
          textAlign: 'right',
        }}>
          {rightLabel}
        </span>
      </div>
    </div>
  );
}
