import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdgeFunction } from '@/lib/invokeEdgeFunction';

interface CoupleSpaceData {
  id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  created_at: string;
  paid_at: string | null;
}

interface CoupleSpaceState {
  space: CoupleSpaceData | null;
  loading: boolean;
  error: string | null;
  refreshSpace: () => Promise<void>;
  switchToNewSpace: () => Promise<{ ok: boolean; spaceId?: string }>;
}

export function useCoupleSpace(): CoupleSpaceState {
  const { user } = useAuth();
  const [space, setSpace] = useState<CoupleSpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const fetchSpace = useCallback(async () => {
    if (!userId) {
      setSpace(null);
      setLoading(false);
      return;
    }

    try {
      // Check for existing membership via couple_members
      const { data: memberships, error: memError } = await supabase
        .from('couple_members')
        .select('couple_space_id')
        .eq('user_id', userId)
        .is('left_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (memError) throw memError;

      const membership = memberships && memberships.length > 0 ? memberships[0] : null;

      if (membership) {
        const { data: spaceData, error: spaceError } = await supabase
          .from('couple_spaces_safe' as any)
          .select('*')
          .eq('id', membership.couple_space_id)
          .maybeSingle();

        if (spaceError) throw spaceError;
        setSpace(spaceData as unknown as CoupleSpaceData);
      } else {
        // No active membership — auto-create a new space
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error('No auth session');

        const res = await invokeEdgeFunction('create-couple-space', {
          headers: { Authorization: `Bearer ${accessToken}` },
          context: { userId },
        });

        if (res.error) throw new Error(res.error.message || 'Failed to create couple space');

        const result = res.data as { space: CoupleSpaceData };
        setSpace(result.space);
      }
    } catch (err: any) {
      console.error('CoupleSpace error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  // Realtime: re-fetch when the couple_spaces row changes
  useEffect(() => {
    if (!userId || !space?.id) return;
    const spaceId = space.id;

    const channel = supabase
      .channel(`couple_spaces_${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_spaces',
          filter: `id=eq.${spaceId}`,
        },
        () => fetchSpace()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, space?.id, fetchSpace]);

  const switchToNewSpace = useCallback(async (): Promise<{ ok: boolean; spaceId?: string }> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('No auth session');

      // Leave current membership and create a fresh space via create-couple-space
      if (space?.id) {
        // Soft-leave current membership
        await supabase
          .from('couple_members')
          .update({
            status: 'left',
            left_at: new Date().toISOString(),
            left_by: userId,
            left_reason: 'new_space',
          })
          .eq('user_id', userId!)
          .eq('couple_space_id', space.id)
          .is('left_at', null);
      }

      // Create fresh space
      const res = await invokeEdgeFunction('create-couple-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
        context: { userId },
      });

      if (res.error) throw new Error(res.error.message || 'Failed to create space');

      const result = res.data as { space: CoupleSpaceData };
      setSpace(result.space);
      return { ok: true, spaceId: result.space.id };
    } catch (err: any) {
      console.error('switchToNewSpace error:', err);
      return { ok: false };
    }
  }, [space?.id, userId]);

  return {
    space,
    loading,
    error,
    refreshSpace: fetchSpace,
    switchToNewSpace,
  };
}
