import { supabase } from './supabase';
import type { CreateProfileInput, PhotographerProfile, UpdateProfileInput } from '../types/profile';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

const BUCKET_NAME = 'photographer-logos';

function normalizeColor(value?: string) {
  return value?.trim() || '#2563eb';
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { userId: null, error: { message: error.message } satisfies ServiceError };
  }

  const userId = data.user?.id ?? null;

  if (!userId) {
    return { userId: null, error: { message: 'You must be signed in to manage branding.' } satisfies ServiceError };
  }

  return { userId, error: null };
}

function toProfile(payload: Record<string, unknown>) {
  return payload as PhotographerProfile;
}

function buildLogoPath(userId: string, fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const uniqueId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${userId}/${uniqueId}-${safeFileName}`;
}

export async function getProfile(userId?: string): Promise<ServiceResult<PhotographerProfile>> {
  const targetUserId = userId ?? (await getAuthenticatedUserId()).userId;

  if (!targetUserId) {
    return { data: null, error: { message: 'You must be signed in to manage branding.' } };
  }

  const { data, error } = await supabase
    .from('photographer_profiles')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data ? toProfile(data as Record<string, unknown>) : null), error: null };
}

export async function createProfile(input: CreateProfileInput = {}): Promise<ServiceResult<PhotographerProfile>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const payload = {
    user_id: userId,
    business_name: input.businessName?.trim() ? input.businessName.trim() : null,
    logo_url: input.logoUrl?.trim() ? input.logoUrl.trim() : null,
    primary_color: normalizeColor(input.primaryColor),
  };

  const { data, error } = await supabase.from('photographer_profiles').insert(payload).select('*').single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: toProfile(data as Record<string, unknown>), error: null };
}

export async function updateProfile(input: UpdateProfileInput): Promise<ServiceResult<PhotographerProfile>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const payload: Record<string, string | null> = {};

  if (input.businessName !== undefined) {
    payload.business_name = input.businessName.trim() ? input.businessName.trim() : null;
  }

  if (input.logoUrl !== undefined) {
    payload.logo_url = input.logoUrl?.trim() ? input.logoUrl.trim() : null;
  }

  if (input.primaryColor !== undefined) {
    payload.primary_color = normalizeColor(input.primaryColor);
  }

  const { data, error } = await supabase
    .from('photographer_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: toProfile(data as Record<string, unknown>), error: null };
}

export async function uploadLogo(file: File): Promise<ServiceResult<string>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const objectPath = buildLogoPath(userId, file.name);

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return { data: null, error: { message: uploadError.message } };
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

  return { data: data.publicUrl, error: null };
}