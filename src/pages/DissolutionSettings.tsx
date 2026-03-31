import { useState, useEffect } from 'react';
import { useDefaultTheme } from '@/hooks/useDefaultTheme';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@/lib/stillUsTokens';
import { usePageBackground } from '@/hooks/usePageBackground';
import { dissolveCouple } from '@/lib/stillUsRpc';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function DissolutionSettings() {
  useDefaultTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [dissolving, setDissolving] = useState(false);
  const [realCoupleId, setRealCoupleId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();
      if (cs) setRealCoupleId(cs.couple_id);
    })();
  }, [user?.id]);

  const handleDissolve = async () => {
    if (!realCoupleId || !user?.id) return;
    try {
      setDissolving(true);
      await dissolveCouple({ couple_id: realCoupleId, departing_user_id: user.id });
      localStorage.removeItem('bonki-last-active-product');
      navigate('/');
    } catch (err) {
      console.error('Dissolution failed:', err);
      setDissolving(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '24px',
          color: COLORS.lanternGlow,
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          Är du säker?
        </p>
        <button
          disabled={dissolving}
          onClick={handleDissolve}
          style={{
            background: COLORS.deepSaffron,
            color: COLORS.emberNight,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            cursor: dissolving ? 'default' : 'pointer',
            opacity: dissolving ? 0.6 : 1,
            width: '100%',
            maxWidth: '320px',
            marginBottom: '16px',
          }}
        >
          {dissolving ? 'Avslutar...' : 'Avsluta för gott'}
        </button>
        <button
          onClick={() => setStep('warning')}
          disabled={dissolving}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.driftwood,
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '12px',
          }}
        >
          Gå tillbaka
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}>
      <button
        onClick={() => navigate('/product/still-us')}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.lanternGlow,
          fontSize: '24px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          padding: '8px',
          marginBottom: '32px',
        }}
      >
        ←
      </button>

      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '28px',
        color: COLORS.lanternGlow,
        marginBottom: '16px',
      }}>
        Avsluta Still Us
      </h1>

      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: '16px',
        color: COLORS.driftwoodBody,
        lineHeight: 1.6,
        marginBottom: '12px',
      }}>
        Det här avslutar ert gemensamma utrymme. Ni kommer inte kunna fortsätta med nya samtal.
      </p>

      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: '14px',
        color: COLORS.driftwood,
        lineHeight: 1.5,
        marginBottom: '24px',
      }}>
        Er resa finns kvar att titta tillbaka på.
      </p>

      <div style={{ flex: 1 }} />

      <button
        onClick={() => setStep('confirm')}
        style={{
          background: 'transparent',
          border: `1px solid ${COLORS.driftwood}`,
          color: COLORS.driftwood,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: '16px',
          borderRadius: '12px',
          padding: '14px 28px',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        Jag vill avsluta
      </button>

      <button
        onClick={() => navigate('/product/still-us')}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.driftwood,
          fontFamily: "'Nunito', sans-serif",
          fontSize: '14px',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '12px',
          alignSelf: 'center',
        }}
      >
        Avbryt
      </button>
    </div>
  );
}
