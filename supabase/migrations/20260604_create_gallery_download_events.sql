create extension if not exists pgcrypto;

create table if not exists public.gallery_download_events (
  id uuid primary key default gen_random_uuid(),
  gallery_share_id uuid not null references public.gallery_shares(id) on delete cascade,
  photo_count integer not null default 0,
  downloaded_at timestamptz not null default now(),
  client_identifier text,
  constraint gallery_download_events_share_photo_count_check check (photo_count >= 0)
);

create index if not exists gallery_download_events_gallery_share_id_idx
  on public.gallery_download_events (gallery_share_id);

create index if not exists gallery_download_events_downloaded_at_idx
  on public.gallery_download_events (downloaded_at desc);

create index if not exists gallery_download_events_client_identifier_idx
  on public.gallery_download_events (client_identifier);

alter table public.gallery_download_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert on table public.gallery_download_events to anon, authenticated;

drop policy if exists "Photographers can view own gallery download events" on public.gallery_download_events;
drop policy if exists "Clients can view active share download events" on public.gallery_download_events;
drop policy if exists "Clients can add own gallery download events" on public.gallery_download_events;

create policy "Photographers can view own gallery download events"
on public.gallery_download_events
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

create policy "Clients can view active share download events"
on public.gallery_download_events
for select
using (
  exists (
    select 1
    from public.gallery_shares s
    where s.id = gallery_share_id
      and s.is_active = true
  )
);

create policy "Clients can add own gallery download events"
on public.gallery_download_events
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
