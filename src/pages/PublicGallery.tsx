import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { recordGalleryView, recordPhotoDownload, resolveGalleryByToken } from '../services/shareService';
import type { ResolvedGallery } from '../types/share';

export default function PublicGallery() {
  const { token } = useParams();
  const hasTrackedView = useRef(false);
  const [resolved, setResolved] = useState<ResolvedGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState('');

  const loadGallery = useCallback(async () => {
    if (!token) {
      setError('Share token missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: resolveError } = await resolveGalleryByToken(token);

    if (resolveError || !data) {
      setError(resolveError?.message ?? 'Unable to load this gallery.');
      setResolved(null);
      setLoading(false);
      return;
    }

    setResolved(data);
    setLoading(false);

    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      void recordGalleryView(data.gallery.id);
    }
  }, [token]);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const handleDownload = async (photoId: string, publicUrl: string, fileName: string) => {
    if (!resolved) {
      return;
    }

    setDownloadingId(photoId);

    const { error: downloadError } = await recordPhotoDownload(photoId, resolved.gallery.id);

    if (downloadError) {
      setError(downloadError.message);
      setDownloadingId('');
      return;
    }

    try {
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.rel = 'noreferrer';
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    }

    setDownloadingId('');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">Loading gallery...</div>
      </main>
    );
  }

  if (!resolved) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-red-200">{error || 'Gallery not found.'}</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft Delivery</p>
          <h1 className="mt-2 text-3xl font-semibold">{resolved.gallery.title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/70">{resolved.gallery.description || 'Private client gallery.'}</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-white/60">{resolved.photos.length} photos ready for download</p>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
            Client View
          </span>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resolved.photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60 sm:col-span-2 xl:col-span-3">
              No photos are available in this gallery yet.
            </div>
          ) : null}

          {resolved.photos.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg">
              <img src={photo.publicUrl} alt={photo.file_name} className="h-64 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">{photo.file_name}</h2>
                  <p className="mt-1 text-xs text-white/55">Uploaded {new Date(photo.created_at).toLocaleString()}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDownload(photo.id, photo.publicUrl, photo.file_name)}
                  disabled={downloadingId === photo.id}
                  className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {downloadingId === photo.id ? 'Preparing Download...' : 'Download Photo'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}