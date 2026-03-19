/**
 * Still Us — Typed RPC Wrappers
 * Wraps all 12 Still Us Edge Functions with typed params/responses.
 * Also provides a polling helper for couple_state.
 */

import { supabase } from '@/integrations/supabase/client';
import { getSliderSet } from '@/data/sliderPrompts';

// ── Helper ──────────────────────────────────────────────────
async function invoke<T>(fnName: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fnName, { body });
  if (error || !data) {
    return { status: 'error', message: error?.message || 'Unknown error' } as T;
  }
  return data as T;
}

/**
 * Build the JSONB payload for current_slider_anchors from sliderPrompts.
 * Passed to edge functions so they can store it in couple_state.
 */
export function buildSliderAnchors(cardIndex: number) {
  const set = getSliderSet(cardIndex);
  if (!set) return null;
  return {
    card_title: set.cardTitle,
    reflection_prompt: set.reflectionPrompt ?? null,
    sliders: set.sliders.map((s) => ({
      text: s.text,
      leftLabel: s.leftLabel,
      rightLabel: s.rightLabel,
    })),
  };
}

// ── Types ───────────────────────────────────────────────────

export interface SliderCheckinParams {
  user_id?: string;
  couple_id?: string;
  card_id?: string;
  slider_responses: { slider_id: string; position: number }[];
  checkin_reflection?: string | null;
  link_token?: string;
}
export interface SliderCheckinResult {
  status: 'waiting' | 'ready' | 'dissolved' | 'error';
  partner_name?: string;
  message?: string;
}

export interface AcquireSessionLockParams {
  couple_id: string;
  card_id: string;
  device_id: string;
  user_id: string;
}
export interface AcquireSessionLockResult {
  status: 'acquired' | 'blocked' | 'dissolved' | 'error';
}

export interface SessionHeartbeatParams {
  couple_id: string;
  card_id: string;
  device_id: string;
}
export interface SessionHeartbeatResult {
  status: 'ok' | 'taken_over' | 'migration_in_progress' | 'error';
}

export interface CompleteSessionParams {
  couple_id: string;
  card_id: string;
  session_number: 1 | 2;
  device_id: string;
  session_type: 'program' | 'tillbaka';
  session_1_takeaway?: string | null;
  partner_takeaway?: string | null;
  card_takeaway?: string | null;
}
export interface CompleteSessionResult {
  next_state: 'session_2' | 'complete' | 'ceremony';
  status?: string;
}

export interface AdvanceCardParams {
  couple_id: string;
  card_id: string;
  takeaway?: string | null;
  partner_takeaway?: string | null;
}
export interface AdvanceCardResult {
  status: 'advanced' | 'ceremony' | 'dissolved' | 'error';
  new_card_index?: number;
}

export interface SkipCardParams {
  couple_id: string;
  card_id: string;
  skip_type: 'user_skipped' | 'auto_advanced';
}
export interface SkipCardResult {
  status: 'skipped' | 'ceremony' | 'dissolved' | 'error';
  new_card_index?: number;
}

export interface ResetSliderCheckinParams {
  couple_id: string;
  card_id: string;
}
export interface ResetSliderCheckinResult {
  status: 'ok' | 'dissolved' | 'error';
}

export interface ComputeJourneyInsightsParams {
  couple_id: string;
  cycle_id: number;
}
export interface ComputeJourneyInsightsResult {
  max_delta_card?: unknown;
  min_delta_card?: unknown;
  total_reflections?: number;
  has_sufficient_data?: boolean;
  from_cache?: boolean;
  status?: string;
}

export interface RestartProgramParams {
  couple_id: string;
}
export interface RestartProgramResult {
  status: 'restarted' | 'dissolved' | 'error';
  new_cycle_id?: number;
}

export interface DissolveCoupleParams {
  couple_id: string;
  departing_user_id: string;
}
export interface DissolveCoupleResult {
  status: 'dissolved' | 'already_dissolved' | 'error';
}

export interface MigrateAnonymousParams {
  couple_id: string;
  partner_id: string;
}
export interface MigrateAnonymousResult {
  status: 'migrated' | 'retry' | 'error';
  retry_after_seconds?: number;
}

export interface MigrateTier2Params {
  couple_id: string;
  partner_id: string;
}
export interface MigrateTier2Result {
  status: 'migrated' | 'retry' | 'error';
  retry_after_seconds?: number;
}

export interface InitCoupleStateResult {
  couple_id: string;
  partner_link_token: string;
  status?: string;
}

// ── Wrappers ────────────────────────────────────────────────

export function initCoupleState() {
  return invoke<InitCoupleStateResult>('init-couple-state', {});
}

export function completeSliderCheckin(params: SliderCheckinParams) {
  return invoke<SliderCheckinResult>('complete-slider-checkin', params);
}

export function acquireSessionLock(params: AcquireSessionLockParams) {
  return invoke<AcquireSessionLockResult>('acquire-session-lock', params);
}

export function sessionHeartbeat(params: SessionHeartbeatParams) {
  return invoke<SessionHeartbeatResult>('session-heartbeat', params);
}

export function completeSession(params: CompleteSessionParams) {
  return invoke<CompleteSessionResult>('complete-session', params);
}

export function advanceCard(params: AdvanceCardParams) {
  return invoke<AdvanceCardResult>('advance-card', params);
}

export function skipCard(params: SkipCardParams) {
  return invoke<SkipCardResult>('skip-card', params);
}

export function resetSliderCheckin(params: ResetSliderCheckinParams) {
  return invoke<ResetSliderCheckinResult>('reset-slider-checkin', params);
}

export function computeJourneyInsights(params: ComputeJourneyInsightsParams) {
  return invoke<ComputeJourneyInsightsResult>('compute-journey-insights', params);
}

export function restartProgram(params: RestartProgramParams) {
  return invoke<RestartProgramResult>('restart-program', params);
}

export function dissolveCouple(params: DissolveCoupleParams) {
  return invoke<DissolveCoupleResult>('dissolve-couple', params);
}

export function migrateAnonymousSubmissions(params: MigrateAnonymousParams) {
  return invoke<MigrateAnonymousResult>('migrate-anonymous-submissions', params);
}

export function migrateTier2ToTier3(params: MigrateTier2Params) {
  return invoke<MigrateTier2Result>('migrate-tier2-to-tier3', params);
}

// ── Polling helper ──────────────────────────────────────────

export function pollCoupleState(
  coupleId: string,
  intervalMs: number,
  onUpdate: (state: Record<string, unknown> | null) => void,
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const { data } = await supabase
      .from('couple_state')
      .select('*')
      .eq('couple_id', coupleId)
      .maybeSingle();
    if (active) onUpdate(data as Record<string, unknown> | null);
  };

  poll();
  const id = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(id);
  };
}
