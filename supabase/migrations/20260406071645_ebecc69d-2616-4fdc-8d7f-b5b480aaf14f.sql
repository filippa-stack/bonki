
-- Clear test accounts: Emma (999288dd-b73a-4829-9d0d-72a8b54b6385) and Sofia (d3ac01ff-325a-488f-8804-fdfb5577b76a)
-- Spaces: 7ebc060a-bf28-4ca7-a704-29592ce14400, b96c1e5c-1865-43db-a1fd-e422b37adb70, 2f7568ba-f4c2-4e26-8fac-9f4ec1eff626

DO $$
DECLARE
  v_spaces uuid[] := ARRAY['7ebc060a-bf28-4ca7-a704-29592ce14400','b96c1e5c-1865-43db-a1fd-e422b37adb70','2f7568ba-f4c2-4e26-8fac-9f4ec1eff626']::uuid[];
  v_users uuid[] := ARRAY['999288dd-b73a-4829-9d0d-72a8b54b6385','d3ac01ff-325a-488f-8804-fdfb5577b76a']::uuid[];
BEGIN
  -- Child tables first (FK order)
  DELETE FROM couple_session_completions WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM couple_session_steps WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM step_reflections WHERE user_id = ANY(v_users);
  DELETE FROM reflection_responses WHERE user_id = ANY(v_users);
  DELETE FROM couple_takeaways WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM card_takeaways WHERE session_id IN (SELECT id FROM card_sessions WHERE couple_space_id = ANY(v_spaces));
  DELETE FROM question_bookmarks WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM prompt_notes WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM couple_card_visits WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM couple_journey_meta WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM couple_progress WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM beta_feedback WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM system_events WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM card_sessions WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM couple_sessions WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM topic_proposals WHERE couple_space_id = ANY(v_spaces);
  DELETE FROM onboarding_events WHERE user_id = ANY(v_users);
  DELETE FROM notification_preferences WHERE user_id = ANY(v_users);
  DELETE FROM user_product_access WHERE user_id = ANY(v_users);
  DELETE FROM user_settings WHERE user_id = ANY(v_users);
  DELETE FROM user_backups WHERE user_id = ANY(v_users);
  DELETE FROM product_interest WHERE user_id = ANY(v_users);
  DELETE FROM couple_members WHERE user_id = ANY(v_users);
  DELETE FROM couple_spaces WHERE id = ANY(v_spaces);
END $$;
