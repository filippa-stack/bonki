
-- ============================================================
-- STILL US v2.5 — Phase 1: New tables, RPCs, RLS
-- ============================================================

-- 1. ENUMS
CREATE TYPE public.touch_type AS ENUM ('slider_checkin', 'session_1', 'session_2', 'complete');
CREATE TYPE public.partner_tier AS ENUM ('tier_1', 'tier_2', 'tier_3');
CREATE TYPE public.purchase_status AS ENUM ('free_trial', 'purchased');
CREATE TYPE public.journey_phase AS ENUM ('program', 'ceremony', 'maintenance', 'restart');
CREATE TYPE public.session_step AS ENUM ('oppna', 'vand', 'tankom', 'gor');
CREATE TYPE public.skip_status AS ENUM ('none', 'available', 'skipped', 'auto_advanced');

-- 2. couple_state — one row per couple_space
CREATE TABLE public.couple_state (
  couple_space_id UUID PRIMARY KEY REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  current_card_index INT NOT NULL DEFAULT 0,
  current_touch touch_type NOT NULL DEFAULT 'slider_checkin',
  partner_link_token TEXT UNIQUE,
  partner_tier partner_tier NOT NULL DEFAULT 'tier_3',
  purchase_status purchase_status NOT NULL DEFAULT 'free_trial',
  purchased_by UUID,
  partner_nudge_sent_at TIMESTAMPTZ,
  tier_2_partner_name TEXT,
  tier_2_pseudo_id TEXT,
  phase journey_phase NOT NULL DEFAULT 'program',
  cycle_id INT NOT NULL DEFAULT 1,
  ceremony_reflection TEXT,
  maintenance_card_index INT NOT NULL DEFAULT 0,
  maintenance_last_delivered TIMESTAMPTZ,
  migration_pending BOOLEAN NOT NULL DEFAULT false,
  return_ritual_shown_for_card INT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couple_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own couple state"
  ON public.couple_state FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can update own couple state"
  ON public.couple_state FOR UPDATE
  USING (public.is_couple_member(auth.uid(), couple_space_id));

-- Insert via RPCs only (no direct insert policy)

-- 3. user_card_state — per-user per-card per-cycle
CREATE TABLE public.user_card_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  card_index INT NOT NULL,
  slider_responses JSONB,
  slider_completed_at TIMESTAMPTZ,
  checkin_reflection TEXT,
  reflection_skipped BOOLEAN NOT NULL DEFAULT false,
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  takeaway TEXT,
  session_1_takeaway TEXT,
  cycle_id INT NOT NULL DEFAULT 1,
  session_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_space_id, user_id, card_index, cycle_id)
);

ALTER TABLE public.user_card_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own card state"
  ON public.user_card_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read partner card state in space"
  ON public.user_card_state FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Users can insert own card state"
  ON public.user_card_state FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Users can update own card state"
  ON public.user_card_state FOR UPDATE
  USING (auth.uid() = user_id AND public.is_couple_member(auth.uid(), couple_space_id));

-- 4. session_state — per-card session tracking
CREATE TABLE public.session_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  card_index INT NOT NULL,
  current_session INT NOT NULL DEFAULT 1,
  current_step session_step NOT NULL DEFAULT 'oppna',
  current_prompt_index INT NOT NULL DEFAULT 0,
  session_1_completed BOOLEAN NOT NULL DEFAULT false,
  session_2_completed BOOLEAN NOT NULL DEFAULT false,
  paused_at TIMESTAMPTZ,
  paused_reason TEXT,
  session_lock UUID,
  session_lock_heartbeat TIMESTAMPTZ,
  skip_status skip_status NOT NULL DEFAULT 'none',
  session_type TEXT,
  cycle_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_space_id, card_index, cycle_id)
);

ALTER TABLE public.session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read session state"
  ON public.session_state FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can update session state"
  ON public.session_state FOR UPDATE
  USING (public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can insert session state"
  ON public.session_state FOR INSERT
  WITH CHECK (public.is_couple_member(auth.uid(), couple_space_id));

-- 5. threshold_mood — per-user per-card mood selection
CREATE TABLE public.threshold_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  card_index INT NOT NULL,
  mood TEXT NOT NULL,
  cycle_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_space_id, user_id, card_index, cycle_id)
);

ALTER TABLE public.threshold_mood ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read moods in space"
  ON public.threshold_mood FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Users can insert own mood"
  ON public.threshold_mood FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_couple_member(auth.uid(), couple_space_id));

-- 6. anonymous_slider_submission — Tier 1 partner web submissions
CREATE TABLE public.anonymous_slider_submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  card_index INT NOT NULL,
  slider_responses JSONB NOT NULL,
  checkin_reflection TEXT,
  link_token TEXT NOT NULL,
  cycle_id INT NOT NULL DEFAULT 1,
  migrated_to_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_space_id, card_index, cycle_id)
);

ALTER TABLE public.anonymous_slider_submission ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read anonymous submissions"
  ON public.anonymous_slider_submission FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

