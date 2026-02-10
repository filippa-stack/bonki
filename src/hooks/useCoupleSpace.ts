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

function generateInviteCode(): string {
  // 6-char human-friendly code (uppercase, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return code;
}

function generateInviteToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
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
      const { data: membership, error: memError } = await supabase
        .from('couple_members')
        .select('couple_space_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memError) throw memError;

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
        // Bootstrap: create new couple space
        const invite_code = generateInviteCode();
        const invite_token = generateInviteToken();

        const { data: newSpace, error: createError } = await supabase
          .from('couple_spaces')
          .insert({ invite_code, invite_token })
          .select()
          .single();

        if (createError) throw createError;

        // Create membership
        const { error: memberError } = await supabase
          .from('couple_members')
          .insert({
            couple_space_id: newSpace.id,
            user_id: user.id,
            role: 'partner_a',
          });

        if (memberError) throw memberError;

        setSpace(newSpace as CoupleSpaceData);
        setMemberCount(1);
        setUserRole('partner_a');
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

  return {
    space,
    loading,
    error,
    memberCount,
    userRole,
    refreshSpace: fetchSpace,
  };
}
