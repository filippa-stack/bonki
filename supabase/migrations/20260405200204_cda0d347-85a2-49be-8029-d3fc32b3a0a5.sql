
DROP PROCEDURE IF EXISTS public.advance_tillbaka_cards();

CREATE OR REPLACE FUNCTION public.advance_tillbaka_cards()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  next_card_index integer;
  next_card_id varchar;
BEGIN
  FOR rec IN
    SELECT couple_id, maintenance_card_index, cycle_id, current_touch, maintenance_last_delivered
    FROM couple_state
    WHERE phase = 'maintenance'
      AND dissolved_at IS NULL
  LOOP
    IF rec.maintenance_card_index >= 11 AND rec.current_touch = 'complete' THEN
      CONTINUE;
    END IF;

    IF (rec.current_touch = 'complete') AND (
      rec.maintenance_last_delivered IS NULL
      OR (now() - rec.maintenance_last_delivered) >= INTERVAL '28 days'
    ) THEN
      next_card_index := rec.maintenance_card_index + 1;
      IF next_card_index > 11 THEN
        CONTINUE;
      END IF;
      next_card_id := 'tillbaka_' || (next_card_index + 1);

      UPDATE couple_state
      SET
        maintenance_card_index = next_card_index,
        maintenance_last_delivered = now(),
        current_touch = 'slider',
        last_activity = now()
      WHERE couple_id = rec.couple_id;

      INSERT INTO session_state (
        couple_id, card_id, cycle_id, session_type,
        current_session, current_step, current_prompt_index,
        session_1_completed, session_2_completed, skip_status
      )
      VALUES (
        rec.couple_id, next_card_id, rec.cycle_id, 'tillbaka',
        'session_1', 'tillbaka_q1', 0, false,
        NULL, 'active'
      )
      ON CONFLICT (couple_id, card_id, cycle_id) DO NOTHING;

      INSERT INTO notification_queue (couple_id, notification_type, content, scheduled_at)
      VALUES (
        rec.couple_id,
        'N8',
        jsonb_build_object(
          'card_id', next_card_id,
          'card_index', next_card_index
        ),
        now()
      );
    END IF;
  END LOOP;
END;
$function$;
