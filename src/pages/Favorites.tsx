import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGalleries } from '../services/galleryService';
import { getFavoritesForGallery, summarizeFavorites } from '../services/favoritesService';
import { supabase } from '../services/supabase';
import type { Gallery } from '../types/gallery';
import type { FavoritePhotoRecord, FavoriteSummary } from '../types/favorite';

export default function Favorites() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [favorites, setFavorites] = useState<FavoritePhotoRecord[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [{ data: galleriesData, error: galleriesError }, { data: favoritesData, error: favoritesError }] = await Promise.all([
      getGalleries(),
      getFavoritesForGallery(),
    ]);

    if (galleriesError) {
      setError(galleriesError.message);
      setLoading(false);
      return;
    }

    if (favoritesError) {
      setError(favoritesError.message);
      setGalleries(galleriesData ?? []);
      setFavorites([]);
      setLoading(false);
      return;
    }

    setGalleries(galleriesData ?? []);
    setFavorites(favoritesData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const galleriesById = useMemo(() => new Map(galleries.map((gallery) => [gallery.id, gallery] as const)), [galleries]);

  const filteredFavorites = useMemo(
    () => (selectedGalleryId === 'all' ? favorites : favorites.filter((item) => item.gallery?.id === selectedGalleryId)),
    [favorites, selectedGalleryId],
  );

  const summaries = useMemo(() => summarizeFavorites(filteredFavorites), [filteredFavorites]);
  const totalFavorites = filteredFavorites.length;
  const mostSelectedPhotos: FavoriteSummary[] = summaries.slice(0, 5);

  const getPublicPhotoUrl = (filePath?: string | null) => {
    if (!filePath) {
      return '';
    }

    return supabase.storage.from('gallery-images').getPublicUrl(filePath).data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">Loading favorites...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Client Favorites</h1>
          </div>

          <Link
            to="/dashboard"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Sprint 6</p>
          <h2 className="mt-3 text-3xl font-bold">Favorites overview</h2>
          <p className="mt-4 max-w-3xl text-white/70">
            Review the photos clients have marked from the public gallery and filter the selections by gallery.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Total Favorites</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalFavorites}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Selected Photos</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summaries.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Most Selected</p>
              <p className="mt-3 text-3xl font-semibold text-white">{mostSelectedPhotos[0]?.count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Galleries</p>
              <p className="mt-3 text-3xl font-semibold text-white">{galleries.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Filters</p>
                <h3 className="mt-2 text-2xl font-semibold">Filter by gallery</h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label htmlFor="gallery-filter" className="text-sm font-medium text-white/80">
                Gallery
              </label>
              <select
                id="gallery-filter"
                value={selectedGalleryId}
                onChange={(event) => setSelectedGalleryId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
              >
                <option value="all">All Galleries</option>
                {galleries.map((gallery) => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.title}
                  </option>
                ))}
              </select>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Gallery Count</p>
                <p className="mt-2 text-sm text-white/60">
                  {selectedGalleryId === 'all'
                    ? 'Showing all selections across every gallery.'
                    : `Showing selections for ${galleriesById.get(selectedGalleryId)?.title ?? 'this gallery'}.`}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Most Selected Photos</p>
                <h3 className="mt-2 text-2xl font-semibold">Client selections</h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {mostSelectedPhotos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60">
                  No favorites yet.
                </div>
              ) : null}

              {mostSelectedPhotos.map((item) => (
                <article key={item.photoId} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="break-words text-lg font-semibold text-white">{item.photo?.file_name ?? 'Selected photo'}</h4>
                      <p className="mt-1 break-words text-sm text-white/60">{item.gallery?.title ?? 'Unknown gallery'}</p>
                    </div>

                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-100">
                      {item.count} favorites
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {item.photo ? (
                        <img src={getPublicPhotoUrl(item.photo.file_path)} alt={item.photo.file_name} className="h-48 w-full object-cover" />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-white/50">No photo preview available.</div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">Selection Details</p>
                      <div className="mt-3 space-y-2 break-words text-sm text-white/70">
                        <p>Photo ID: {item.photoId}</p>
                        <p>Most recent selection: {new Date(item.mostRecentAt).toLocaleString()}</p>
                        <p>Gallery: {item.gallery?.title ?? 'Unknown gallery'}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}