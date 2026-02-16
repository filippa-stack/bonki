import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';

export interface Proposal {
  id: string;
  couple_space_id: string;
  card_id: string;
  category_id: string;
  proposed_by: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'saved_for_later';
  created_at: string;
  updated_at: string;
}

export function useProposals() {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    if (!user || !space) {
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
  }, [user, space]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Realtime subscription
  useEffect(() => {
    if (!space) return;

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
    if (!user || !space) return { ok: false };

    // Check if there's already a pending proposal for this exact card (avoid duplicates)
    const existingForCard = proposals.find(
      p => p.status === 'pending' && p.card_id === cardId && p.couple_space_id === space.id
    );
    if (existingForCard) return { ok: true }; // Already proposed

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
  }, [user, space, proposals, fetchProposals]);

  const updateProposalStatus = useCallback(async (
    proposalId: string,
    status: 'accepted' | 'saved_for_later'
  ) => {
    // Race-safe: if proposal is already not pending, just proceed silently
    const { error } = await supabase
      .from('topic_proposals')
      .update({ status } as any)
      .eq('id', proposalId);

    if (error) {
      console.warn('Failed to update proposal (may already be handled):', error);
    }

    await fetchProposals();
  }, [fetchProposals]);

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
    refetch: fetchProposals,
  };
}
