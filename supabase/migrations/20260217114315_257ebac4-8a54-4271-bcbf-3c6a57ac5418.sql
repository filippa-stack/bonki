
create unique index if not exists uniq_active_session_per_space
on couple_sessions(couple_space_id)
where status = 'active';
