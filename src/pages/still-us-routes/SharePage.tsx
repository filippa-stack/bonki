import Share from '@/components/still-us/Share';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';

export default function SharePage() {
  const { space } = useCoupleSpaceContext();
  // TODO: derive real signed link from couple_state.partner_link_token
  const shareLink = space?.id ? `${window.location.origin}/join/${space.id}` : '';

  return (
    <Share
      coupleId={space?.id}
      shareLink={shareLink}
    />
  );
}
