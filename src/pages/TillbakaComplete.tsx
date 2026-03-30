/**
 * TillbakaComplete — Simplified completion screen for Tillbaka (maintenance) sessions.
 * No partner handoff, no Gör exercise, no Session 2.
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COLORS } from '@/lib/stillUsTokens';
import { completeSession } from '@/lib/stillUsRpc';

export default function TillbakaComplete() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  // slug format: "tillbaka-0", "tillbaka-1", etc.
  const tillbakaIndex = parseInt(slug?.replace('tillbaka-', '') ?? '0', 10) || 0;
  const backendCardId = `tillbaka_${tillbakaIndex + 1}`;

  const [takeaway, setTakeaway] = useState('');
  const [saving, setSaving] = useState(false);
  const [deviceId] = useState(() => localStorage.getItem('still_us_device_id') ?? '');

  const handleComplete = useCallback(async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/'); return; }

    const { data: couple } = await supabase
      .from('couple_state')
      .select('couple_id, cycle_id')
      .eq('initiator_id', user.id)
      .single();

    if (!couple) { navigate('/'); return; }

    await completeSession({
      couple_id: couple.couple_id,
      card_id: backendCardId,
      session_number: 1,
      device_id: deviceId,
      session_type: 'tillbaka',
      card_takeaway: takeaway || null,
    });

    navigate('/');
  }, [backendCardId, deviceId, takeaway, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '340px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '24px',
          color: COLORS.deepSaffron,
          marginBottom: '12px',
        }}>
          Bra att ni pratade.
        </div>

        <div style={{
          fontSize: '15px',
          color: COLORS.driftwood,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Skriv vad ni vill minnas
        </div>

        <textarea
          value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)}
          placeholder=""
          style={{
            width: '100%',
            minHeight: '120px',
            background: COLORS.emberGlow,
            color: COLORS.lanternGlow,
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            marginBottom: '12px',
          }}
        />
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontStyle: 'italic',
          color: COLORS.driftwood,
          opacity: 0.6,
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Det ni skriver sparas i era samtal
        </p>

        <button
          onClick={handleComplete}
          disabled={saving}
          style={{
            background: COLORS.deepSaffron,
            color: COLORS.emberNight,
            border: 'none',
            borderRadius: '30px',
            padding: '16px 40px',
            fontSize: '18px',
            fontFamily: "'DM Serif Display', serif",
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            width: '100%',
            maxWidth: '280px',
          }}
        >
          {saving ? 'Sparar...' : 'Tillbaka hem'}
        </button>
      </div>
    </div>
  );
}
