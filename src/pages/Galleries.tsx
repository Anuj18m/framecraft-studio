import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GalleryForm from '../components/GalleryForm';
import { deleteGallery, createGallery, getGalleries, updateGallery } from '../services/galleryService';
import type { Gallery, UpdateGalleryInput, CreateGalleryInput } from '../types/gallery';

export default function Galleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadGalleries = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await getGalleries();

    if (loadError) {
      setError(loadError.message);
      setGalleries([]);
      setLoading(false);
      return;
    }

    setGalleries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadGalleries();
  }, [loadGalleries]);

  const handleSubmit = async (values: CreateGalleryInput | UpdateGalleryInput) => {
    setSaving(true);
    setError('');
    setMessage('');

    if ('id' in values) {
      const { error: updateError } = await updateGallery(values);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setMessage('Gallery updated.');
      setSelectedGallery(null);
      await loadGalleries();
      setSaving(false);
      return;
    }

    const { error: createError } = await createGallery(values);

    if (createError) {
      setError(createError.message);
      setSaving(false);
      return;
    }

    setMessage('Gallery created.');
    setSelectedGallery(null);
    await loadGalleries();
    setSaving(false);
  };

  const handleDelete = async (galleryId: string) => {
    const confirmed = window.confirm('Delete this gallery?');

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const { error: deleteError } = await deleteGallery(galleryId);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setMessage('Gallery deleted.');
    await loadGalleries();
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Galleries</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <GalleryForm
            gallery={selectedGallery}
            loading={saving}
            onCancel={() => setSelectedGallery(null)}
            onSubmit={handleSubmit}
          />

          {message ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Week 2</p>
              <h2 className="mt-2 text-2xl font-semibold">Gallery List</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGallery(null)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              New Gallery
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-white/60">Loading galleries...</p>
            ) : galleries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60">
                No galleries yet. Create the first one using the form.
              </div>
            ) : (
              galleries.map((gallery) => (
                <article key={gallery.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{gallery.title}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                          {gallery.status}
                        </span>
                      </div>
                      <p className="mt-2 max-w-xl text-sm text-white/65">
                        {gallery.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/galleries/${gallery.id}`}
                        className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20"
                      >
                        View Photos
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedGallery(gallery)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(gallery.id)}
                        className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
