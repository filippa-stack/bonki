/**
 * Marketing 03 — Vårt Vi completion screen.
 * Renders the production VV (non-child) branch styling exactly:
 *  - Saffron hairline (not a saffron checkmark badge — that's the kids branch)
 *  - Headline at clamp(26px, 7vw, 34px) weight 500 in hsl(41 78% 38%)
 *  - Translucent dark takeaway block with italic serif text
 *  - "Fortsätt utforska" CTA
 * Mirrors CompletedSessionView lines ~248–520 non-child branch.
 */
import { ScaledScreen, FONT_DISPLAY, FONT_SERIF, FONT_SANS, LOGICAL_H } from './MarketingShared';
import { MIDNIGHT_INK } from '@/lib/palette';
import { useCardImage } from '@/hooks/useCardImage';

const HEADLINE = 'Ni pratade om Det osynliga ansvaret.';
const DATE = 'April 2026';
const REFLECTION =
  'Vi pratade om vem som b\u00e4r vad \u2014 och hur det m\u00e4rks \u00e4ven n\u00e4r vi inte s\u00e4ger det. Jag visste inte att Johan faktiskt s\u00e5g det. Att han f\u00f6rst\u00e5tt hur tungt det \u00e4r att alltid vara den som planerar.';

export default function MarketingVvCompletion() {
  return (
    <ScaledScreen background={MIDNIGHT_INK}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '64px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: LOGICAL_H,
        }}
      >
        {/* Saffron hairline — production non-child branch */}
        <div
          style={{
            width: 32,
            height: 2,
            borderRadius: 1,
            background: 'hsl(41, 78%, 48%)',
            opacity: 0.5,
            marginBottom: 8,
          }}
        />

        {/* Headline — exact production values */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.2,
            color: 'hsl(41, 78%, 38%)',
            textAlign: 'center',
            margin: 0,
            maxWidth: 320,
            letterSpacing: '-0.005em',
          }}
        >
          {HEADLINE}
        </h1>

        {/* Date */}
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: 15,
            color: '#FDF6E3',
            opacity: 0.55,
            margin: '8px 0 0',
          }}
        >
          {DATE}
        </p>

        {/* Takeaway eyebrow */}
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#FDF6E3',
            opacity: 0.45,
            margin: '40px 0 8px',
            alignSelf: 'flex-start',
          }}
        >
          Det ni tog med er
        </p>

        {/* Translucent dark takeaway block */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <p
            style={{
              padding: '20px 24px',
              fontFamily: FONT_SERIF,
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.7,
              color: '#FDF6E3',
              opacity: 0.8,
              margin: 0,
            }}
          >
            {REFLECTION}
          </p>
        </div>

        {/* "Fortsätt utforska" — production cta-primary */}
        <button
          style={{
            marginTop: 28,
            height: 48,
            minWidth: 220,
            paddingInline: 36,
            borderRadius: 24,
            border: 'none',
            background: 'hsl(41, 78%, 48%)',
            color: '#1A1A2E',
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.02em',
          }}
        >
          Fortsätt utforska
        </button>
      </div>
    </ScaledScreen>
  );
}
