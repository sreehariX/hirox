create table if not exists public.hirox_runs (
  id text primary key,
  title text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  data jsonb not null
);
create index if not exists hirox_runs_updated_idx on public.hirox_runs(updated_at desc);
alter table public.hirox_runs enable row level security;
revoke all on public.hirox_runs from anon, authenticated;
grant all on public.hirox_runs to service_role;

create table if not exists public.hirox_cache (
  id text primary key,
  created_at timestamptz not null default now(),
  data jsonb not null
);
alter table public.hirox_cache enable row level security;
revoke all on public.hirox_cache from anon, authenticated;
grant all on public.hirox_cache to service_role;
