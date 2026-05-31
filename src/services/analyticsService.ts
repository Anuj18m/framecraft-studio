import { getGalleryById } from './galleryService';
import { supabase } from './supabase';
import type { Gallery } from '../types/gallery';
import type { Photo } from '../types/photo';

interface ServiceError {
  message: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

interface GalleryBaseMetrics {
  gallery: Gallery;
  photoCount: number;
  viewCount: number;
  downloadCount: number;
}

export interface DashboardAnalytics {
  totalGalleries: number;
  totalPhotos: number;
  totalViews: number;
  totalDownloads: number;
  galleryMetrics: GalleryBaseMetrics[];
}

export interface GalleryAnalytics extends GalleryBaseMetrics {
  gallery: Gallery;
  recentViews: Array<{ id: string; viewed_at: string; ip_address: string | null }>;
  recentDownloads: Array<{ id: string; downloaded_at: string; ip_address: string | null; photo_id: string }>;
}

export interface RecentActivityItem {
  id: string;
  type: 'view' | 'download' | 'gallery-download';
  galleryId: string;
  galleryTitle: string;
  photoId?: string;
  photoName?: string;
  photoCount?: number;
  occurredAt: string;
}

type GalleryRow = Pick<Gallery, 'id' | 'title' | 'description' | 'status' | 'created_at' | 'updated_at' | 'photographer_id'>;

type PhotoRow = Pick<Photo, 'id' | 'gallery_id' | 'file_name' | 'created_at' | 'photographer_id' | 'file_path'>;

type ViewRow = {
  id: string;
  gallery_id: string;
  viewed_at: string;
  ip_address: string | null;
};

type DownloadRow = {
  id: string;
  gallery_id: string;
  photo_id: string;
  downloaded_at: string;
  ip_address: string | null;
};

type GalleryDownloadRow = {
  id: string;
  downloaded_at: string;
  photo_count: number;
  gallery_share: { gallery_id: string } | null;
};

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { userId: null, error: { message: error.message } satisfies ServiceError };
  }

  const userId = data.user?.id ?? null;

  if (!userId) {
    return { userId: null, error: { message: 'You must be signed in to view analytics.' } satisfies ServiceError };
  }

  return { userId, error: null };
}

function buildGalleryMetrics(galleries: GalleryRow[], photos: PhotoRow[], views: ViewRow[], downloads: DownloadRow[], galleryDownloads: GalleryDownloadRow[]) {
  const photoCounts = new Map<string, number>();
  const viewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();

  for (const photo of photos) {
    photoCounts.set(photo.gallery_id, (photoCounts.get(photo.gallery_id) ?? 0) + 1);
  }

  for (const view of views) {
    viewCounts.set(view.gallery_id, (viewCounts.get(view.gallery_id) ?? 0) + 1);
  }

  for (const download of downloads) {
    downloadCounts.set(download.gallery_id, (downloadCounts.get(download.gallery_id) ?? 0) + 1);
  }

  for (const download of galleryDownloads) {
    const galleryId = download.gallery_share?.gallery_id;

    if (!galleryId) {
      continue;
    }

    downloadCounts.set(galleryId, (downloadCounts.get(galleryId) ?? 0) + 1);
  }

  return galleries.map((gallery) => ({
    gallery: gallery as Gallery,
    photoCount: photoCounts.get(gallery.id) ?? 0,
    viewCount: viewCounts.get(gallery.id) ?? 0,
    downloadCount: downloadCounts.get(gallery.id) ?? 0,
  }));
}

