import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CompletionCeremony from '@/components/still-us/CompletionCeremony';
import { TOTAL_PROGRAM_CARDS } from '@/data/stillUsSequence';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/lib/stillUsTokens';

export default function CeremonyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [dissolved, setDissolved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, dissolved_at')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();
      if (cs) {
        setCoupleId(cs.couple_id);
        if (cs.dissolved_at) setDissolved(true);
      }
    })();
  }, [user?.id]);

  // Dissolved guard
  if (dissolved) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: COLORS.driftwood }}>
          Ert utrymme är avslutat.
        </p>
        <button
          onClick={() => navigate('/journey')}
          style={{
            marginTop: '24px',
            background: 'transparent',
            border: `1px solid ${COLORS.driftwood}`,
            color: COLORS.driftwood,
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '16px',
            borderRadius: '12px',
            padding: '14px 28px',
            cursor: 'pointer',
          }}
        >
          Se er resa
        </button>
      </div>
    );
  }

  return (
    <CompletionCeremony
      totalWeeks={TOTAL_PROGRAM_CARDS}
      onComplete={async (reflection) => {
        // Save ceremony_reflection to couple_state
        if (coupleId && reflection) {
          await supabase
            .from('couple_state')
            .update({
              ceremony_reflection: reflection,
              phase: 'maintenance',
              current_touch: 'complete',
            })
            .eq('couple_id', coupleId);
        } else if (coupleId) {
          // Even without reflection, transition to maintenance
          await supabase
            .from('couple_state')
            .update({
              phase: 'maintenance',
              current_touch: 'complete',
            })
            .eq('couple_id', coupleId);
        }
        navigate('/?product=still-us');
      }}
    />
  );
}
