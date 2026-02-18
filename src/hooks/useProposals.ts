import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useDevState } from '@/contexts/DevStateContext';
import { notifyPartnerByEmail } from '@/lib/notifyPartnerByEmail';
import { invokeEdgeFunction } from '@/lib/invokeEdgeFunction';

export interface Proposal {
  id: string;
  couple_space_id: string;
  card_id: string;
  category_id: string;
  proposed_by: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'saved_for_later';
  accepted_by: string | null;
  declined_by: string | null;
  responded_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProposals() {
  const { user } = useAuth();
  const { space, memberCount } = useCoupleSpaceContext();
  const devState = useDevState();
  const isPaired = memberCount >= 2;
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;
  const spaceId = space?.id;

  // Stable ref so the realtime callback never needs to close over fetchProposals identity
  const fetchRef = useRef<() => Promise<void>>();

  const fetchProposals = useCallback(async () => {
    if (!userId || !spaceId || devState) {
      setProposals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('topic_proposals')
      .select('*')
      .eq('couple_space_id', spaceId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProposals(data as unknown as Proposal[]);
    }
    setLoading(false);
  }, [userId, spaceId, devState]);

  // Keep ref in sync so realtime handler always calls the latest version
  useEffect(() => {
    fetchRef.current = fetchProposals;
  }, [fetchProposals]);

  // Initial fetch on mount / when identity changes
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Realtime subscription — scoped to spaceId, no dependency on fetchProposals
  useEffect(() => {
    if (!userId || !spaceId || devState) return;

    const channel = supabase
      .channel(`proposals-realtime-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topic_proposals',
          filter: `couple_space_id=eq.${spaceId}`,
        },
        () => {
          fetchRef.current?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, spaceId, devState]);

  const sendProposal = useCallback(async (
    cardId: string,
    categoryId: string,
    message?: string
  ): Promise<{ ok: boolean }> => {
    if (!user || !space || !isPaired || devState) return { ok: false };

    // Check if there's already a pending proposal for this exact card (avoid duplicates)
    const existingForCard = proposals.find(
      p => p.status === 'pending' && p.card_id === cardId && p.couple_space_id === space.id
    );
    if (existingForCard) return { ok: true }; // Already proposed

    // Withdraw any other pending proposals from this user in this space
    const otherPending = proposals.filter(
      p => p.status === 'pending' && p.proposed_by === user.id && p.couple_space_id === space.id
    );
    for (const old of otherPending) {
      await supabase
        .from('topic_proposals')
        .update({ status: 'withdrawn' } as any)
        .eq('id', old.id);
    }

    const { error } = await supabase
      .from('topic_proposals')
      .insert({
        couple_space_id: space.id,
        card_id: cardId,
        category_id: categoryId,
        proposed_by: user.id,
        message: message || null,
        status: 'pending',
      } as any);

    if (error) {
      console.error('Failed to send proposal:', error);
      return { ok: false };
    }

    await fetchProposals();

    // Fire-and-forget: notify partner by email
    // Find partner's user_id from couple_members
    const { data: members } = await supabase
      .from('couple_members')
      .select('user_id')
      .eq('couple_space_id', space.id)
      .is('left_at', null)
      .eq('status', 'active')
      .neq('user_id', user.id)
      .limit(1);

    const partnerUserId = members?.[0]?.user_id;
    if (partnerUserId) {
      // Get the proposal ID we just created
      const { data: latestProposal } = await supabase
        .from('topic_proposals')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('proposed_by', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      notifyPartnerByEmail({
        type: 'proposal',
        couple_space_id: space.id,
        receiver_user_id: partnerUserId,
        proposal_id: latestProposal?.[0]?.id,
      });
    }

    return { ok: true };
  }, [user, space, isPaired, proposals, fetchProposals]);

  const updateProposalStatus = useCallback(async (
    proposalId: string,
    status: 'accepted' | 'declined' | 'saved_for_later'
  ) => {
    if (!user || !isPaired || devState) return;

    const updatePayload: Record<string, any> = { status };

    if (status === 'accepted') {
      updatePayload.accepted_by = user.id;
      updatePayload.responded_at = new Date().toISOString();
    } else if (status === 'declined') {
      updatePayload.declined_by = user.id;
      updatePayload.responded_at = new Date().toISOString();
    }

    // Race-safe: if proposal is already not pending, just proceed silently
    const { error } = await supabase
      .from('topic_proposals')
      .update(updatePayload as any)
      .eq('id', proposalId);

    if (error) {
      console.warn('Failed to update proposal (may already be handled):', error);
    }

    await fetchProposals();
  }, [user, fetchProposals]);

  /** Activate a session from an accepted proposal via the secure edge function.
   *  Also writes to the normalized couple_sessions tables. */
  const activateSession = useCallback(async (
    proposalId: string
  ): Promise<{ success: boolean; session?: any; errorMessage?: string }> => {
    if (!isPaired || devState) return { success: false, errorMessage: 'not paired or devState active' };

    // 0. Verify caller is active member of the proposal's space
    if (!space?.id) return { success: false, errorMessage: 'no_active_space' };

    // Use memberCount from context instead of extra network request
    if (memberCount < 2) {
      return { success: false, errorMessage: 'Detta utrymme är inte längre aktivt.' };
    }

    // 1. Edge function call
    const res = await invokeEdgeFunction('activate-session', {
      body: { proposal_id: proposalId },
      context: { userId: user?.id, spaceId: space?.id },
    });

    const data = res.data as any;

    if (res.error || !data?.success) {
      // Extract structured error from edge function response
      const edgeErr = data?.error;
      const errMsg = edgeErr?.message || res.error?.message || 'unknown error';
      return { success: false, errorMessage: errMsg };
    }

    // 2. Dual-write: normalized session via RPC
    if (space?.id && data.session?.cardId) {
      const STEP_COUNT = 4;
      const rpcParams = {
        p_couple_space_id: space.id,
        p_category_id: data.session.categoryId ?? null,
        p_card_id: data.session.cardId,
        p_step_count: STEP_COUNT,
      };
      console.log('[DIAG] activate_couple_session RPC params:', rpcParams);

      try {
        const { data: rpcData, error: normErr } = await supabase.rpc('activate_couple_session', rpcParams);
        if (normErr) {
          console.error('[DIAG] activate_couple_session RPC error:', {
            message: normErr.message,
            code: normErr.code,
            details: normErr.details,
            hint: normErr.hint,
            full: normErr,
          });
          return { success: false, errorMessage: `RPC: ${normErr.message} (code: ${normErr.code}, details: ${normErr.details}, hint: ${normErr.hint})` };
        }
        console.log('[DIAG] activate_couple_session RPC success, sessionId:', rpcData);
      } catch (err: any) {
        console.error('[DIAG] activate_couple_session RPC threw:', err);
        return { success: false, errorMessage: `RPC threw: ${err?.message || String(err)}` };
      }
    }

    return { success: true, session: data?.session };
  }, [space, memberCount]);

  // Get pending proposals from partner (not own)
  const incomingProposals = proposals.filter(
    p => p.status === 'pending' && p.proposed_by !== user?.id
  );

  // Get own pending proposals
  const ownPendingProposals = proposals.filter(
    p => p.status === 'pending' && p.proposed_by === user?.id
  );

  // Get saved proposals
  const savedProposals = proposals.filter(
    p => p.status === 'saved_for_later'
  );

  return {
    proposals,
    incomingProposals,
    ownPendingProposals,
    savedProposals,
    loading,
    sendProposal,
    updateProposalStatus,
    activateSession,
    refetch: fetchProposals,
  };
}
