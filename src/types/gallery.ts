export type GalleryStatus = 'draft' | 'active';

export interface Gallery {
  id: string;
  photographer_id: string;
  title: string;
  description: string | null;
  status: GalleryStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateGalleryInput {
  title: string;
  description?: string | null;
  status?: GalleryStatus;
}

export interface UpdateGalleryInput {
  id: string;
  title?: string;
  description?: string | null;
  status?: GalleryStatus;
}
