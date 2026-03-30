import { useCallback, useEffect, useState } from 'react';
import { useDefaultTheme } from '@/hooks/useDefaultTheme';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { COLORS, slugFromCardIndex } from '@/lib/stillUsTokens';
import { useAuth } from '@/contexts/AuthContext';
import { isTestMode } from '@/lib/testMode';
import { isDemoMode } from '@/lib/demoMode';

export default function Paywall() {
  useDefaultTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slug, setSlug] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bypassed = isDemoMode() || isTestMode();

  // Demo/test mode: bypass paywall entirely
  useEffect(() => {
    if (bypassed) {
      navigate('/product/still-us', { replace: true });
    }
  }, [bypassed, navigate]);

  // Fetch current slug for redirect after purchase
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('current_card_index')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();
      if (cs) {
        setSlug(slugFromCardIndex(cs.current_card_index) ?? `su-01-smallest-we`);
      }
    })();
  }, [user?.id]);

  const handlePurchase = useCallback(async () => {
    if (!user?.id) return;
    setProcessing(true);
    setError(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { data: { session } } = await supabase.auth.getSession();

      const successUrl = slug
        ? `${window.location.origin}/session/${slug}/session2-start?purchase=success`
        : `${window.location.origin}/?purchase=success&product=still_us`;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            productId: 'still_us',
            successUrl,
            cancelUrl: `${window.location.origin}/paywall`,
          }),
        }
      );

      const json = await res.json();

      if (json.error === 'already_purchased') {
        // Already purchased — go straight to Session 2
        if (slug) {
          navigate(`/session/${slug}/session2-start`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

      if (!res.ok) {
        if (res.status === 503) {
          setError('Betalning är inte konfigurerad ännu. Kontakta oss!');
        } else {
          setError(json.error || 'Något gick fel');
        }
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Kunde inte starta betalningen');
    } finally {
      setProcessing(false);
    }
  }, [navigate, user?.id, slug]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      color: COLORS.lanternGlow,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 40px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}
      >
        <p style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: COLORS.deepSaffron,
          fontWeight: 600,
          marginBottom: '24px',
        }}>
          NI HADE PRECIS ERT FÖRSTA SAMTAL
        </p>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '28px',
          color: COLORS.lanternGlow,
          lineHeight: 1.3,
          marginBottom: '16px',
        }}>
          Det svåraste var att börja. Det gjorde ni just.
        </h1>

        <p style={{
          fontSize: '15px',
          color: COLORS.driftwoodBody,
          lineHeight: 1.6,
          marginBottom: '8px',
        }}>
          Vad ni startade ikväll är en resa genom 21 samtal — ämnen som de flesta par aldrig tar upp. Inte för att de inte vill, utan för att de inte vet hur.
        </p>

        <p style={{
          fontSize: '15px',
          color: COLORS.driftwoodBody,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Ni vet nu. Och resten väntar.
        </p>

        <div style={{
          backgroundColor: COLORS.emberGlow,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '16px',
            color: COLORS.lanternGlow,
            marginBottom: '12px',
          }}>
            Vad som händer härifrån:
          </p>
          {[
            'Ett samtal i taget — varje gång lite djupare',
            'Konflikter, längtan, val — ämnena ni behöver',
            'Skrivna reflektioner som ni kan komma tillbaka till',
            'En ceremoni efter sista samtalet som markerar vad ni byggt',
          ].map((line, i) => (
            <p key={i} style={{
              fontSize: '14px',
              color: COLORS.driftwoodBody,
              lineHeight: 1.5,
              paddingLeft: '12px',
              borderLeft: `2px solid ${COLORS.deepSaffron}33`,
              marginBottom: i < 3 ? '8px' : 0,
            }}>
              {line}
            </p>
          ))}
        </div>

        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '36px',
          color: COLORS.lanternGlow,
          marginBottom: '4px',
        }}>
          395 kr
        </div>
        <p style={{
          fontSize: '14px',
          color: COLORS.driftwood,
          marginBottom: '32px',
        }}>
          Ett beslut. Tillgång för alltid. Ingen prenumeration.
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchase}
          disabled={processing}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: processing ? `${COLORS.deepSaffron}99` : COLORS.deepSaffron,
            color: COLORS.emberNight,
            fontSize: '16px',
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 600,
            cursor: processing ? 'default' : 'pointer',
          }}
        >
          {processing ? 'Behandlar...' : 'Fortsätt resan'}
        </motion.button>

        {error && (
          <p style={{
            fontSize: '13px',
            color: '#E87C6A',
            marginTop: '12px',
          }}>
            {error}
          </p>
        )}

        {/* Test mode bypass — REMOVE BEFORE LAUNCH */}
        {isTestMode() && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (!user?.id) return;
              setProcessing(true);
              await supabase
                .from('couple_state')
                .update({ purchase_status: 'purchased', purchased_by: user.id } as any)
                .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`);
              if (slug) {
                navigate(`/session/${slug}/session2-start`, { replace: true });
              } else {
                navigate('/product/still-us', { replace: true });
              }
            }}
            disabled={processing}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '2px dashed #E8913A',
              backgroundColor: 'transparent',
              color: '#E8913A',
              fontSize: '14px',
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            Test: Hoppa över betalning
          </motion.button>
        )}

        <div
          onClick={() => navigate('/product/still-us')}
          style={{
            color: COLORS.driftwood,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Inte nu
        </div>
      </motion.div>
    </div>
  );
}