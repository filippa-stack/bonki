/**
 * useProposals — Volume 1 stub.
 * Proposals are a two-user feature (topic_proposals table).
 * In Volume 1 (single-writer, single-account) this hook is a no-op.
 * All fields return empty/false defaults so downstream consumers compile.
 */

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
  return {
    proposals: [] as Proposal[],
    incomingProposals: [] as Proposal[],
    ownPendingProposals: [] as Proposal[],
    savedProposals: [] as Proposal[],
    loading: false,
    sendProposal: async (_cardId: string, _categoryId: string, _message?: string) => ({ ok: false }),
    updateProposalStatus: async (_proposalId: string, _status: 'accepted' | 'declined' | 'saved_for_later') => {},
    activateSession: async (_proposalId: string) => ({ success: false, errorMessage: 'proposals disabled in v1' }),
    refetch: async () => {},
  };
}
