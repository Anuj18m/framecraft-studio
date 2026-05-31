import { getGalleryById } from './galleryService';
import { supabase } from './supabase';
import type { GalleryShare, PublicPhoto, ResolvedGallery } from '../types/share';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

const BUCKET_NAME = 'gallery-images';

function generateShareToken() {
  return globalThis.crypto?.randomUUID?.().replaceAll('-', '') ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toPublicPhoto(photo: Record<string, unknown>): PublicPhoto {
  const filePath = String(photo.file_path ?? '');
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return {
    id: String(photo.id ?? ''),
    gallery_id: String(photo.gallery_id ?? ''),
    photographer_id: String(photo.photographer_id ?? ''),
    file_name: String(photo.file_name ?? ''),
    file_path: filePath,
    created_at: String(photo.created_at ?? ''),
    publicUrl: data.publicUrl,
  };
}

async function getAuthenticatedGallery(galleryId: string) {
  const { data: gallery, error } = await getGalleryById(galleryId);

  if (error || !gallery) {
    return { gallery: null, error };
  }

  return { gallery, error: null };
}

export async function getGalleryShare(galleryId: string): Promise<ServiceResult<GalleryShare>> {
  const { gallery, error: galleryError } = await getAuthenticatedGallery(galleryId);

  if (galleryError || !gallery) {
    return { data: null, error: galleryError };
  }

  const { data, error } = await supabase
    .from('gallery_shares')
    .select('*')
    .eq('gallery_id', gallery.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data as GalleryShare | null) ?? null, error: null };
}

async function saveShareLink(galleryId: string, options: { shareToken: string; isActive: boolean }) {
  const { gallery, error: galleryError } = await getAuthenticatedGallery(galleryId);

  if (galleryError || !gallery) {
    return { data: null, error: galleryError };
  }

  const payload = {
    gallery_id: gallery.id,
    share_token: options.shareToken,
    is_active: options.isActive,
  };

  const { data: existingShare, error: existingError } = await supabase
    .from('gallery_shares')
    .select('*')
    .eq('gallery_id', gallery.id)
    .maybeSingle();

  if (existingError) {
    return { data: null, error: { message: existingError.message } };
  }

  if (existingShare) {
    const { data, error } = await supabase
      .from('gallery_shares')
      .update(payload)
      .eq('gallery_id', gallery.id)
      .select('*')
      .single();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data: data as GalleryShare, error: null };
  }

  const { data, error } = await supabase.from('gallery_shares').insert(payload).select('*').single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as GalleryShare, error: null };
}

export async function createShareLink(galleryId: string): Promise<ServiceResult<GalleryShare>> {
  return saveShareLink(galleryId, { shareToken: generateShareToken(), isActive: true });
}

export async function disableShareLink(galleryId: string): Promise<ServiceResult<GalleryShare>> {
  const { gallery, error: galleryError } = await getAuthenticatedGallery(galleryId);

  if (galleryError || !gallery) {
    return { data: null, error: galleryError };
  }

  const { data, error } = await supabase
    .from('gallery_shares')
    .update({ is_active: false })
    .eq('gallery_id', gallery.id)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as GalleryShare, error: null };
}

export async function regenerateShareLink(galleryId: string): Promise<ServiceResult<GalleryShare>> {
  return saveShareLink(galleryId, { shareToken: generateShareToken(), isActive: true });
}

export async function resolveGalleryByToken(token: string): Promise<ServiceResult<ResolvedGallery>> {
  const { data, error } = await supabase.rpc('resolve_gallery_by_token', { p_token: token });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  if (!data) {
    return { data: null, error: { message: 'This share link is inactive, expired, or invalid.' } };
  }

  const payload = data as {
    gallery?: Record<string, unknown>;
    share?: Record<string, unknown>;
    photos?: Record<string, unknown>[];
  };

  if (!payload.gallery || !payload.share) {
    return { data: null, error: { message: 'Unable to resolve this gallery.' } };
  }

  const photos = (payload.photos ?? []).map((photo) => toPublicPhoto(photo));

  return {
    data: {
      gallery: payload.gallery as ResolvedGallery['gallery'],
      share: payload.share as GalleryShare,
      photos,
    },
    error: null,
  };
}

export async function recordGalleryView(galleryId: string, ipAddress?: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.rpc('record_gallery_view', {
    p_gallery_id: galleryId,
    p_ip_address: ipAddress ?? null,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: true, error: null };
}

export async function recordPhotoDownload(
  photoId: string,
  galleryId: string,
  ipAddress?: string,
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.rpc('record_photo_download', {
    p_photo_id: photoId,
    p_gallery_id: galleryId,
    p_ip_address: ipAddress ?? null,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: true, error: null };
}