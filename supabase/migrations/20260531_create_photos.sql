create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  photographer_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists photos_gallery_id_idx
  on public.photos (gallery_id);

create index if not exists photos_photographer_id_idx
  on public.photos (photographer_id);

alter table public.photos enable row level security;

grant usage on schema public to authenticated;
grant select, insert, delete on table public.photos to authenticated;

drop policy if exists "Photographers can view own photos" on public.photos;
drop policy if exists "Photographers can insert own photos" on public.photos;
drop policy if exists "Photographers can delete own photos" on public.photos;

create policy "Photographers can view own photos"
on public.photos
for select
using (
  auth.uid() = photographer_id
  and exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

create policy "Photographers can insert own photos"
on public.photos
for insert
with check (
  auth.uid()::uuid = photographer_id
  and exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()::uuid
  )
);

create policy "Photographers can delete own photos"
on public.photos
for delete
using (
  auth.uid() = photographer_id
  and exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', false)
on conflict (id) do update
set public = excluded.public;

grant usage on schema storage to authenticated;
grant select, insert, delete on table storage.objects to authenticated;
grant select on table storage.buckets to authenticated;

alter table storage.objects enable row level security;

drop policy if exists "Authenticated users can read own gallery images" on storage.objects;
drop policy if exists "Authenticated users can upload own gallery images" on storage.objects;
drop policy if exists "Authenticated users can delete own gallery images" on storage.objects;

create policy "Authenticated users can read own gallery images"
on storage.objects
for select
using (
  bucket_id = 'gallery-images'
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can upload own gallery images"
on storage.objects
for insert
with check (
  bucket_id = 'gallery-images'
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can delete own gallery images"
on storage.objects
for delete
using (
  bucket_id = 'gallery-images'
  and auth.role() = 'authenticated'
);