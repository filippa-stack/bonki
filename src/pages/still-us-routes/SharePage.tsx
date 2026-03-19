import { useState, useEffect } from 'react';
import Share from '@/components/still-us/Share';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function SharePage() {
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();
  const [partnerLinkToken, setPartnerLinkToken] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [cardTitle, setCardTitle] = useState<string | undefined>();

  useEffect(() => {
    if (!space?.id) return;

    // Fetch couple_state for partner_link_token and card info
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('partner_link_token, partner_id, partner_tier, current_card_index')
        .eq('couple_id', space.id)
        .maybeSingle();

      if (cs) {
        setPartnerLinkToken(cs.partner_link_token ?? null);
        setHasPartner(!!(cs.partner_id || cs.partner_tier === 'tier_2'));
        setWeekNumber((cs.current_card_index ?? 0) + 1);
      }
    })();
  }, [space?.id]);

  // Build the real share link pointing to the partner check-in portal
  const shareLink = partnerLinkToken
    ? `${window.location.origin}/check-in/?token=${partnerLinkToken}`
    : '';

  return (
    <Share
      coupleId={space?.id}
      hasPartner={hasPartner}
      weekNumber={weekNumber}
      cardTitle={cardTitle}
      shareLink={shareLink}
    />
  );
}