-- Anonymous inserts handled via RPC with service role

-- 7. journey_insights_cache — computed analytics for ceremony
CREATE TABLE public.journey_insights_cache (
  couple_space_id UUID PRIMARY KEY REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  cycle_id INT NOT NULL DEFAULT 1,
  insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own insights"
  ON public.journey_insights_cache FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

-- 8. Updated_at triggers
CREATE TRIGGER update_couple_state_updated_at
  BEFORE UPDATE ON public.couple_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_card_state_updated_at
  BEFORE UPDATE ON public.user_card_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_state_updated_at
  BEFORE UPDATE ON public.session_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Indexes
CREATE INDEX idx_user_card_state_couple_card ON public.user_card_state(couple_space_id, card_index, cycle_id);
CREATE INDEX idx_session_state_couple_card ON public.session_state(couple_space_id, card_index, cycle_id);
CREATE INDEX idx_anon_slider_token ON public.anonymous_slider_submission(link_token);
CREATE INDEX idx_couple_state_link_token ON public.couple_state(partner_link_token) WHERE partner_link_token IS NOT NULL;

-- ============================================================
-- RPCs
-- ============================================================

-- RPC: acquire_session_lock
CREATE OR REPLACE FUNCTION public.acquire_session_lock(
  p_couple_space_id UUID,
  p_card_index INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lock UUID;
  v_heartbeat TIMESTAMPTZ;
  v_device_id UUID := gen_random_uuid();
BEGIN
  IF NOT public.is_couple_member(auth.uid(), p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT session_lock, session_lock_heartbeat INTO v_lock, v_heartbeat
  FROM public.session_state
  WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index AND cycle_id = (
    SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id
  );

  -- If no session_state row exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.session_state (couple_space_id, card_index, session_lock, session_lock_heartbeat, cycle_id)
    VALUES (p_couple_space_id, p_card_index, v_device_id, now(),
      (SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id))
    ON CONFLICT (couple_space_id, card_index, cycle_id) DO UPDATE
    SET session_lock = CASE
        WHEN session_state.session_lock IS NULL OR session_state.session_lock_heartbeat < now() - interval '90 seconds'
        THEN v_device_id ELSE session_state.session_lock END,
      session_lock_heartbeat = CASE
        WHEN session_state.session_lock IS NULL OR session_state.session_lock_heartbeat < now() - interval '90 seconds'
        THEN now() ELSE session_state.session_lock_heartbeat END;

    SELECT session_lock INTO v_lock FROM public.session_state
    WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index
      AND cycle_id = (SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id);

    RETURN jsonb_build_object('acquired', v_lock = v_device_id, 'device_id', v_device_id);
  END IF;

  -- Lock is stale (>90s) or empty — take it
  IF v_lock IS NULL OR v_heartbeat < now() - interval '90 seconds' THEN
    UPDATE public.session_state
    SET session_lock = v_device_id, session_lock_heartbeat = now()
    WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index
      AND cycle_id = (SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id);
    RETURN jsonb_build_object('acquired', true, 'device_id', v_device_id);
  END IF;

  -- Lock held by someone else
  RETURN jsonb_build_object('acquired', false, 'device_id', v_device_id);
END;
$$;

-- RPC: session_heartbeat
CREATE OR REPLACE FUNCTION public.session_heartbeat(
  p_couple_space_id UUID,
  p_card_index INT,
  p_device_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lock UUID;
BEGIN
  IF NOT public.is_couple_member(auth.uid(), p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT session_lock INTO v_lock FROM public.session_state
  WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index
    AND cycle_id = (SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id);

  IF v_lock IS DISTINCT FROM p_device_id THEN
    RETURN jsonb_build_object('status', 'taken_over');
  END IF;

  UPDATE public.session_state
  SET session_lock_heartbeat = now(), updated_at = now()
  WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index
    AND cycle_id = (SELECT cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id)
    AND session_lock = p_device_id;

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- RPC: complete_slider_checkin
CREATE OR REPLACE FUNCTION public.complete_slider_checkin(
  p_couple_space_id UUID,
  p_card_index INT,
  p_slider_responses JSONB,
  p_checkin_reflection TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_cycle_id INT;
  v_partner_done BOOLEAN := false;
  v_anon_done BOOLEAN := false;
BEGIN
  IF NOT public.is_couple_member(v_user_id, p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT cycle_id INTO v_cycle_id FROM public.couple_state WHERE couple_space_id = p_couple_space_id;

  INSERT INTO public.user_card_state (couple_space_id, user_id, card_index, slider_responses, slider_completed_at, checkin_reflection, cycle_id)
  VALUES (p_couple_space_id, v_user_id, p_card_index, p_slider_responses, now(), p_checkin_reflection, v_cycle_id)
  ON CONFLICT (couple_space_id, user_id, card_index, cycle_id) DO UPDATE
  SET slider_responses = p_slider_responses,
      slider_completed_at = now(),
      checkin_reflection = COALESCE(p_checkin_reflection, user_card_state.checkin_reflection);

  -- Check if partner has completed (either authenticated or anonymous)
  SELECT EXISTS(
    SELECT 1 FROM public.user_card_state
    WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index
      AND cycle_id = v_cycle_id AND user_id <> v_user_id AND slider_completed_at IS NOT NULL
  ) INTO v_partner_done;

  IF NOT v_partner_done THEN
    SELECT EXISTS(
      SELECT 1 FROM public.anonymous_slider_submission
      WHERE couple_space_id = p_couple_space_id AND card_index = p_card_index AND cycle_id = v_cycle_id
    ) INTO v_anon_done;
    v_partner_done := v_anon_done;
  END IF;

  -- If both done, advance touch to session_1
  IF v_partner_done THEN
    UPDATE public.couple_state
    SET current_touch = 'session_1', last_activity_at = now()
    WHERE couple_space_id = p_couple_space_id AND current_touch = 'slider_checkin';
  END IF;

  UPDATE public.couple_state SET last_activity_at = now() WHERE couple_space_id = p_couple_space_id;

  RETURN jsonb_build_object('partner_ready', v_partner_done);
END;
$$;

-- RPC: advance_card
CREATE OR REPLACE FUNCTION public.advance_card(
  p_couple_space_id UUID,
  p_takeaway TEXT DEFAULT NULL,
  p_session_1_takeaway TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_state RECORD;
  v_next_index INT;
  v_next_phase journey_phase;
BEGIN
  IF NOT public.is_couple_member(v_user_id, p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT * INTO v_state FROM public.couple_state WHERE couple_space_id = p_couple_space_id;

  -- Save takeaways if provided
  IF p_takeaway IS NOT NULL THEN
    UPDATE public.user_card_state
    SET takeaway = p_takeaway
    WHERE couple_space_id = p_couple_space_id AND user_id = v_user_id
      AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;
  END IF;

  IF p_session_1_takeaway IS NOT NULL THEN
    UPDATE public.user_card_state
    SET session_1_takeaway = p_session_1_takeaway
    WHERE couple_space_id = p_couple_space_id AND user_id = v_user_id
      AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;
  END IF;

  -- Release session lock
  UPDATE public.session_state
  SET session_lock = NULL, session_lock_heartbeat = NULL
  WHERE couple_space_id = p_couple_space_id AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;

  v_next_index := v_state.current_card_index + 1;

  -- Check if program is complete (22 cards = index 0-21)
  IF v_next_index >= 22 THEN
    v_next_phase := 'ceremony';
    UPDATE public.couple_state
    SET phase = 'ceremony', current_touch = 'complete', last_activity_at = now()
    WHERE couple_space_id = p_couple_space_id;
    RETURN jsonb_build_object('next_phase', 'ceremony', 'card_index', v_state.current_card_index);
  END IF;

  -- Check paywall: after card 0 if free_trial
  IF v_state.current_card_index = 0 AND v_state.purchase_status = 'free_trial' THEN
    -- Don't advance, let client show paywall
    UPDATE public.couple_state
    SET current_touch = 'complete', last_activity_at = now()
    WHERE couple_space_id = p_couple_space_id;
    RETURN jsonb_build_object('paywall', true, 'card_index', 0);
  END IF;

  -- Advance to next card
  UPDATE public.couple_state
  SET current_card_index = v_next_index,
      current_touch = 'slider_checkin',
      last_activity_at = now(),
      return_ritual_shown_for_card = NULL
  WHERE couple_space_id = p_couple_space_id;

  RETURN jsonb_build_object('card_index', v_next_index, 'next_phase', 'program');
END;
$$;

-- RPC: skip_card
CREATE OR REPLACE FUNCTION public.skip_card(
  p_couple_space_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_state RECORD;
BEGIN
  IF NOT public.is_couple_member(auth.uid(), p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT * INTO v_state FROM public.couple_state WHERE couple_space_id = p_couple_space_id;

  -- Mark current card as skipped
  UPDATE public.session_state
  SET skip_status = 'skipped'
  WHERE couple_space_id = p_couple_space_id AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;

  -- Advance
  RETURN public.advance_card(p_couple_space_id);
END;
$$;

-- RPC: reset_slider_checkin (return-after-inactivity)
CREATE OR REPLACE FUNCTION public.reset_slider_checkin(
  p_couple_space_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_state RECORD;
BEGIN
  IF NOT public.is_couple_member(auth.uid(), p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT * INTO v_state FROM public.couple_state WHERE couple_space_id = p_couple_space_id;

  -- Reset slider data for current card
  DELETE FROM public.user_card_state
  WHERE couple_space_id = p_couple_space_id AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;

  DELETE FROM public.anonymous_slider_submission
  WHERE couple_space_id = p_couple_space_id AND card_index = v_state.current_card_index AND cycle_id = v_state.cycle_id;

  -- Reset touch
  UPDATE public.couple_state
  SET current_touch = 'slider_checkin', return_ritual_shown_for_card = v_state.current_card_index
  WHERE couple_space_id = p_couple_space_id;
END;
$$;
