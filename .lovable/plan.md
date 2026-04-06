

## Clear Test Accounts for First-Time User Testing

### What gets deleted (Live environment)

All data tied to emma@bonkistudio.com and sofia@bonkistudio.com across these tables, in dependency order:

1. **couple_session_completions** — for sessions in their spaces
2. **couple_session_steps** — for sessions in their spaces
3. **step_reflections** — by user_id (276 rows)
4. **reflection_responses** — by user_id
5. **couple_takeaways** — by couple_space_id (4 rows)
6. **card_takeaways** — via card_sessions in their spaces
7. **question_bookmarks** — by couple_space_id (1 row)
8. **prompt_notes** — by couple_space_id (18 rows)
9. **couple_card_visits** — by couple_space_id
10. **couple_journey_meta** — by couple_space_id
11. **couple_progress** — by couple_space_id
12. **beta_feedback** — by couple_space_id (2 rows)
13. **card_sessions** — by couple_space_id (1 row)
14. **couple_sessions** — by couple_space_id (42 rows)
15. **topic_proposals** — by couple_space_id
16. **onboarding_events** — by user_id
17. **notification_preferences** — by user_id
18. **user_product_access** — by user_id (2 rows)
19. **user_settings** — by user_id
20. **user_backups** — by user_id
21. **product_interest** — by user_id
22. **couple_members** — by user_id (3 memberships)
23. **couple_spaces** — the 2 active spaces (+ 1 old left space for Sofia)
24. **system_events** — by couple_space_id

### Implementation

A single SQL migration that deletes all rows in the correct order (child tables first to avoid FK issues). The migration targets Live data using the three specific space IDs and two user IDs.

The accounts themselves (auth.users) are NOT touched — only the application data is removed. When they log in again, the app will auto-create a fresh couple space, giving them a true first-time experience.

### Scope
- **Spaces cleared:** `7ebc060a-...`, `b96c1e5c-...`, `2f7568ba-...`
- **Users cleared:** `999288dd-...` (Emma), `d3ac01ff-...` (Sofia)
- **Auth untouched:** They can still log in with their existing credentials