function mergeRecentActivity(galleries: GalleryRow[], photos: PhotoRow[], views: ViewRow[], downloads: DownloadRow[]) {
  const galleryMap = new Map(galleries.map((gallery) => [gallery.id, gallery] as const));
  const photoMap = new Map(photos.map((photo) => [photo.id, photo] as const));

  const recentViews: RecentActivityItem[] = views.map((view) => {
    const gallery = galleryMap.get(view.gallery_id);

    return {
      id: view.id,
      type: 'view',
      galleryId: view.gallery_id,
      galleryTitle: gallery?.title ?? 'Unknown gallery',
      occurredAt: view.viewed_at,
    };
  });

  const recentDownloads: RecentActivityItem[] = downloads.map((download) => {
    const gallery = galleryMap.get(download.gallery_id);
    const photo = photoMap.get(download.photo_id);

    return {
      id: download.id,
      type: 'download',
      galleryId: download.gallery_id,
      galleryTitle: gallery?.title ?? 'Unknown gallery',
      photoId: download.photo_id,
      photoName: photo?.file_name,
      occurredAt: download.downloaded_at,
    };
  });

  return [...recentViews, ...recentDownloads].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

function mapGalleryDownloadsToActivity(galleries: GalleryRow[], galleryDownloads: GalleryDownloadRow[]) {
  const galleryMap = new Map(galleries.map((gallery) => [gallery.id, gallery] as const));

  return galleryDownloads.map((download) => {
    const galleryId = download.gallery_share?.gallery_id ?? '';
    const gallery = galleryMap.get(galleryId);

    return {
      id: download.id,
      type: 'gallery-download' as const,
      galleryId,
      galleryTitle: gallery?.title ?? 'Unknown gallery',
      photoCount: download.photo_count,
      occurredAt: download.downloaded_at,
    } satisfies RecentActivityItem;
  });
}

export async function getDashboardAnalytics(): Promise<ServiceResult<DashboardAnalytics>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data: galleriesData, error: galleriesError } = await supabase
    .from('galleries')
    .select('id,title,description,status,created_at,updated_at,photographer_id')
    .eq('photographer_id', userId)
    .order('created_at', { ascending: false });

  if (galleriesError) {
    return { data: null, error: { message: galleriesError.message } };
  }

  const galleries = (galleriesData ?? []) as GalleryRow[];
  const galleryIds = galleries.map((gallery) => gallery.id);

  const [{ data: photosData, error: photosError }, { data: viewsData, error: viewsError }, { data: downloadsData, error: downloadsError }, { data: galleryDownloadsData, error: galleryDownloadsError }] =
    await Promise.all([
      supabase.from('photos').select('id,gallery_id,file_name,created_at,photographer_id,file_path').eq('photographer_id', userId),
      galleryIds.length > 0
        ? supabase.from('gallery_view_events').select('id,gallery_id,viewed_at,ip_address').in('gallery_id', galleryIds)
        : Promise.resolve({ data: [], error: null }),
      galleryIds.length > 0
        ? supabase.from('photo_download_events').select('id,gallery_id,photo_id,downloaded_at,ip_address').in('gallery_id', galleryIds)
        : Promise.resolve({ data: [], error: null }),
      galleryIds.length > 0
        ? supabase.from('gallery_download_events').select('id,downloaded_at,photo_count,gallery_share:gallery_shares(gallery_id)').order('downloaded_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (photosError) {
    return { data: null, error: { message: photosError.message } };
  }

  if (viewsError) {
    return { data: null, error: { message: viewsError.message } };
  }

  if (downloadsError) {
    return { data: null, error: { message: downloadsError.message } };
  }

  if (galleryDownloadsError) {
    return { data: null, error: { message: galleryDownloadsError.message } };
  }

  const photos = (photosData ?? []) as PhotoRow[];
  const views = (viewsData ?? []) as ViewRow[];
  const downloads = (downloadsData ?? []) as DownloadRow[];
  const galleryDownloads = (galleryDownloadsData ?? []) as GalleryDownloadRow[];

  const galleryMetrics = buildGalleryMetrics(galleries, photos, views, downloads, galleryDownloads);

  return {
    data: {
      totalGalleries: galleries.length,
      totalPhotos: photos.length,
      totalViews: views.length,
      totalDownloads: downloads.length + galleryDownloads.length,
      galleryMetrics,
    },
    error: null,
  };
}

export async function getGalleryAnalytics(galleryId: string): Promise<ServiceResult<GalleryAnalytics>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data: gallery, error: galleryError } = await getGalleryById(galleryId);

  if (galleryError || !gallery) {
    return { data: null, error: galleryError };
  }

  const [{ data: photosData, error: photosError }, { data: viewsData, error: viewsError }, { data: downloadsData, error: downloadsError }, { data: galleryDownloadsData, error: galleryDownloadsError }] =
    await Promise.all([
      supabase.from('photos').select('id,gallery_id,file_name,created_at,photographer_id,file_path').eq('gallery_id', galleryId),
      supabase.from('gallery_view_events').select('id,gallery_id,viewed_at,ip_address').eq('gallery_id', galleryId),
      supabase.from('photo_download_events').select('id,gallery_id,photo_id,downloaded_at,ip_address').eq('gallery_id', galleryId),
      supabase.from('gallery_download_events').select('id,downloaded_at,photo_count,gallery_share:gallery_shares(gallery_id)').order('downloaded_at', { ascending: false }),
    ]);

  if (photosError) {
    return { data: null, error: { message: photosError.message } };
  }

  if (viewsError) {
    return { data: null, error: { message: viewsError.message } };
  }

  if (downloadsError) {
    return { data: null, error: { message: downloadsError.message } };
  }

  if (galleryDownloadsError) {
    return { data: null, error: { message: galleryDownloadsError.message } };
  }

  const photos = (photosData ?? []) as PhotoRow[];
  const views = (viewsData ?? []) as ViewRow[];
  const downloads = (downloadsData ?? []) as DownloadRow[];
  const galleryDownloads = (galleryDownloadsData ?? []) as GalleryDownloadRow[];
  const galleryDownloadsForGallery = galleryDownloads.filter((download) => download.gallery_share?.gallery_id === galleryId);

  return {
    data: {
      gallery: gallery as Gallery,
      photoCount: photos.length,
      viewCount: views.length,
      downloadCount: downloads.length + galleryDownloadsForGallery.length,
      recentViews: views.slice(0, 10),
      recentDownloads: downloads.slice(0, 10),
    },
    error: null,
  };
}

