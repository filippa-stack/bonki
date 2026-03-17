import { useNavigate } from 'react-router-dom';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import Share from '@/components/still-us/Share';

export default function SharePage() {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  // TODO: derive real invite link from couple_state.partner_link_token
  const inviteLink = space?.id ? `${window.location.origin}/join/${space.id}` : '';

  return (
    <Share
      inviteLink={inviteLink}
      partnerJoined={false}
      onPartnerJoined={() => navigate('/')}
      onSkip={() => navigate('/')}
    />
  );
}
