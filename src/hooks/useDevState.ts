/**
 * Dev-only UI state types and mock data.
 * 
 * The devState value is read once at app root and exposed via DevStateContext.
 * Import useDevState from '@/contexts/DevStateContext' to read it.
 *
 * Supported values:
 *   solo | pairedIdle | pairedActive | proposalIncoming
 *   waiting | completed | archiveEmpty | archiveWithHistory
 *   browse  — unlocks all categories & cards for content review
 */

export type DevState =
  | 'solo'
  | 'pairedIdle'
  | 'pairedActive'
  | 'proposalIncoming'
  | 'waiting'
  | 'completed'
  | 'archiveEmpty'
  | 'archiveWithHistory'
  | 'browse'
  | null;

/** Mock data used by dev state overrides */
export const DEV_MOCK = {
  mockProposal: {
    id: 'dev-proposal-1',
    couple_space_id: 'dev-space',
    card_id: 'dev-card',
    category_id: 'dev-category',
    proposed_by: 'dev-partner',
    message: null,
    status: 'pending' as const,
    accepted_by: null,
    declined_by: null,
    responded_at: null,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  mockSession: {
    cardId: 'dev-card',
    categoryId: 'dev-category',
    currentStepIndex: 1,
    startedAt: new Date().toISOString(),
    startedBy: 'dev-user',
  },
  mockCard: {
    id: 'dev-card',
    title: 'Att lyssna på riktigt',
    subtitle: 'Hur vi hör varandra bortom orden',
    categoryId: 'dev-category',
  },
  mockCategory: {
    id: 'dev-category',
    title: 'Kommunikation',
  },
} as const;
