/**
 * useStillUsHome — derives the 10 Action Card states for the Still Us home screen.
 *
 * Reads from:
 *   - couple_state (current_card_index, current_touch, phase, etc.)
 *   - user_card_state (slider_completed_at for current user & partner)
 *   - session_state (current_session, paused, completed flags)
 *
 * Returns a discriminated union ActionCardState + helper data.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { TOTAL_PROGRAM_CARDS, CARD_SEQUENCE, LAYERS, DORMANCY_THRESHOLD_DAYS } from '@/data/stillUsSequence';
import { cardIdFromIndex } from '@/lib/stillUsTokens';
import tillbakaCards from '@/data/tillbakaCards';

// ── Action card state enum ──
export type ActionCardKind =
  | 'slider_not_started'     // 1: Beat 1 not started
  | 'slider_waiting'         // 2: Current user done, waiting for partner
  | 'slider_ready'           // 3: Both done → ready for session 1
  | 'session1_active'        // 4: Session 1 in progress / paused
  | 'session1_complete'      // 5: Session 1 done → ready for session 2
  | 'session2_active'        // 6: Session 2 in progress / paused
  | 'card_complete'          // 7: Card complete → advance
  | 'tier2_setup'            // 7b: Tier 2 setup intercept
  | 'ceremony'               // 8: All 22 done
  | 'maintenance'            // 9: Phase 3 maintenance
  | 'migration_pending'      // 10: Migration in progress
  | 'loading';

export interface StillUsHomeState {
  actionCard: ActionCardKind;
  // Core state
  cardIndex: number;
  cardId: string;
  cardTitle: string;
  layerName: string;
  phase: 'program' | 'ceremony' | 'maintenance' | 'restart';
  purchaseStatus: 'free_trial' | 'purchased';
  partnerTier: 'tier_1' | 'tier_2' | 'tier_3';
  // Partner info
  partnerName: string | null;
  partnerSliderDone: boolean;
  // Session
  sessionPaused: boolean;
  // Maintenance
  maintenanceCardIndex: number;
  maintenanceDaysUntilNext: number | null;
  maintenanceTillbakaTitle: string;
  maintenanceAvailable: boolean;
  // Dormancy
  isDormant: boolean;
  dormancyDays: number;
  returnRitualShown: boolean;
  // Touch & couple
  currentTouch: string;
  coupleId: string | null;
  // Loading
  loading: boolean;
  // Actions
  refetch: () => Promise<void>;
}

const EMPTY_STATE: StillUsHomeState = {
  actionCard: 'loading',
  cardIndex: 0,
  cardId: 'su-01-smallest-we',
  cardTitle: 'Minsta vi',
  layerName: 'Grunden',
  phase: 'program',
  purchaseStatus: 'free_trial',
  partnerTier: 'tier_3',
  partnerName: null,
  partnerSliderDone: false,
  sessionPaused: false,
  maintenanceCardIndex: 0,
  maintenanceDaysUntilNext: null,
  maintenanceTillbakaTitle: '',
  maintenanceAvailable: false,
  isDormant: false,
  dormancyDays: 0,
  returnRitualShown: false,
  currentTouch: 'slider',
  coupleId: null,
  loading: true,
  refetch: async () => {},
};

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function useStillUsHome(): StillUsHomeState {
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const [state, setState] = useState<Omit<StillUsHomeState, 'refetch'>>(EMPTY_STATE);
  const mountedRef = useRef(true);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const pollIntervalRef = useRef(10_000); // Start at 10s

  const userId = user?.id;
  const spaceId = space?.id;

  const fetchState = useCallback(async () => {
    if (!userId || !spaceId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Fetch couple_state, user_card_state (for both users), and session_state in parallel
      const [csResult, ucsResult, ssResult, membersResult] = await Promise.all([
        supabase
          .from('couple_state')
          .select('*')
          .eq('couple_id', spaceId)
          .maybeSingle(),
        supabase
          .from('user_card_state')
          .select('user_id, card_id, slider_completed_at, cycle_id')
          .eq('couple_id', spaceId),
        supabase
          .from('session_state')
          .select('*')
          .eq('couple_id', spaceId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('couple_members')
          .select('user_id')
          .eq('couple_space_id', spaceId)
          .is('left_at', null),
      ]);

      if (!mountedRef.current) return;

      const cs = csResult.data;
      if (!cs) {
        // No couple_state yet — show loading or default
        setState(prev => ({ ...prev, loading: false, actionCard: 'slider_not_started' }));
        return;
      }

      const cardIndex = cs.current_card_index ?? 0;
      const currentTouch = cs.current_touch as string;
      const phase = cs.phase as StillUsHomeState['phase'];
      const purchaseStatus = cs.purchase_status as StillUsHomeState['purchaseStatus'];
      const partnerTier = cs.partner_tier as StillUsHomeState['partnerTier'];
      const cycleId = cs.cycle_id ?? 1;
      const migrationPending = cs.migration_pending ?? false;
      const lastActivityAt = cs.last_activity;
      const returnRitualShown = cs.return_ritual_shown_for_card === String(cardIndex);
      const tier2Name = cs.tier_2_partner_name ?? null;

      // Card info
      const cardEntry = CARD_SEQUENCE[cardIndex] ?? CARD_SEQUENCE[0];
      const cardSlug = cardEntry.cardId; // slug used for routing
      const backendCardId = cardIdFromIndex(cardIndex); // 'card_N' for DB queries
      const cardTitle = cardEntry.title;
      const layer = LAYERS[cardEntry.layerIndex] ?? LAYERS[0];
      const layerName = layer.name;

      // Dormancy check
      const dormancyDays = daysSince(lastActivityAt);
      const isDormant = dormancyDays >= DORMANCY_THRESHOLD_DAYS;

      // User card state — check slider completion (use backend card_N id)
      const allUcs = ucsResult.data ?? [];
      const myUcs = allUcs.find(u => u.user_id === userId && u.card_id === backendCardId && u.cycle_id === cycleId);
      const partnerUcs = allUcs.find(u => u.user_id !== userId && u.card_id === backendCardId && u.cycle_id === cycleId);
      const mySliderDone = !!myUcs?.slider_completed_at;
      const partnerSliderDone = !!partnerUcs?.slider_completed_at;

      // Session state
      const ss = ssResult.data;
      const sessionActive = ss && ss.card_id === backendCardId;
      const session1Completed = sessionActive ? ss.session_1_completed : false;
      const session2Completed = sessionActive ? ss.session_2_completed : false;
      const sessionPaused = sessionActive ? !!ss.paused_at : false;

      // Partner name
      const members = membersResult.data ?? [];
      const partnerMember = members.find(m => m.user_id !== userId);
      const partnerName = partnerTier === 'tier_2' ? tier2Name : (partnerMember ? 'Partner' : null);

      // Maintenance
      const maintenanceCardIndex = cs.maintenance_card_index ?? 0;
      const maintenanceLastDelivered = cs.maintenance_last_delivered;
      const maintenanceAvailable = !!maintenanceLastDelivered; // simplified
      const tillbakaCard = tillbakaCards[maintenanceCardIndex];
      const maintenanceTillbakaTitle = tillbakaCard?.title ?? '';
      let maintenanceDaysUntilNext: number | null = null;
      if (maintenanceLastDelivered) {
        const daysSinceDelivery = daysSince(maintenanceLastDelivered);
        maintenanceDaysUntilNext = Math.max(0, 30 - daysSinceDelivery);
      }

      // ── Derive action card state ──
      let actionCard: ActionCardKind = 'slider_not_started';

      if (migrationPending) {
        actionCard = 'migration_pending';
      } else if (phase === 'ceremony') {
        actionCard = 'ceremony';
      } else if (phase === 'maintenance' || phase === 'restart') {
        actionCard = 'maintenance';
      } else {
        // Program phase
        if (cardIndex >= TOTAL_PROGRAM_CARDS) {
          actionCard = 'ceremony';
        } else if (currentTouch === 'complete') {
          actionCard = 'card_complete';
        } else if (currentTouch === 'session_2') {
          if (session2Completed) {
            actionCard = 'card_complete';
          } else {
            actionCard = 'session2_active';
          }
        } else if (currentTouch === 'session_1') {
          if (session1Completed) {
            actionCard = 'session1_complete';
          } else {
            actionCard = 'session1_active';
          }
        } else {
          // slider_checkin touch
          if (!mySliderDone) {
            actionCard = 'slider_not_started';
          } else if (!partnerSliderDone) {
            // Check if tier 2 needs setup
            if (partnerTier === 'tier_2' && !tier2Name) {
              actionCard = 'tier2_setup';
            } else {
              actionCard = 'slider_waiting';
            }
          } else {
            actionCard = 'slider_ready';
          }
        }
      }

      setState({
        actionCard,
        cardIndex,
        cardId: cardSlug,
        cardTitle,
        layerName,
        phase,
        purchaseStatus,
        partnerTier,
        partnerName,
        partnerSliderDone,
        sessionPaused,
        maintenanceCardIndex,
        maintenanceDaysUntilNext,
        maintenanceTillbakaTitle,
        maintenanceAvailable,
        isDormant,
        dormancyDays,
        returnRitualShown,
        loading: false,
      });
    } catch (err) {
      console.error('[useStillUsHome] fetch error:', err);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [userId, spaceId]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    return () => { mountedRef.current = false; };
  }, [fetchState]);

  // Adaptive polling: 10s → 30s → 60s (escalates when no state changes)
  useEffect(() => {
    if (!userId || !spaceId) return;

    const startPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (mountedRef.current) fetchState();
        // Escalate interval
        if (pollIntervalRef.current < 60_000) {
          pollIntervalRef.current = Math.min(pollIntervalRef.current * 2, 60_000);
          // Restart with new interval
          startPolling();
        }
      }, pollIntervalRef.current);
    };

    startPolling();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId, spaceId, fetchState]);

  // Reset poll interval on visibility change (user returns to tab)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        pollIntervalRef.current = 10_000;
        fetchState();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [fetchState]);

  return useMemo(
    () => ({ ...state, refetch: fetchState }),
    [state, fetchState]
  );
}
