

## Add `delete_user_account(p_user_id uuid)` SQL function

Single new migration. Defines a `SECURITY DEFINER` function that wipes every row owned by a user across the schema. Does not touch `auth.users` (Prompt 4's edge function handles that). Locked to `service_role` only.

### Ownership decision

Drop the explicit `ALTER FUNCTION ... OWNER TO postgres;` line. Supabase migrations run as `postgres`, so `CREATE FUNCTION` already produces a postgres-owned function — and every other `SECURITY DEFINER` function in this schema (`is_couple_member`, `advance_card`, `complete_couple_session_step`, etc.) was created the same way and is correctly owned. The explicit ALTER is a no-op in the common case and a potential deploy-blocker in less common environments. If ownership ever drifts (unlikely), a one-line follow-up migration fixes it.

### Live schema verification

All 32 tables in the delete order exist on Live (`spgknasuinxmvyrlpztx`). Function will compile cleanly. The legacy `couple_*` tables haven't been dropped — they're still actively read/written by existing RPCs (`advance_card`, `complete_slider_checkin`, `acquire_session_lock`). Including them in cleanup is correct, not precautionary.

### Schema corrections vs prompt pseudo-code

1. **`v_couple_id` is `varchar`, not `uuid`** — `couple_state.couple_id`, `initiator_id`, `partner_id` are all `character varying`.
2. **Three tables key `user_id` as varchar** — `couple_state.initiator_id/partner_id`, `threshold_mood.user_id`, `user_card_state.user_id`. Function casts `p_user_id::text` against these.
3. **`card_takeaways` (child of `card_sessions`) must be deleted before `card_sessions`** — wasn't in the prompt's list. Added via subquery on `card_sessions.couple_space_id = v_space_id`.

### File to CREATE

`supabase/migrations/<timestamp>_delete_user_account_function.sql`

### Function shape

- `public.delete_user_account(p_user_id uuid) RETURNS void`
- `LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public`
- Declares `v_space_id uuid`, `v_couple_id varchar`
- Resolves both via `SELECT INTO`; both may be null (idempotent on users with no data)

### Delete order (children → parents)

1. Session/reflection children — `step_reflections`, `couple_takeaways`, `couple_session_completions`, `couple_session_steps`, `card_takeaways` (subquery), `couple_sessions`, `card_sessions`
2. Per-user content — `couple_card_visits`, `couple_journey_meta`, `couple_progress`, `question_bookmarks`, `topic_proposals`, `reflection_responses`, `prompt_notes`, `onboarding_events`, `beta_feedback`, `system_events`
3. Varchar-keyed (cast `p_user_id::text`) — `threshold_mood`, `user_card_state`
4. Personal — `user_backups`, `notification_preferences`
5. Couple-id-keyed (varchar) — `notification_queue`, `journey_insights_cache`, `session_state`, `ceremony_reflection_archive`
6. Commerce — `product_interest`, `redundant_purchases`, `user_product_access`
7. Settings — `user_settings`
8. Containers last — `couple_members`, `couple_state`, `couple_spaces`

All deletes execute unconditionally — null `v_space_id` / `v_couple_id` matches nothing, so the function is idempotent and safe on a user with no data.

### Grants (security-critical)

```sql
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO service_role;
```

No explicit `ALTER FUNCTION ... OWNER TO postgres;` — let `CREATE FUNCTION` establish ownership implicitly.

### Not touched

- `auth.users` (Prompt 4's edge function)
- Any existing table, RLS policy, trigger, RPC, edge function, migration
- `anonymous_*` tables (no user reference, keyed by `link_token`)
- `email_send_log` / `suppressed_emails` / `email_unsubscribe_tokens` (deliverability audit)
- App code, types file

### Verification (manual, Test project `wcienwozdurwhswaarjy` only — never Live)

1. Create throwaway user in Test Auth dashboard
2. Sign in once so `couple_members` / `couple_spaces` materialize
3. Optionally seed reflections / a `user_product_access` row
4. SQL Editor: `SELECT public.delete_user_account('<uuid>'::uuid);`
5. Confirm 0 rows in `step_reflections`, `user_product_access`, `user_settings`, `couple_members` for that uuid
6. Confirm `auth.users` row still exists (Prompt 4 will remove it)
7. `SET ROLE authenticated; SELECT public.delete_user_account('<uuid>'::uuid);` → must fail with permission denied; `RESET ROLE;`

Rollback: `DROP FUNCTION IF EXISTS public.delete_user_account(uuid);` — migration only defines a function, no data is touched by the migration itself.

