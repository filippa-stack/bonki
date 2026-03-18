import { useState, useEffect } from 'react';
import FormatPreview from '@/components/still-us/FormatPreview';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function FormatPreviewPage() {
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();
  const [hasPartner, setHasPartner] = useState(false);

  useEffect(() => {
    if (!space?.id || !user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_space_id', space.id)
        .is('left_at', null);
      setHasPartner((data?.length ?? 0) > 1);
    })();
  }, [space?.id, user?.id]);

  return <FormatPreview hasPartner={hasPartner} />;
}
