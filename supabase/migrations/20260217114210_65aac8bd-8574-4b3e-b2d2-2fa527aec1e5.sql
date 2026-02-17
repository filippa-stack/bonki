
-- 1) Sessions
create table if not exists couple_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_space_id uuid not null references couple_spaces(id) on delete cascade,
  category_id uuid,
  card_id uuid,
  status text not null check (status in ('active','completed','cancelled')),
  created_by uuid not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2) Steps
create table if not exists couple_session_steps (
  session_id uuid not null references couple_sessions(id) on delete cascade,
  couple_space_id uuid not null references couple_spaces(id) on delete cascade,
  step_index int not null check (step_index >= 0),
  created_at timestamptz not null default now(),
  primary key (session_id, step_index)
);

-- 3) Completions (idempotent)
create table if not exists couple_session_completions (
  session_id uuid not null references couple_sessions(id) on delete cascade,
  couple_space_id uuid not null references couple_spaces(id) on delete cascade,
  step_index int not null check (step_index >= 0),
  user_id uuid not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (session_id, step_index, user_id)
);

-- 4) Takeaways
create table if not exists couple_takeaways (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references couple_sessions(id) on delete cascade,
  couple_space_id uuid not null references couple_spaces(id) on delete cascade,
  created_by uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on all new tables
alter table couple_sessions enable row level security;
alter table couple_session_steps enable row level security;
alter table couple_session_completions enable row level security;
alter table couple_takeaways enable row level security;

-- RLS policies: couple_sessions
create policy "Members can read sessions" on couple_sessions for select using (is_couple_member(auth.uid(), couple_space_id));
create policy "Members can insert sessions" on couple_sessions for insert with check (is_couple_member(auth.uid(), couple_space_id) and auth.uid() = created_by);
create policy "Members can update sessions" on couple_sessions for update using (is_couple_member(auth.uid(), couple_space_id));

-- RLS policies: couple_session_steps
create policy "Members can read steps" on couple_session_steps for select using (is_couple_member(auth.uid(), couple_space_id));
create policy "Members can insert steps" on couple_session_steps for insert with check (is_couple_member(auth.uid(), couple_space_id));

-- RLS policies: couple_session_completions
create policy "Members can read completions" on couple_session_completions for select using (is_couple_member(auth.uid(), couple_space_id));
create policy "Members can insert completions" on couple_session_completions for insert with check (is_couple_member(auth.uid(), couple_space_id) and auth.uid() = user_id);

-- RLS policies: couple_takeaways
create policy "Members can read takeaways" on couple_takeaways for select using (is_couple_member(auth.uid(), couple_space_id));
create policy "Members can insert takeaways" on couple_takeaways for insert with check (is_couple_member(auth.uid(), couple_space_id) and auth.uid() = created_by);
