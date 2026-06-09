create table public.chronologies (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  entry_date date not null,
  description text not null,
  source text check (source in ('task_event', 'evidence', 'document', 'manual')),
  source_id uuid,
  significance text check (significance in ('high', 'medium', 'background')) default 'background',
  perspective text check (perspective in ('plaintiff', 'defendant')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.chronologies enable row level security;

create policy "Users can view their own chronology entries"
  on public.chronologies for select
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert their own chronology entries"
  on public.chronologies for insert
  with check (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can update their own chronology entries"
  on public.chronologies for update
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can delete their own chronology entries"
  on public.chronologies for delete
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create index chronologies_case_id_idx on public.chronologies(case_id);
create index chronologies_entry_date_idx on public.chronologies(case_id, entry_date);
