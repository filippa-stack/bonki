import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import Tier2Setup from '@/components/still-us/Tier2Setup';

export default function Tier2SetupPage() {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();

  return (
    <Tier2Setup
      onComplete={async (partnerName) => {
        if (space?.id) {
           await supabase
            .from('couple_state')
            .update({ tier_2_partner_name: partnerName })
            .eq('couple_id', space.id);
        }
        navigate('/?product=still-us');
      }}
      onBack={() => navigate('/?product=still-us')}
    />
  );
}
