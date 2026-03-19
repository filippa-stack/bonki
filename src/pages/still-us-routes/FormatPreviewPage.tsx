import { useState, useEffect } from 'react';
import FormatPreview from '@/components/still-us/FormatPreview';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function FormatPreviewPage() {
  const { user } = useAuth();
  const [hasPartner, setHasPartner] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('partner_id, partner_tier')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();
      if (cs) {
        setHasPartner(!!(cs.partner_id || cs.partner_tier === 'tier_2'));
      }
    })();
  }, [user?.id]);

  return <FormatPreview hasPartner={hasPartner} />;
}
