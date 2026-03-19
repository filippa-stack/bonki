import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Tier2Setup from '@/components/still-us/Tier2Setup';

export default function Tier2SetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Tier2Setup
      onComplete={async (partnerName) => {
        if (user?.id) {
           await supabase
            .from('couple_state')
            .update({ tier_2_partner_name: partnerName })
            .eq('initiator_id', user.id);
        }
        navigate('/?product=still-us');
      }}
      onBack={() => navigate('/?product=still-us')}
    />
  );
}
