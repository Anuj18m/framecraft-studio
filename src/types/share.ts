import type { Gallery } from './gallery';
import type { Photo } from './photo';

export interface GalleryShare {
  id: string;
  gallery_id: string;
  share_token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface PublicPhoto extends Photo {
  publicUrl: string;
}

export interface ResolvedGallery {
  gallery: Gallery;
  share: GalleryShare;
  photos: PublicPhoto[];
}