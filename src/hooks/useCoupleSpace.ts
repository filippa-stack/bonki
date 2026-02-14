import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CoupleSpaceData {
  id: string;
  invite_code: string;
  invite_token: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  created_at: string;
}

interface CoupleSpaceState {
  space: CoupleSpaceData | null;
  loading: boolean;
  error: string | null;
  memberCount: number;
  userRole: string | null;
  refreshSpace: () => Promise<void>;
}

export function useCoupleSpace(): CoupleSpaceState {
  const { user } = useAuth();
  const [space, setSpace] = useState<CoupleSpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchSpace = useCallback(async () => {
    if (!user) {
      setSpace(null);
      setLoading(false);
      return;
    }

    try {
      // Check for existing membership
      const { data: memberships, error: memError } = await supabase
        .from('couple_members')
        .select('couple_space_id, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (memError) throw memError;

      const membership = memberships && memberships.length > 0 ? memberships[0] : null;

      if (membership) {
        // Fetch the space
        const { data: spaceData, error: spaceError } = await supabase
          .from('couple_spaces')
          .select('*')
          .eq('id', membership.couple_space_id)
          .maybeSingle();

        if (spaceError) throw spaceError;

        // Count members
        const { count } = await supabase
          .from('couple_members')
          .select('id', { count: 'exact', head: true })
          .eq('couple_space_id', membership.couple_space_id);

        setSpace(spaceData as CoupleSpaceData);
        setMemberCount(count ?? 1);
        setUserRole(membership.role);
      } else {
        // Bootstrap atomically via edge function
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error('No auth session');

        const res = await supabase.functions.invoke('create-couple-space', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.error) throw new Error(res.error.message || 'Failed to create couple space');

        const result = res.data as { space: CoupleSpaceData; memberCount: number; role: string };
        setSpace(result.space);
        setMemberCount(result.memberCount);
        setUserRole(result.role);
      }
    } catch (err: any) {
      console.error('CoupleSpace error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  // Realtime: update memberCount when couple_members changes
  useEffect(() => {
    if (!space?.id) return;

    const channel = supabase
      .channel(`couple_members_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_members',
          filter: `couple_space_id=eq.${space.id}`,
        },
        async () => {
          const { count } = await supabase
            .from('couple_members')
            .select('id', { count: 'exact', head: true })
            .eq('couple_space_id', space.id);
          setMemberCount(count ?? 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [space?.id]);

  return {
    space,
    loading,
    error,
    memberCount,
    userRole,
    refreshSpace: fetchSpace,
  };
}
