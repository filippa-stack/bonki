import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COLORS, cardIndexFromSlug } from '@/lib/stillUsTokens';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import soloReflectionPrompts from '@/data/soloReflectionPrompts';

const SoloReflect = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const cardIndex = cardIndexFromSlug(cardId ?? '');
  const card = cardIndex >= 0 && cardIndex < CARD_SEQUENCE.length ? CARD_SEQUENCE[cardIndex] : null;

  if (!card) {
    navigate('/?product=still-us', { replace: true });
    return null;
  }

  const weekNumber = cardIndex + 1;
  const prompt = soloReflectionPrompts[cardIndex] ?? `Reflektera kring vecka ${weekNumber}.`;

  const handleDone = () => {
    if (text.trim()) {
      try {
        localStorage.setItem(`still_us_solo_reflection_${cardId}`, text.trim());
      } catch { /* quota exceeded — skip silently */ }
    }
    navigate('/?product=still-us');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
      paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
    }}>
      {/* Back arrow */}
      <button
        onClick={() => navigate('/?product=still-us')}
        aria-label="Tillbaka"
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.lanternGlow,
          cursor: 'pointer',
          padding: '8px',
          marginLeft: '-8px',
          marginBottom: '24px',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={22} strokeWidth={1.5} />
      </button>

      {/* Top zone — week + title + context */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          color: COLORS.deepSaffron,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '8px',
        }}>
          Vecka {weekNumber}
        </p>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '24px',
          fontWeight: 400,
          color: COLORS.lanternGlow,
          lineHeight: 1.3,
          margin: 0,
        }}>
          {card.title}
        </h1>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '14px',
          color: COLORS.driftwood,
          marginTop: '8px',
          margin: '8px 0 0',
        }}>
          Medan du väntar på din partner
        </p>
      </div>

      {/* Reflection zone */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          color: COLORS.deepSaffron,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
        }}>
          Din reflektion
        </p>

        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '22px',
          fontWeight: 400,
          color: COLORS.lanternGlow,
          lineHeight: 1.4,
          textAlign: 'center',
          textWrap: 'balance',
          maxWidth: '320px',
          marginBottom: '24px',
        }}>
          {prompt}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv fritt — bara för dig."
          maxLength={300}
          aria-label="Din reflektion"
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: COLORS.emberGlow,
            border: 'none',
            color: COLORS.lanternGlow,
            fontFamily: "'Nunito', sans-serif",
            fontSize: '16px',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
          }}
        />

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '12px',
          fontStyle: 'italic',
          color: COLORS.driftwood,
          opacity: 0.5,
          marginTop: '8px',
        }}>
          Bara du kan se det här.
        </p>
      </div>

      {/* Bottom CTA */}
      <button
        onClick={handleDone}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '16px',
          backgroundColor: COLORS.deepSaffron,
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.emberNight,
          marginTop: '24px',
          flexShrink: 0,
        }}
      >
        {text.trim() ? 'Spara och gå vidare' : 'Klar'}
      </button>
    </div>
  );
};

export default SoloReflect;
