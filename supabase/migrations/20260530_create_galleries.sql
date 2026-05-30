create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists galleries_photographer_id_idx
  on public.galleries (photographer_id);

create index if not exists galleries_status_idx
  on public.galleries (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_galleries_updated_at on public.galleries;

create trigger set_galleries_updated_at
before update on public.galleries
for each row
execute function public.set_updated_at();

alter table public.galleries enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.galleries to authenticated;

drop policy if exists "Photographers can view own galleries" on public.galleries;
drop policy if exists "Photographers can insert own galleries" on public.galleries;
drop policy if exists "Photographers can update own galleries" on public.galleries;
drop policy if exists "Photographers can delete own galleries" on public.galleries;

create policy "Photographers can view own galleries"
on public.galleries
for select
using (auth.uid() = photographer_id);

create policy "Photographers can insert own galleries"
on public.galleries
for insert
with check (auth.uid() = photographer_id);

create policy "Photographers can update own galleries"
on public.galleries
for update
using (auth.uid() = photographer_id)
with check (auth.uid() = photographer_id);

create policy "Photographers can delete own galleries"
on public.galleries
for delete
using (auth.uid() = photographer_id);
