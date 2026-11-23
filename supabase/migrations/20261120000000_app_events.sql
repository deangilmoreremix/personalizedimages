-- Optional: privacy-friendly engagement events sent with the Beacon API.
-- Service-role only (written by the app-events edge function); no user identifiers.
create table if not exists public.app_events (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 64),
  props jsonb not null default '{}'::jsonb,
  session text,
  path text,
  created_at timestamptz not null default now()
);
alter table public.app_events enable row level security;
-- No policies: anon/authenticated cannot read or write; the edge function uses the service role.
create index if not exists app_events_created_at_idx on public.app_events (created_at desc);
create index if not exists app_events_name_idx on public.app_events (name, created_at desc);
