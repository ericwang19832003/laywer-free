alter table public.cases
  add column if not exists courtlistener_docket_id integer,
  add column if not exists court_case_number text,
  add column if not exists docket_last_checked timestamptz;
