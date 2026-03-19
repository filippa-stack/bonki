import { useParams, useNavigate } from 'react-router-dom';
import { COLORS, cardIndexFromSlug } from '@/lib/stillUsTokens';
import soloReflectionPrompts from '@/data/soloReflectionPrompts';

const SoloReflect = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const cardIndex = cardIndexFromSlug(cardId ?? '');

  if (cardIndex < 0 || cardIndex > 21) {
    navigate('/');
    return null;
  }

  const prompt = soloReflectionPrompts[cardIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
    }}>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: '13px',
        color: COLORS.deepSaffron,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '12px',
      }}>
        Din reflektion
      </p>

      <p style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '24px',
        fontWeight: 400,
        color: COLORS.lanternGlow,
        lineHeight: 1.4,
        textAlign: 'center',
        textWrap: 'balance',
        maxWidth: '340px',
        marginBottom: '48px',
      }}>
        {prompt}
      </p>

      <button
        onClick={() => navigate('/?product=still-us')}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.driftwood,
          fontFamily: "'Nunito', sans-serif",
          fontSize: '16px',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '12px 24px',
        }}
      >
        Tillbaka hem
      </button>
    </div>
  );
};

export default SoloReflect;
