import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TillbakaSessionLive from '@/components/still-us/TillbakaSessionLive';
import { getTillbakaCard } from '@/data/tillbakaCards';
import { completeSession } from '@/lib/stillUsRpc';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TillbakaPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const indexStr = cardId?.replace('tillbaka-', '') ?? '0';
  const tillbakaIndex = parseInt(indexStr, 10) || 0;
  const card = getTillbakaCard(tillbakaIndex);

  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let did = localStorage.getItem('still_us_device_id');
    if (!did) { did = crypto.randomUUID(); localStorage.setItem('still_us_device_id', did); }
    setDeviceId(did);

    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();
      if (cs) setCoupleId(cs.couple_id);
    })();
  }, [user?.id]);

  const backendCardId = `tillbaka_${tillbakaIndex + 1}`;

  return (
    <TillbakaSessionLive
      tillbakaIndex={tillbakaIndex}
      title={card?.title ?? 'Tillbaka'}
      question1={card?.question1 ?? '[PLACEHOLDER]'}
      question2={card?.question2 ?? '[PLACEHOLDER]'}
      onComplete={async (notes) => {
        if (coupleId) {
          await completeSession({
            couple_id: coupleId,
            card_id: backendCardId,
            session_number: 1,
            device_id: deviceId,
            session_type: 'tillbaka',
            card_takeaway: notes['tb-1'] || notes['tb-0'] || null,
          });
        }
        navigate('/product/still-us');
      }}
      onPause={() => navigate('/product/still-us')}
    />
  );
}
