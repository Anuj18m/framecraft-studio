import type { Gallery } from './gallery';
import type { Photo } from './photo';

export interface PhotoFavorite {
  id: string;
  gallery_share_id: string;
  photo_id: string;
  client_identifier: string;
  created_at: string;
}

export interface FavoritePhotoRecord extends PhotoFavorite {
  photo?: Photo | null;
  gallery?: Gallery | null;
  gallery_share?: {
    id: string;
    gallery_id: string;
    share_token: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  } | null;
}

export interface FavoriteSummary {
  photoId: string;
  photo: Photo | null;
  gallery: Gallery | null;
  count: number;
  mostRecentAt: string;
}