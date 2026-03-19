import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { COLORS } from '@/lib/stillUsTokens';
import { useAuth } from '@/contexts/AuthContext';

export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  // Fetch couple_id + current slug for redirect after purchase
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, current_card_index')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();
      if (cs) {
        setCoupleId(cs.couple_id);
        setSlug(`kort-${cs.current_card_index + 1}`);
      }
    })();
  }, [user?.id]);

  const handlePurchase = useCallback(async () => {
    if (!user?.id || !coupleId) return;

    await supabase
      .from('couple_state')
      .update({
        purchase_status: 'purchased',
        purchased_by: user.id,
      })
      .eq('couple_id', coupleId);

    // Navigate to Session 2 Start — session state preserved
    if (slug) {
      navigate(`/session/${slug}/session2-start`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, user?.id, coupleId, slug]);

  return (
    <div style={{
      minHeight: '100dvh',
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
        {/* Emotional framing */}
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
          Vad ni startade ikväll är en resa genom 22 veckor — ämnen som de flesta par aldrig tar upp. Inte för att de inte vill, utan för att de inte vet hur.
        </p>

        <p style={{
          fontSize: '15px',
          color: COLORS.driftwoodBody,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Ni vet nu. Och resten väntar.
        </p>

        {/* What's ahead — outcome-based */}
        <div style={{
          backgroundColor: `${COLORS.emberGlow}`,
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
            'Varje vecka — ett nytt samtal som tar er djupare',
            'Konflikter, längtan, val — ämnena ni behöver',
            'Skrivna reflektioner som ni kan komma tillbaka till',
            'En ceremoni efter 22 veckor som markerar vad ni byggt',
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

        {/* Pricing */}
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
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: COLORS.deepSaffron,
            color: COLORS.emberNight,
            fontSize: '16px',
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Fortsätt resan
        </motion.button>

        <div
          onClick={() => navigate('/')}
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
