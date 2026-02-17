import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useDevState } from '@/contexts/DevStateContext';

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
  const { space, memberCount } = useCoupleSpace();
  const devState = useDevState();
  const isPaired = memberCount >= 2;
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    if (!user || !space || devState) {
      setProposals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('topic_proposals')
      .select('*')
      .eq('couple_space_id', space.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProposals(data as unknown as Proposal[]);
    }
    setLoading(false);
  }, [user, space, devState]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Realtime subscription
  useEffect(() => {
    if (!space || devState) return;

    const channel = supabase
      .channel('proposals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topic_proposals',
          filter: `couple_space_id=eq.${space.id}`,
        },
        () => {
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [space, fetchProposals]);

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
  ): Promise<{ success: boolean; session?: any }> => {
    if (!isPaired || devState) return { success: false };

    // 1. Legacy JSON session via edge function (still authoritative for UI)
    const res = await supabase.functions.invoke('activate-session', {
      body: { proposal_id: proposalId },
    });

    if (res.error) {
      console.error('Failed to activate session:', res.error);
      return { success: false };
    }

    const data = res.data as any;
    if (!data?.success) return { success: false };

    // 2. Dual-write: also create normalized session (fire-and-forget, non-blocking)
    if (space?.id && data.session?.cardId) {
      const STEP_COUNT = 4;
      supabase.rpc('activate_couple_session', {
        p_couple_space_id: space.id,
        p_category_id: data.session.categoryId ?? null,
        p_card_id: data.session.cardId,
        p_step_count: STEP_COUNT,
      }).then(({ error: normErr }) => {
        if (normErr) console.warn('Normalized session dual-write failed (non-fatal):', normErr);
      });
    }

    return { success: true, session: data?.session };
  }, [space]);

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
