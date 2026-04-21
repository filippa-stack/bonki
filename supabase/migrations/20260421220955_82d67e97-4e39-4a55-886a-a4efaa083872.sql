CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_id uuid;
  v_couple_id varchar;
BEGIN
  -- Resolve user's couple_space_id (may be null)
  SELECT couple_space_id INTO v_space_id
  FROM couple_members
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Resolve user's couple_id from legacy couple_state (may be null)
  SELECT couple_id INTO v_couple_id
  FROM couple_state
  WHERE initiator_id = p_user_id::text
     OR partner_id = p_user_id::text
  LIMIT 1;

  -- 1. Session/reflection children (deepest first)
  DELETE FROM step_reflections WHERE user_id = p_user_id;
  DELETE FROM couple_takeaways WHERE couple_space_id = v_space_id;
  DELETE FROM couple_session_completions WHERE user_id = p_user_id;
  DELETE FROM couple_session_steps WHERE couple_space_id = v_space_id;
  DELETE FROM card_takeaways
    WHERE session_id IN (
      SELECT id FROM card_sessions WHERE couple_space_id = v_space_id
    );
  DELETE FROM couple_sessions WHERE couple_space_id = v_space_id;
  DELETE FROM card_sessions WHERE couple_space_id = v_space_id;

  -- 2. Per-user content
  DELETE FROM couple_card_visits WHERE user_id = p_user_id;
  DELETE FROM couple_journey_meta WHERE user_id = p_user_id;
  DELETE FROM couple_progress WHERE couple_space_id = v_space_id;
  DELETE FROM question_bookmarks WHERE couple_space_id = v_space_id;
  DELETE FROM topic_proposals WHERE couple_space_id = v_space_id;
  DELETE FROM reflection_responses WHERE user_id = p_user_id;
  DELETE FROM prompt_notes WHERE user_id = p_user_id;
  DELETE FROM onboarding_events WHERE user_id = p_user_id;
  DELETE FROM beta_feedback WHERE couple_space_id = v_space_id;
  DELETE FROM system_events WHERE couple_space_id = v_space_id;

  -- 3. Varchar-keyed user tables (cast)
  DELETE FROM threshold_mood WHERE user_id = p_user_id::text;
  DELETE FROM user_card_state WHERE user_id = p_user_id::text;

  -- 4. Personal
  DELETE FROM user_backups WHERE user_id = p_user_id;
  DELETE FROM notification_preferences WHERE user_id = p_user_id;

  -- 5. Couple-id-keyed (varchar)
  DELETE FROM notification_queue WHERE couple_id = v_couple_id;
  DELETE FROM journey_insights_cache WHERE couple_id = v_couple_id;
  DELETE FROM session_state WHERE couple_id = v_couple_id;
  DELETE FROM ceremony_reflection_archive WHERE couple_id = v_couple_id;

  -- 6. Commerce
  DELETE FROM product_interest WHERE user_id = p_user_id;
  DELETE FROM redundant_purchases WHERE user_id = p_user_id;
  DELETE FROM user_product_access WHERE user_id = p_user_id;

  -- 7. Settings
  DELETE FROM user_settings WHERE user_id = p_user_id;

  -- 8. Containers last
  DELETE FROM couple_members WHERE user_id = p_user_id;
  DELETE FROM couple_state WHERE couple_id = v_couple_id;
  DELETE FROM couple_spaces WHERE id = v_space_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO service_role;