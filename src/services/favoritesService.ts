import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { FavoritePhotoRecord, PhotoFavorite, FavoriteSummary } from '../types/favorite';
import type { Gallery } from '../types/gallery';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

interface FavoriteRow extends PhotoFavorite {
  photo?: Record<string, unknown> | null;
  gallery?: Record<string, unknown> | null;
  gallery_share?: Record<string, unknown> | null;
}

const BUCKET_HEADER_NAME = 'x-client-identifier';

function createFavoritesClient(clientIdentifier?: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: clientIdentifier
      ? {
          headers: {
            [BUCKET_HEADER_NAME]: clientIdentifier,
          },
        }
      : undefined,
  });
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { userId: null, error: { message: error.message } satisfies ServiceError };
  }

  const userId = data.user?.id ?? null;

  if (!userId) {
    return { userId: null, error: { message: 'You must be signed in to view favorites.' } satisfies ServiceError };
  }

  return { userId, error: null };
}

function toFavoriteRecord(row: FavoriteRow): FavoritePhotoRecord {
  return {
    id: row.id,
    gallery_share_id: row.gallery_share_id,
    photo_id: row.photo_id,
    client_identifier: row.client_identifier,
    created_at: row.created_at,
    photo: row.photo ? (row.photo as FavoritePhotoRecord['photo']) : null,
    gallery: row.gallery ? (row.gallery as Gallery) : null,
    gallery_share: row.gallery_share
      ? {
          id: String(row.gallery_share.id ?? ''),
          gallery_id: String(row.gallery_share.gallery_id ?? ''),
          share_token: String(row.gallery_share.share_token ?? ''),
          is_active: Boolean(row.gallery_share.is_active),
          expires_at: (row.gallery_share.expires_at as string | null) ?? null,
          created_at: String(row.gallery_share.created_at ?? ''),
        }
      : null,
  };
}

function toFavoriteSummary(rows: FavoritePhotoRecord[]): FavoriteSummary[] {
  const summaryMap = new Map<string, FavoriteSummary>();

  for (const row of rows) {
    const current = summaryMap.get(row.photo_id);

    if (!current) {
      summaryMap.set(row.photo_id, {
        photoId: row.photo_id,
        photo: row.photo ?? null,
        gallery: row.gallery ?? null,
        count: 1,
        mostRecentAt: row.created_at,
      });
      continue;
    }

    current.count += 1;
    if (new Date(row.created_at).getTime() > new Date(current.mostRecentAt).getTime()) {
      current.mostRecentAt = row.created_at;
    }
  }

  return Array.from(summaryMap.values()).sort(
    (left, right) => right.count - left.count || new Date(right.mostRecentAt).getTime() - new Date(left.mostRecentAt).getTime(),
  );
}

export async function addFavorite(
  galleryShareId: string,
  photoId: string,
  clientIdentifier: string,
): Promise<ServiceResult<PhotoFavorite>> {
  const client = createFavoritesClient(clientIdentifier);

  const payload = {
    gallery_share_id: galleryShareId,
    photo_id: photoId,
    client_identifier: clientIdentifier,
  };

  const { data, error } = await client
    .from('photo_favorites')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as PhotoFavorite, error: null };
}

export async function removeFavorite(
  galleryShareId: string,
  photoId: string,
  clientIdentifier: string,
): Promise<ServiceResult<boolean>> {
  const client = createFavoritesClient(clientIdentifier);

  const { error } = await client
    .from('photo_favorites')
    .delete()
    .eq('gallery_share_id', galleryShareId)
    .eq('photo_id', photoId)
    .eq('client_identifier', clientIdentifier);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: true, error: null };
}

export async function getFavoriteCount(galleryShareId: string, photoId: string): Promise<ServiceResult<number>> {
  const { count, error } = await supabase
    .from('photo_favorites')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_share_id', galleryShareId)
    .eq('photo_id', photoId);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: count ?? 0, error: null };
}

export async function getFavoritesForGallery(galleryId?: string): Promise<ServiceResult<FavoritePhotoRecord[]>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const baseQuery = supabase
    .from('photo_favorites')
    .select(
      `
        id,
        gallery_share_id,
        photo_id,
        client_identifier,
        created_at,
        photo:photos(id,gallery_id,photographer_id,file_name,file_path,created_at),
        gallery_share:gallery_shares(
          id,
          gallery_id,
          share_token,
          is_active,
          expires_at,
          created_at,
          gallery:galleries(id,photographer_id,title,description,status,created_at,updated_at)
        )
      `,
    )
    .order('created_at', { ascending: false });

  const { data: rows, error } = galleryId
    ? await (async () => {
        const { data: shares, error: shareError } = await supabase
          .from('gallery_shares')
          .select('id')
          .eq('gallery_id', galleryId);

        if (shareError) {
          return { data: null, error: shareError };
        }

        const shareIds = (shares ?? []).map((share) => share.id);

        if (shareIds.length === 0) {
          return { data: [], error: null };
        }

        return await baseQuery.in('gallery_share_id', shareIds);
      })()
    : await baseQuery;

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (rows ?? []).map((row) => toFavoriteRecord(row as FavoriteRow)), error: null };
}

export async function getClientFavorites(
  galleryShareId: string,
  clientIdentifier: string,
): Promise<ServiceResult<PhotoFavorite[]>> {
  const client = createFavoritesClient(clientIdentifier);

  const { data, error } = await client
    .from('photo_favorites')
    .select('id,gallery_share_id,photo_id,client_identifier,created_at')
    .eq('gallery_share_id', galleryShareId)
    .eq('client_identifier', clientIdentifier)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data ?? []) as PhotoFavorite[], error: null };
}

export function summarizeFavorites(rows: FavoritePhotoRecord[]) {
  return toFavoriteSummary(rows);
}