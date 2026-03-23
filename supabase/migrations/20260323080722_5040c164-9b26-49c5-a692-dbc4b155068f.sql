
-- Clean all data for sofia@bonkistudio.com (c0293631-4eaa-43e2-9c1d-06fca430e2ca)
-- and her couple space bd168ed7-1731-4806-a987-545019b701d8

-- Session completions
DELETE FROM couple_session_completions WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Session steps
DELETE FROM couple_session_steps WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Step reflections (via session)
DELETE FROM step_reflections WHERE session_id IN (SELECT id FROM couple_sessions WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8');

-- Couple takeaways
DELETE FROM couple_takeaways WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Question bookmarks
DELETE FROM question_bookmarks WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Beta feedback
DELETE FROM beta_feedback WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Couple sessions
DELETE FROM couple_sessions WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Card visits
DELETE FROM couple_card_visits WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Prompt notes + reflection responses
DELETE FROM reflection_responses WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';
DELETE FROM prompt_notes WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Couple progress
DELETE FROM couple_progress WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Couple journey meta
DELETE FROM couple_journey_meta WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Topic proposals
DELETE FROM topic_proposals WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- System events
DELETE FROM system_events WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Onboarding events
DELETE FROM onboarding_events WHERE user_id = 'c0293631-4eaa-43e2-9c1d-06fca430e2ca';

-- Card sessions + takeaways
DELETE FROM card_takeaways WHERE session_id IN (SELECT id FROM card_sessions WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8');
DELETE FROM card_sessions WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Couple members
DELETE FROM couple_members WHERE couple_space_id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- Couple space itself
DELETE FROM couple_spaces WHERE id = 'bd168ed7-1731-4806-a987-545019b701d8';

-- User settings
DELETE FROM user_settings WHERE user_id = 'c0293631-4eaa-43e2-9c1d-06fca430e2ca';

-- Product access
DELETE FROM user_product_access WHERE user_id = 'c0293631-4eaa-43e2-9c1d-06fca430e2ca';

-- Notification preferences
DELETE FROM notification_preferences WHERE user_id = 'c0293631-4eaa-43e2-9c1d-06fca430e2ca';
