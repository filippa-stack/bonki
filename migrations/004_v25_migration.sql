-- ============================================================
-- Still Us — Migration 004: v2.5 → v3.0 Legacy Migration
-- ============================================================
-- Run ONCE during production deployment.
-- Idempotent: safe to re-run.
--
-- What it does:
-- 1. Backfills session_state rows for any couple_state rows
--    that have progressed past card 0 but have no session_state.
-- 2. Sets migration_pending = true for couples that need
--    client-side localStorage migration on next app open.
-- ============================================================

-- Step 1: Backfill session_state for couples missing it
-- For each couple that has current_card_index > 0 but no session_state rows,
-- create session_state entries for all cards up to current_card_index.
DO $$
DECLARE
  rec RECORD;
  i integer;
  cid varchar;
BEGIN
  FOR rec IN
    SELECT cs.couple_id, cs.current_card_index, cs.current_touch, cs.cycle_id
    FROM couple_state cs
    WHERE NOT EXISTS (
      SELECT 1 FROM session_state ss
      WHERE ss.couple_id = cs.couple_id
        AND ss.cycle_id = cs.cycle_id
    )
    AND cs.current_card_index > 0
  LOOP
    -- Create completed session_state for all past cards
    FOR i IN 0..(rec.current_card_index - 1) LOOP
      cid := 'card_' || (i + 1);
      INSERT INTO session_state (
        couple_id, card_id, cycle_id, session_type,
        current_session, current_step, current_prompt_index,
        session_1_completed, session_2_completed,
        completed_at, skip_status
      )
      VALUES (
        rec.couple_id, cid, rec.cycle_id, 'program',
        'session_2', 'tankom', 0,
        true, true,
        now(), 'active'
      )
      ON CONFLICT (couple_id, card_id, cycle_id) DO NOTHING;
    END LOOP;

    -- Create in-progress session_state for current card
    cid := 'card_' || (rec.current_card_index + 1);
    INSERT INTO session_state (
      couple_id, card_id, cycle_id, session_type,
      current_session, current_step, current_prompt_index,
      session_1_completed, session_2_completed,
      skip_status
    )
    VALUES (
      rec.couple_id, cid, rec.cycle_id, 'program',
      CASE WHEN rec.current_touch IN ('session_2', 'complete') THEN 'session_2' ELSE 'session_1' END,
      CASE
        WHEN rec.current_touch = 'slider' THEN 'oppna'
        WHEN rec.current_touch = 'session_1' THEN 'oppna'
        WHEN rec.current_touch = 'session_2' THEN 'vand'
        WHEN rec.current_touch = 'complete' THEN 'tankom'
      END,
      0,
      CASE WHEN rec.current_touch IN ('session_2', 'complete') THEN true ELSE false END,
      CASE WHEN rec.current_touch = 'complete' THEN true ELSE NULL END,
      'active'
    )
    ON CONFLICT (couple_id, card_id, cycle_id) DO NOTHING;
  END LOOP;
END $$;

-- Step 2: Flag couples that need client-side migration
-- (couples that existed before v3.0 deployment)
-- The client app checks migration_pending on load and runs
-- any necessary localStorage → server-side flag transfers.
UPDATE couple_state
SET migration_pending = true
WHERE migration_pending = false
  AND created_at < '2026-03-01T00:00:00Z'  -- NOTE: Replace with actual v3.0 deploy date
  AND dissolved_at IS NULL;

-- NOTE: The client-side migration handler in SessionFocusShell.tsx
-- already handles the migration_pending flag. When the user opens
-- the app post-migration, SessionFocusShell detects migration_pending,
-- runs the transfer, then calls a server update to clear the flag.
