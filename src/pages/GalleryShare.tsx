import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createShareLink, disableShareLink, getGalleryShare, regenerateShareLink } from '../services/shareService';
import { getGalleryById } from '../services/galleryService';
import type { Gallery } from '../types/gallery';
import type { GalleryShare as GalleryShareType } from '../types/share';

function buildShareUrl(token: string) {
  return `${window.location.origin}/view/${token}`;
}

export default function GalleryShare() {
  const { galleryId } = useParams();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [share, setShare] = useState<GalleryShareType | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const shareUrl = useMemo(() => (share ? buildShareUrl(share.share_token) : ''), [share]);

  const loadData = useCallback(async () => {
    if (!galleryId) {
      setError('Gallery ID missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [{ data: galleryData, error: galleryError }, { data: shareData, error: shareError }] = await Promise.all([
      getGalleryById(galleryId),
      getGalleryShare(galleryId),
    ]);

    if (galleryError) {
      setError(galleryError.message);
      setGallery(null);
      setShare(null);
      setLoading(false);
      return;
    }

    if (shareError) {
      setError(shareError.message);
    }

    setGallery(galleryData);
    setShare(shareData);
    setLoading(false);
  }, [galleryId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCopyLink = async () => {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setMessage('Share link copied.');
  };

  const handleCreate = async () => {
    if (!galleryId) {
      return;
    }

    setWorking(true);
    setMessage('');
    setError('');

    const { data, error: shareError } = await createShareLink(galleryId);

    if (shareError) {
      setError(shareError.message);
      setWorking(false);
      return;
    }

    setShare(data);
    setMessage('Share link created.');
    setWorking(false);
  };

  const handleDisable = async () => {
    if (!galleryId) {
      return;
    }

    setWorking(true);
    setMessage('');
    setError('');

    const { data, error: shareError } = await disableShareLink(galleryId);

    if (shareError) {
      setError(shareError.message);
      setWorking(false);
      return;
    }

    setShare(data);
    setMessage('Share link disabled.');
    setWorking(false);
  };

  const handleRegenerate = async () => {
    if (!galleryId) {
      return;
    }

    setWorking(true);
    setMessage('');
    setError('');

    const { data, error: shareError } = await regenerateShareLink(galleryId);

    if (shareError) {
      setError(shareError.message);
      setWorking(false);
      return;
    }

    setShare(data);
    setMessage('Share link regenerated.');
    setWorking(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">Loading share settings...</div>
      </main>
    );
  }

  if (!gallery) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-red-200">{error || 'Gallery not found.'}</p>
          <Link
            to="/galleries"
            className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Galleries
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Share Gallery</h1>
          </div>

          <Link
            to={`/galleries/${gallery.id}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Gallery
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Client Delivery</p>
            <h2 className="mt-2 text-3xl font-semibold">{gallery.title}</h2>
            <p className="mt-3 text-sm text-white/70">Create and manage the public delivery link for this gallery.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Share Link</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">
                  {share ? (share.is_active ? 'Active' : 'Disabled') : 'Not created yet'}
                </p>
              </div>

              {share ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  {share.expires_at ? `Expires ${new Date(share.expires_at).toLocaleString()}` : 'No expiry'}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row">
              <input
                readOnly
                value={shareUrl}
                placeholder="Generate a share link to get started"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                disabled={!shareUrl}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy Link
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={working}
                className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {share ? 'Create New Link' : 'Create Share Link'}
              </button>
              <button
                type="button"
                onClick={() => void handleRegenerate()}
                disabled={working || !share}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Regenerate Link
              </button>
              <button
                type="button"
                onClick={() => void handleDisable()}
                disabled={working || !share || !share.is_active}
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Disable Link
              </button>
            </div>
          </div>

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
      </section>
    </main>
  );
}