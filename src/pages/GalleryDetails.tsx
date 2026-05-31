import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGalleryById } from '../services/galleryService';
import { deletePhoto, getPhotos, uploadPhoto } from '../services/photoService';
import type { Gallery } from '../types/gallery';
import type { PhotoWithUrl } from '../types/photo';

export default function GalleryDetails() {
  const navigate = useNavigate();
  const { galleryId } = useParams();
  const { loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadGallery = useCallback(async () => {
    if (!galleryId) {
      setError('Gallery ID missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [{ data: galleryData, error: galleryError }, { data: photosData, error: photosError }] = await Promise.all([
      getGalleryById(galleryId),
      getPhotos(galleryId),
    ]);

    if (galleryError) {
      setError(galleryError.message);
      setLoading(false);
      return;
    }

    if (photosError) {
      setError(photosError.message);
    }

    setGallery(galleryData);
    setPhotos(photosData ?? []);
    setLoading(false);
  }, [galleryId]);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const selectedFileSummary = useMemo(() => selectedFiles.map((file) => file.name), [selectedFiles]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authLoading) {
      setError('Please wait for authentication to finish loading.');
      return;
    }

    if (!galleryId || selectedFiles.length === 0) {
      setError('Choose at least one image to upload.');
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    const { error: uploadError } = await uploadPhoto(galleryId, selectedFiles);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setMessage('Photos uploaded.');
    await loadGallery();
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId: string, filePath: string) => {
    setDeletingId(photoId);
    setMessage('');
    setError('');

    const confirmed = window.confirm('Delete this photo?');

    if (!confirmed) {
      setDeletingId('');
      return;
    }

    const { error: deleteError } = await deletePhoto(photoId, filePath);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId('');
      return;
    }

    setMessage('Photo deleted.');
    await loadGallery();
    setDeletingId('');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">Loading gallery...</div>
      </main>
    );
  }

  if (!gallery) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-red-200">{error || 'Gallery not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/galleries')}
            className="mt-4 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-gray-950"
          >
            Back to Galleries
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Gallery Details</h1>
          </div>

          <Link
            to="/galleries"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Galleries
          </Link>

          <Link
            to={`/galleries/${galleryId}/share`}
            className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            Share Gallery
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Gallery</p>
            <h2 className="mt-2 text-3xl font-semibold">{gallery.title}</h2>
            <p className="mt-3 text-sm text-white/70">{gallery.description || 'No description provided.'}</p>
            <span className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              {gallery.status}
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Sprint 2</p>
              <h3 className="mt-2 text-2xl font-semibold">Upload Photos</h3>
            </div>

            <div className="space-y-2">
              <label htmlFor="gallery-photos" className="text-sm font-medium text-white/80">
                Select Images
              </label>
              <input
                ref={fileInputRef}
                id="gallery-photos"
                type="file"
                accept="image/*"
                multiple
                disabled={authLoading || uploading}
                onChange={handleFileChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-semibold file:text-gray-950"
              />
            </div>

            {selectedFileSummary.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <p className="mb-2 font-semibold text-white">Selected files</p>
                <ul className="space-y-1">
                  {selectedFileSummary.map((fileName) => (
                    <li key={fileName}>{fileName}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={authLoading || uploading}
              className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authLoading ? 'Loading Auth...' : uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </form>

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
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Sprint 2</p>
              <h3 className="mt-2 text-2xl font-semibold">Photo Grid</h3>
            </div>
            <span className="text-sm text-white/60">{photos.length} photos</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60 sm:col-span-2 xl:col-span-3">
                No photos yet. Upload the first image to this gallery.
              </div>
            ) : null}

            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg">
                <img src={photo.signedUrl} alt={photo.file_name} className="h-56 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{photo.file_name}</h4>
                    <p className="mt-1 text-xs text-white/55">Uploaded {new Date(photo.created_at).toLocaleString()}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDeletePhoto(photo.id, photo.file_path)}
                    disabled={deletingId === photo.id}
                    className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingId === photo.id ? 'Deleting...' : 'Delete Photo'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
