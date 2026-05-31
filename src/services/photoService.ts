import { supabase } from './supabase';
import type { Photo, PhotoWithUrl } from '../types/photo';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

const BUCKET_NAME = 'gallery-images';

async function getAuthenticatedUserId() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return { userId: null, error: { message: sessionError.message } satisfies ServiceError };
  }

  const userId = sessionData?.session?.user?.id ?? null;

  if (!userId) {
    return { userId: null, error: { message: 'You must be signed in to manage photos.' } satisfies ServiceError };
  }

  // ensure we have an access token attached to the session for authenticated requests
  const accessToken = sessionData?.session?.access_token ?? null;

  if (!accessToken) {
    return { userId: null, error: { message: 'Authentication session is missing or expired. Please sign in again.' } satisfies ServiceError };
  }

  return { userId, error: null };
}

function createObjectPath(userId: string, galleryId: string, fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const uniqueId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${userId}/${galleryId}/${uniqueId}-${safeFileName}`;
}

export async function uploadPhoto(galleryId: string, files: File[]): Promise<ServiceResult<Photo[]>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  if (files.length === 0) {
    return { data: [], error: null };
  }

  const uploadedPhotos: Photo[] = [];

  for (const file of files) {
    const objectPath = createObjectPath(userId, galleryId, file.name);

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return { data: null, error: { message: uploadError.message } };
    }

    // verify gallery ownership to satisfy RLS policies before attempting insert
    const { data: galleryData, error: galleryError } = await supabase
      .from('galleries')
      .select('photographer_id')
      .eq('id', galleryId)
      .single();

    if (galleryError || !galleryData) {
      await supabase.storage.from(BUCKET_NAME).remove([objectPath]);
      return { data: null, error: { message: galleryError?.message ?? 'Gallery not found.' } };
    }

    if (galleryData.photographer_id !== userId) {
      await supabase.storage.from(BUCKET_NAME).remove([objectPath]);
      return { data: null, error: { message: 'You are not the owner of this gallery.' } };
    }

    const insertPayload = {
      gallery_id: galleryId,
      photographer_id: userId,
      file_name: file.name,
      file_path: objectPath,
    };

    const { data, error: insertError } = await supabase
      .from('photos')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      return { data: null, error: { message: insertError.message } };
    }

    uploadedPhotos.push(data as Photo);
  }

  return { data: uploadedPhotos, error: null };
}

export async function getPhotos(galleryId: string): Promise<ServiceResult<PhotoWithUrl[]>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .eq('photographer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  const photos = (data ?? []) as Photo[];
  const photosWithUrl: PhotoWithUrl[] = [];

  for (const photo of photos) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(photo.file_path, 60 * 60 * 24);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return { data: null, error: { message: signedUrlError?.message ?? 'Unable to generate photo URL.' } };
    }

    photosWithUrl.push({ ...photo, signedUrl: signedUrlData.signedUrl });
  }

  return { data: photosWithUrl, error: null };
}

export async function deletePhoto(photoId: string, filePath: string): Promise<ServiceResult<boolean>> {
  const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (storageError) {
    return { data: null, error: { message: storageError.message } };
  }

  const { error } = await supabase.from('photos').delete().eq('id', photoId);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: true, error: null };
}
