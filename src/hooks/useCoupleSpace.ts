import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { hasPendingInvite } from '@/hooks/usePendingInvite';
import { toast } from 'sonner';

interface CoupleSpaceData {
  id: string;
  partner_a_name: string | null;
  partner_b_name: string | null;
  created_at: string;
}

interface InviteInfo {
  invite_code: string;
  invite_token: string;
}

interface CoupleSpaceState {
  space: CoupleSpaceData | null;
  loading: boolean;
  error: string | null;
  /** Raw count — use for logic (step gating, etc.) */
  memberCount: number;
  /** Debounced count — use for display to avoid flicker */
  displayMemberCount: number;
  userRole: string | null;
  refreshSpace: () => Promise<void>;
  /** Fetch invite info on demand — never stored in space object */
  fetchInviteInfo: () => Promise<InviteInfo | null>;
  switchToNewSpace: () => Promise<{ ok: boolean; spaceId?: string }>;
}

export function useCoupleSpace(): CoupleSpaceState {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [space, setSpace] = useState<CoupleSpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const prevMemberCountRef = useRef<number>(0);

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
        .is('left_at', null)
        .order('created_at', { ascending: true })
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

        // Count members
        const { count } = await supabase
          .from('couple_members')
          .select('id', { count: 'exact', head: true })
          .eq('couple_space_id', membership.couple_space_id)
          .is('left_at', null);

        setSpace(spaceData as unknown as CoupleSpaceData);
        setMemberCount(count ?? 1);
        prevMemberCountRef.current = count ?? 1;
        setUserRole(membership.role);
      } else {
        // No active membership — auto-create a new space
        // Don't auto-create if there's a pending invite — let the claim finish first
        if (hasPendingInvite()) {
          setLoading(false);
          return;
        }

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

  /** Fetch invite info on demand via secure RPC — never cached in state */
  const fetchInviteInfo = useCallback(async (): Promise<InviteInfo | null> => {
    try {
      const { data, error } = await supabase.rpc('get_own_invite_info' as any);
      if (error) throw error;
      const rows = data as unknown as InviteInfo[];
      return rows && rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Failed to fetch invite info:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  // Realtime: update memberCount when couple_members changes
  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;

    const fetchCount = async () => {
      const { count } = await supabase
        .from('couple_members')
        .select('id', { count: 'exact', head: true })
        .eq('couple_space_id', space.id)
        .is('left_at', null);
      if (!cancelled) {
        const newCount = count ?? 1;
        const prev = prevMemberCountRef.current;
        // Partner join is handled by PartnerConnectedBanner (persistent checkpoint)
        prevMemberCountRef.current = newCount;
        setMemberCount(newCount);
      }
    };

    // Immediate fetch
    fetchCount();

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
        () => fetchCount()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [space?.id]);

  // Debounced display value to prevent UI flicker on rapid realtime updates
  const [displayMemberCount, setDisplayMemberCount] = useState(memberCount);
  const displayTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    displayTimerRef.current = setTimeout(() => {
      setDisplayMemberCount(memberCount);
    }, 400);
    return () => {
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    };
  }, [memberCount]);

  const switchToNewSpace = useCallback(async (): Promise<{ ok: boolean; spaceId?: string }> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('No auth session');

      const res = await supabase.functions.invoke('leave-and-create-new-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.error) throw new Error(res.error.message || 'Failed to create new space');

      const result = res.data as { space: CoupleSpaceData; memberCount: number; role: string };
      setSpace(result.space);
      setMemberCount(result.memberCount);
      setUserRole(result.role);
      return { ok: true, spaceId: result.space.id };
    } catch (err: any) {
      console.error('switchToNewSpace error:', err);
      return { ok: false };
    }
  }, []);

  return {
    space,
    loading,
    error,
    memberCount,
    displayMemberCount,
    userRole,
    refreshSpace: fetchSpace,
    fetchInviteInfo,
    switchToNewSpace,
  };
}
