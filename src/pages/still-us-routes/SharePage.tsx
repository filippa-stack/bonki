import { useState, useEffect } from 'react';
import Share from '@/components/still-us/Share';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { slugFromCardIndex } from '@/lib/stillUsTokens';

export default function SharePage() {
  const { user } = useAuth();
  const [partnerLinkToken, setPartnerLinkToken] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [cardTitle, setCardTitle] = useState<string | undefined>();
  const [realCoupleId, setRealCoupleId] = useState<string | undefined>();
  const [cardSlug, setCardSlug] = useState<string | undefined>();

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, partner_link_token, partner_id, partner_tier, current_card_index')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();

      if (cs) {
        const idx = cs.current_card_index ?? 0;
        setRealCoupleId(cs.couple_id);
        setPartnerLinkToken(cs.partner_link_token ?? null);
        setHasPartner(!!(cs.partner_id || cs.partner_tier === 'tier_2'));
        setWeekNumber(idx + 1);
        setCardSlug(slugFromCardIndex(idx) ?? undefined);
      }
    })();
  }, [user?.id]);

  const shareLink = partnerLinkToken
    ? `${window.location.origin}/check-in/index.html?token=${partnerLinkToken}`
    : '';

  return (
    <Share
      coupleId={realCoupleId}
      hasPartner={hasPartner}
      weekNumber={weekNumber}
      cardTitle={cardTitle}
      cardSlug={cardSlug}
      shareLink={shareLink}
    />
  );
}
