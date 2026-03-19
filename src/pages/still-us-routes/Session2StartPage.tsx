import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardIdFromSlug, cardIndexFromSlug, COLORS } from '@/lib/stillUsTokens';
import { getSliderSetBySlug } from '@/data/sliderPrompts';
import { getReorientationSummary } from '@/data/reorientationSummaries';
import { EASE, EMOTION } from '@/lib/motion';

type PageState = 'loading' | 'blocked' | 'ready';

interface TakeawayData {
  initiatorTakeaway: string | null;
  partnerTakeaway: string | null;
}

export default function Session2StartPage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [takeaways, setTakeaways] = useState<TakeawayData>({ initiatorTakeaway: null, partnerTakeaway: null });
  const [deviceId, setDeviceId] = useState<string>('');

  const backendCardId = slug ? cardIdFromSlug(slug) : null;
  const cardIndex = slug ? cardIndexFromSlug(slug) : -1;
  const sliderSet = slug ? getSliderSetBySlug(slug) : undefined;
  const weekNumber = cardIndex >= 0 ? cardIndex + 1 : 0;
  const cardTitle = sliderSet?.cardTitle ?? '';

  useEffect(() => {
    if (!user?.id || !slug || !backendCardId || cardIndex < 0) return;

    const init = async () => {
      // Device ID
      let did = localStorage.getItem('still_us_device_id');
      if (!did) {
        did = crypto.randomUUID();
        localStorage.setItem('still_us_device_id', did);
      }
      setDeviceId(did);

      // Get couple_state
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, initiator_id, partner_id, partner_tier, tier_2_pseudo_id, cycle_id')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();

      if (!cs) {
        navigate('/', { replace: true });
        return;
      }

      // Acquire session lock via RPC
      const { data: lockResult, error: lockError } = await supabase.rpc('acquire_session_lock', {
        p_couple_space_id: cs.couple_id,
        p_card_index: cardIndex,
      });

      const lock = lockResult as { acquired: boolean; device_id: string } | null;

      if (lockError || !lock?.acquired) {
        setPageState('blocked');
        return;
      }

      // Store the device_id from the lock
      localStorage.setItem('still_us_device_id', lock.device_id);
      setDeviceId(lock.device_id);

      // Fetch takeaways based on tier
      let initiatorTakeaway: string | null = null;
      let partnerTakeaway: string | null = null;

      // Initiator takeaway
      const { data: initiatorState } = await supabase
        .from('user_card_state')
        .select('session_1_takeaway')
        .eq('couple_id', cs.couple_id)
        .eq('card_id', backendCardId)
        .eq('cycle_id', cs.cycle_id)
        .eq('user_id', cs.initiator_id)
        .maybeSingle();

      initiatorTakeaway = initiatorState?.session_1_takeaway ?? null;

      // Partner takeaway — tier-aware
      if (cs.partner_tier === 'tier_3' && cs.partner_id) {
        const { data: partnerState } = await supabase
          .from('user_card_state')
          .select('session_1_takeaway')
          .eq('couple_id', cs.couple_id)
          .eq('card_id', backendCardId)
          .eq('cycle_id', cs.cycle_id)
          .eq('user_id', cs.partner_id)
          .maybeSingle();
        partnerTakeaway = partnerState?.session_1_takeaway ?? null;
      } else if (cs.partner_tier === 'tier_2' && cs.tier_2_pseudo_id) {
        const { data: partnerState } = await supabase
          .from('user_card_state')
          .select('session_1_takeaway')
          .eq('couple_id', cs.couple_id)
          .eq('card_id', backendCardId)
          .eq('cycle_id', cs.cycle_id)
          .eq('user_id', cs.tier_2_pseudo_id)
          .maybeSingle();
        partnerTakeaway = partnerState?.session_1_takeaway ?? null;
      } else {
        // Tier 1 — check anonymous_session_takeaway
        const { data: anonTakeaway } = await supabase
          .from('anonymous_session_takeaway')
          .select('session_1_takeaway')
          .eq('couple_id', cs.couple_id)
          .eq('card_id', backendCardId)
          .eq('cycle_id', cs.cycle_id)
          .maybeSingle();
        partnerTakeaway = anonTakeaway?.session_1_takeaway ?? null;
      }

      setTakeaways({ initiatorTakeaway, partnerTakeaway });
      setPageState('ready');
    };

    init();
  }, [user?.id, slug, backendCardId, cardIndex, navigate]);

  const hasTakeaways = !!(takeaways.initiatorTakeaway || takeaways.partnerTakeaway);
  const fallbackSummary = getReorientationSummary(cardIndex);

  // Loading state
  if (pageState === 'loading') {
    return (
      <div style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} />
    );
  }

  // Blocked state
  if (pageState === 'blocked') {
    return (
      <div style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
      }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '18px',
          color: COLORS.lanternGlow,
          textAlign: 'center',
        }}>
          Ert samtal pågår just nu
        </p>
      </div>
    );
  }

  // Ready state
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{
          maxWidth: '360px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Title */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '22px',
          color: COLORS.lanternGlow,
          textAlign: 'center',
          margin: 0,
        }}>
          Samtal 2: Vänd + Tänk om
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: COLORS.deepSaffron,
          textAlign: 'center',
          marginTop: '8px',
          fontFamily: 'var(--font-sans)',
        }}>
          Vecka {weekNumber} · {cardTitle}
        </p>

        {/* Reorientation content */}
        <div style={{ marginTop: '40px', width: '100%' }}>
          {hasTakeaways ? (
            <>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '16px',
                color: `${COLORS.lanternGlow}B3`,
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                Förra gången skrev ni:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {takeaways.initiatorTakeaway && (
                  <div style={{
                    backgroundColor: COLORS.emberGlow,
                    padding: '16px',
                    borderRadius: '12px',
                    color: COLORS.lanternGlow,
                    fontSize: '16px',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {takeaways.initiatorTakeaway}
                  </div>
                )}
                {takeaways.partnerTakeaway && (
                  <div style={{
                    backgroundColor: COLORS.emberGlow,
                    padding: '16px',
                    borderRadius: '12px',
                    color: COLORS.lanternGlow,
                    fontSize: '16px',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {takeaways.partnerTakeaway}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '16px',
                color: `${COLORS.lanternGlow}B3`,
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                Förra gången pratade ni om:
              </p>
              <div style={{
                backgroundColor: COLORS.emberGlow,
                padding: '16px',
                borderRadius: '12px',
                color: COLORS.lanternGlow,
                fontSize: '16px',
                lineHeight: 1.5,
                fontFamily: 'var(--font-sans)',
              }}>
                {fallbackSummary}
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/session/${slug}/live-session2`)}
          style={{
            marginTop: '40px',
            width: '100%',
            maxWidth: '320px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          Vi är redo
        </motion.button>
      </motion.div>
    </div>
  );
}
