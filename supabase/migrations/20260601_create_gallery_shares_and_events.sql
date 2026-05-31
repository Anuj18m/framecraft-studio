create extension if not exists pgcrypto;

create table if not exists public.gallery_shares (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade unique,
  share_token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gallery_shares_gallery_id_idx
  on public.gallery_shares (gallery_id);

create index if not exists gallery_shares_share_token_idx
  on public.gallery_shares (share_token);

create index if not exists gallery_shares_active_idx
  on public.gallery_shares (is_active);

create table if not exists public.gallery_view_events (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  ip_address text
);

create index if not exists gallery_view_events_gallery_id_idx
  on public.gallery_view_events (gallery_id);

create index if not exists gallery_view_events_viewed_at_idx
  on public.gallery_view_events (viewed_at desc);

create table if not exists public.photo_download_events (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  downloaded_at timestamptz not null default now(),
  ip_address text
);

create index if not exists photo_download_events_photo_id_idx
  on public.photo_download_events (photo_id);

create index if not exists photo_download_events_gallery_id_idx
  on public.photo_download_events (gallery_id);

create index if not exists photo_download_events_downloaded_at_idx
  on public.photo_download_events (downloaded_at desc);

alter table public.gallery_shares enable row level security;
alter table public.gallery_view_events enable row level security;
alter table public.photo_download_events enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.gallery_shares to authenticated;
grant select on table public.gallery_view_events to authenticated;
grant select on table public.photo_download_events to authenticated;

drop policy if exists "Photographers can view own gallery shares" on public.gallery_shares;
drop policy if exists "Photographers can insert own gallery shares" on public.gallery_shares;
drop policy if exists "Photographers can update own gallery shares" on public.gallery_shares;
drop policy if exists "Photographers can delete own gallery shares" on public.gallery_shares;

create policy "Photographers can view own gallery shares"
on public.gallery_shares
for select
using (
  exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

create policy "Photographers can insert own gallery shares"
on public.gallery_shares
for insert
with check (
  exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

create policy "Photographers can update own gallery shares"
on public.gallery_shares
for update
using (
  exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

create policy "Photographers can delete own gallery shares"
on public.gallery_shares
for delete
using (
  exists (
    select 1
    from public.galleries g
    where g.id = gallery_id
      and g.photographer_id = auth.uid()
  )
);

drop function if exists public.resolve_gallery_by_token(text);
drop function if exists public.record_gallery_view(uuid, text);
drop function if exists public.record_photo_download(uuid, uuid, text);

create or replace function public.resolve_gallery_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  resolved jsonb;
begin
  select jsonb_build_object(
    'gallery', to_jsonb(g),
    'share', to_jsonb(s),
    'photos', coalesce(
      (
        select jsonb_agg(to_jsonb(p) order by p.created_at desc)
        from public.photos p
        where p.gallery_id = g.id
      ),
      '[]'::jsonb
    )
  )
  into resolved
  from public.gallery_shares s
  join public.galleries g on g.id = s.gallery_id
  where s.share_token = p_token
    and s.is_active = true
    and (s.expires_at is null or s.expires_at > now())
  limit 1;

  return resolved;
end;
$$;

create or replace function public.record_gallery_view(p_gallery_id uuid, p_ip_address text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gallery_view_events (gallery_id, ip_address)
  values (p_gallery_id, nullif(p_ip_address, ''));
end;
$$;

create or replace function public.record_photo_download(p_photo_id uuid, p_gallery_id uuid, p_ip_address text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.photo_download_events (photo_id, gallery_id, ip_address)
  values (p_photo_id, p_gallery_id, nullif(p_ip_address, ''));
end;
$$;

update storage.buckets
set public = true
where id = 'gallery-images';