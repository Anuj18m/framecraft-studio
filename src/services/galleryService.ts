import { supabase } from './supabase';
import type { CreateGalleryInput, Gallery, UpdateGalleryInput } from '../types/gallery';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { userId: null, error: { message: error.message } satisfies ServiceError };
  }

  const userId = data.user?.id ?? null;

  if (!userId) {
    return { userId: null, error: { message: 'You must be signed in to manage galleries.' } satisfies ServiceError };
  }

  return { userId, error: null };
}

export async function createGallery(input: CreateGalleryInput): Promise<ServiceResult<Gallery>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const payload: Record<string, string | null> = {
    photographer_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
  };

  if (input.status && input.status !== 'draft') {
    payload.status = input.status;
  }

  const { data, error } = await supabase.from('galleries').insert(payload).select().single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as Gallery, error: null };
}

export async function getGalleries(): Promise<ServiceResult<Gallery[]>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('photographer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data ?? []) as Gallery[], error: null };
}

export async function updateGallery(input: UpdateGalleryInput): Promise<ServiceResult<Gallery>> {
  const updatePayload: Record<string, string | null> = {};

  if (input.title !== undefined) {
    updatePayload.title = input.title.trim();
  }

  if (input.description !== undefined) {
    updatePayload.description = input.description?.trim() ? input.description.trim() : null;
  }

  if (input.status !== undefined) {
    updatePayload.status = input.status;
  }

  const { data, error } = await supabase.from('galleries').update(updatePayload).eq('id', input.id).select().single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as Gallery, error: null };
}

export async function deleteGallery(id: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from('galleries').delete().eq('id', id);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: true, error: null };
}

export async function getGalleryById(id: string): Promise<ServiceResult<Gallery>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', id)
    .eq('photographer_id', userId)
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: data as Gallery, error: null };
}