export async function getRecentActivity(): Promise<ServiceResult<RecentActivityItem[]>> {
  const { userId, error: userError } = await getAuthenticatedUserId();

  if (userError || !userId) {
    return { data: null, error: userError };
  }

  const { data: galleriesData, error: galleriesError } = await supabase
    .from('galleries')
    .select('id,title,description,status,created_at,updated_at,photographer_id')
    .eq('photographer_id', userId);

  if (galleriesError) {
    return { data: null, error: { message: galleriesError.message } };
  }

  const galleries = (galleriesData ?? []) as GalleryRow[];
  const galleryIds = galleries.map((gallery) => gallery.id);

  if (galleryIds.length === 0) {
    return { data: [], error: null };
  }

  const [{ data: photosData, error: photosError }, { data: viewsData, error: viewsError }, { data: downloadsData, error: downloadsError }, { data: galleryDownloadsData, error: galleryDownloadsError }] =
    await Promise.all([
      supabase.from('photos').select('id,gallery_id,file_name,created_at,photographer_id,file_path').eq('photographer_id', userId),
      supabase.from('gallery_view_events').select('id,gallery_id,viewed_at,ip_address').in('gallery_id', galleryIds).order('viewed_at', { ascending: false }).limit(10),
      supabase.from('photo_download_events').select('id,gallery_id,photo_id,downloaded_at,ip_address').in('gallery_id', galleryIds).order('downloaded_at', { ascending: false }).limit(10),
      supabase.from('gallery_download_events').select('id,downloaded_at,photo_count,gallery_share:gallery_shares(gallery_id)').order('downloaded_at', { ascending: false }).limit(10),
    ]);

  if (photosError) {
    return { data: null, error: { message: photosError.message } };
  }

  if (viewsError) {
    return { data: null, error: { message: viewsError.message } };
  }

  if (downloadsError) {
    return { data: null, error: { message: downloadsError.message } };
  }

  if (galleryDownloadsError) {
    return { data: null, error: { message: galleryDownloadsError.message } };
  }

  const recentActivity = mergeRecentActivity(galleries, (photosData ?? []) as PhotoRow[], (viewsData ?? []) as ViewRow[], (downloadsData ?? []) as DownloadRow[]);
  const galleryDownloadActivity = mapGalleryDownloadsToActivity(galleries, (galleryDownloadsData ?? []) as GalleryDownloadRow[]);

  return {
    data: [...recentActivity, ...galleryDownloadActivity]
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
      .slice(0, 10),
    error: null,
  };
}