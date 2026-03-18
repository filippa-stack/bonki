/**
 * SliderReveal — Dual-position reveal shown at start of Session 1.
 * Shows both partners' slider positions side by side on shared tracks.
 * v3.0 spec compliant.
 */

import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, getPhase } from '@/lib/stillUsTokens';
import type { SliderPrompt } from '@/data/sliderPrompts';

interface SliderRevealProps {
  cardIndex: number;
  cardSlug: string;
  sliders: SliderPrompt[];
  initiatorValues: Record<string, number>;
  partnerValues: Record<string, number>;
  initiatorName: string;
  partnerName: string;
  initiatorReflection?: string;
  partnerReflection?: string;
  /** If provided, CTA calls this instead of navigating */
  onContinue?: () => void;
}

export default function SliderReveal({
  cardIndex,
  cardSlug,
  sliders,
  initiatorValues,
  partnerValues,
  initiatorName,
  partnerName,
  initiatorReflection,
  partnerReflection,
}: SliderRevealProps) {
  const navigate = useNavigate();
  const phase = getPhase(cardIndex);
  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [animated, setAnimated] = useState(prefersReduced.current);

  useEffect(() => {
    if (!prefersReduced.current) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const hasInitiatorReflection = !!initiatorReflection?.trim();
  const hasPartnerReflection = !!partnerReflection?.trim();
  const bothReflections = hasInitiatorReflection && hasPartnerReflection;

  const showReflections =
    (phase === 'B' && (hasInitiatorReflection || hasPartnerReflection)) ||
    (phase === 'C' && (hasInitiatorReflection || hasPartnerReflection));

  const useBlockStyle = phase === 'C' && bothReflections;

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: 'calc(48px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '22px',
          fontWeight: 400,
          color: COLORS.lanternGlow,
          textAlign: 'center',
          margin: 0,
          marginBottom: '16px',
        }}
      >
        Vad ni kände — var för sig
      </h2>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sliders.map((slider) => {
          const iVal = initiatorValues[slider.sliderId] ?? 50;
          const pVal = partnerValues[slider.sliderId] ?? 50;

          return (
            <DualSliderTrack
              key={slider.sliderId}
              label={slider.text}
              leftAnchor={slider.leftLabel}
              rightAnchor={slider.rightLabel}
              initiatorValue={animated ? iVal : 50}
              partnerValue={animated ? pVal : 50}
              initiatorName={initiatorName}
              partnerName={partnerName}
              animate={!prefersReduced.current}
            />
          );
        })}
      </div>

      {/* Reflections */}
      {showReflections && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {useBlockStyle ? (
            <>
              <ReflectionBlock name={initiatorName} text={initiatorReflection!} />
              <ReflectionBlock name={partnerName} text={partnerReflection!} />
            </>
          ) : (
            <>
              {hasInitiatorReflection && (
                <ReflectionInline name={initiatorName} text={initiatorReflection!} />
              )}
              {hasPartnerReflection && (
                <ReflectionInline name={partnerName} text={partnerReflection!} />
              )}
            </>
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* CTA */}
      <button
        onClick={() => navigate(`/session/${cardSlug}/live`)}
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'transparent',
          border: `1.5px solid ${COLORS.deepSaffron}`,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.deepSaffron,
          marginTop: '24px',
        }}
      >
        Fortsätt till samtalet
      </button>
    </div>
  );
}

/* ── Dual track with two markers ─────────────────────────── */

function DualSliderTrack({
  label,
  leftAnchor,
  rightAnchor,
  initiatorValue,
  partnerValue,
  initiatorName,
  partnerName,
  animate,
}: {
  label: string;
  leftAnchor: string;
  rightAnchor: string;
  initiatorValue: number;
  partnerValue: number;
  initiatorName: string;
  partnerName: string;
  animate: boolean;
}) {
  const transition = animate ? 'left 600ms ease-out' : 'none';

  return (
    <div>
      {/* Slider question */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: COLORS.driftwoodBody,
          textAlign: 'center',
          margin: '0 0 10px 0',
        }}
      >
        {label}
      </p>

      {/* Track with markers */}
      <div style={{ position: 'relative', height: '40px' }}>
        {/* Track bar */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '4px',
            transform: 'translateY(-50%)',
            backgroundColor: COLORS.emberMid,
            borderRadius: '22px',
          }}
        />

        {/* Initiator marker + name */}
        <Marker
          value={initiatorValue}
          color={COLORS.deepSaffron}
          name={initiatorName}
          transition={transition}
        />

        {/* Partner marker + name */}
        <Marker
          value={partnerValue}
          color={COLORS.lanternGlow}
          name={partnerName}
          transition={transition}
        />
      </div>

      {/* Anchor labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: COLORS.driftwoodBody }}>
          {leftAnchor}
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: COLORS.driftwoodBody }}>
          {rightAnchor}
        </span>
      </div>
    </div>
  );
}

function Marker({
  value,
  color,
  name,
  transition,
}: {
  value: number;
  color: string;
  name: string;
  transition: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: `${value}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: COLORS.driftwoodBody,
          whiteSpace: 'nowrap',
          marginBottom: '4px',
        }}
      >
        {name}
      </span>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    </div>
  );
}

/* ── Reflection displays ─────────────────────────────────── */

function ReflectionInline({ name, text }: { name: string; text: string }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        color: COLORS.driftwood,
        fontStyle: 'italic',
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {name}: {text}
    </p>
  );
}

function ReflectionBlock({ name, text }: { name: string; text: string }) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: COLORS.emberGlow,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: COLORS.driftwoodBody,
          margin: '0 0 4px 0',
        }}
      >
        {name}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: COLORS.lanternGlow,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </div>
  );
}
