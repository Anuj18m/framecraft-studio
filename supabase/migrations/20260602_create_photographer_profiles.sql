create extension if not exists pgcrypto;

create table if not exists public.photographer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  logo_url text,
  primary_color text not null default '#2563eb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photographer_profiles_created_at_idx
  on public.photographer_profiles (created_at desc);

create index if not exists photographer_profiles_updated_at_idx
  on public.photographer_profiles (updated_at desc);

alter table public.photographer_profiles enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.photographer_profiles to anon, authenticated;
grant insert, update, delete on table public.photographer_profiles to authenticated;

drop policy if exists "Anyone can view photographer profiles" on public.photographer_profiles;
drop policy if exists "Photographers can insert own profile" on public.photographer_profiles;
drop policy if exists "Photographers can update own profile" on public.photographer_profiles;
drop policy if exists "Photographers can delete own profile" on public.photographer_profiles;

create policy "Anyone can view photographer profiles"
on public.photographer_profiles
for select
using (true);

create policy "Photographers can insert own profile"
on public.photographer_profiles
for insert
with check (auth.uid() = user_id);

create policy "Photographers can update own profile"
on public.photographer_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Photographers can delete own profile"
on public.photographer_profiles
for delete
using (auth.uid() = user_id);

drop trigger if exists set_photographer_profiles_updated_at on public.photographer_profiles;

create trigger set_photographer_profiles_updated_at
before update on public.photographer_profiles
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('photographer-logos', 'photographer-logos', true)
on conflict (id) do update
set public = excluded.public;

grant usage on schema storage to authenticated;
grant select, insert, delete on table storage.objects to authenticated;

alter table storage.objects enable row level security;

drop policy if exists "Authenticated users can read brand logos" on storage.objects;
drop policy if exists "Authenticated users can upload brand logos" on storage.objects;
drop policy if exists "Authenticated users can delete brand logos" on storage.objects;

create policy "Authenticated users can read brand logos"
on storage.objects
for select
using (
  bucket_id = 'photographer-logos'
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can upload brand logos"
on storage.objects
for insert
with check (
  bucket_id = 'photographer-logos'
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can delete brand logos"
on storage.objects
for delete
using (
  bucket_id = 'photographer-logos'
  and auth.role() = 'authenticated'
);