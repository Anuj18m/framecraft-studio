create extension if not exists pgcrypto;

create table if not exists public.photo_favorites (
  id uuid primary key default gen_random_uuid(),
  gallery_share_id uuid not null references public.gallery_shares(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  client_identifier text not null,
  created_at timestamptz not null default now(),
  constraint photo_favorites_unique_client_photo unique (gallery_share_id, photo_id, client_identifier)
);

create index if not exists photo_favorites_gallery_share_id_idx
  on public.photo_favorites (gallery_share_id);

create index if not exists photo_favorites_photo_id_idx
  on public.photo_favorites (photo_id);

create index if not exists photo_favorites_client_identifier_idx
  on public.photo_favorites (client_identifier);

create index if not exists photo_favorites_created_at_idx
  on public.photo_favorites (created_at desc);

alter table public.photo_favorites enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, delete on table public.photo_favorites to anon, authenticated;

drop policy if exists "Photographers can view own photo favorites" on public.photo_favorites;
drop policy if exists "Clients can view active share favorites" on public.photo_favorites;
drop policy if exists "Clients can add own favorites" on public.photo_favorites;
drop policy if exists "Clients can remove own favorites" on public.photo_favorites;

create policy "Photographers can view own photo favorites"
on public.photo_favorites
for select
using (
  exists (
    select 1
    from public.gallery_shares s
    join public.galleries g on g.id = s.gallery_id
    where s.id = gallery_share_id
      and g.photographer_id = auth.uid()
  )
);

create policy "Clients can view active share favorites"
on public.photo_favorites
for select
using (
  exists (
    select 1
    from public.gallery_shares s
    where s.id = gallery_share_id
      and s.is_active = true
  )
);

create policy "Clients can add own favorites"
on public.photo_favorites
for insert
with check (
  exists (
    select 1
    from public.gallery_shares s
    where s.id = gallery_share_id
      and s.is_active = true
  )
  and client_identifier = nullif(coalesce(current_setting('request.headers', true), '{}')::json->>'x-client-identifier', '')
);

create policy "Clients can remove own favorites"
on public.photo_favorites
for delete
using (
  exists (
    select 1
    from public.gallery_shares s
    where s.id = gallery_share_id
      and s.is_active = true
  )
  and client_identifier = nullif(coalesce(current_setting('request.headers', true), '{}')::json->>'x-client-identifier', '')
);