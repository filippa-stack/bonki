/**
 * Dev-only UI state override via ?devState= query parameter.
 * 
 * Overrides RENDERING state only — no DB writes, no edge function calls.
 * Used for screenshot capture and visual QA.
 *
 * Supported values:
 *   solo | pairedIdle | pairedActive | proposalIncoming
 *   waiting | completed | archiveEmpty | archiveWithHistory
 *   browse  — unlocks all categories & cards for content review
 */

import { useSearchParams } from 'react-router-dom';

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

const VALID_STATES: DevState[] = [
  'solo',
  'pairedIdle',
  'pairedActive',
  'proposalIncoming',
  'waiting',
  'completed',
  'archiveEmpty',
  'archiveWithHistory',
  'browse',
];

export function useDevState(): DevState {
  const [params] = useSearchParams();

  // Allow devState in preview builds too (safe: read-only UI override, no DB writes)
  if (import.meta.env.PROD && !window.location.hostname.includes('preview')) return null;

  const raw = params.get('devState');
  if (!raw) return null;

  if (VALID_STATES.includes(raw as DevState)) {
    return raw as DevState;
  }

  console.warn(`[useDevState] Unknown devState: "${raw}". Valid: ${VALID_STATES.join(', ')}`);
  return null;
}

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
