create table agent_threads (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  thread_id     text not null,
  checkpoint    jsonb not null default '{}',
  updated_at    timestamptz not null default now(),
  unique (case_id, user_id)
);

alter table agent_threads enable row level security;

create policy "users can manage their own agent threads"
  on agent_threads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index agent_threads_case_id_idx on agent_threads (case_id);
