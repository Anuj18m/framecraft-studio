import { useEffect, useState, type FormEvent } from 'react';
import type { CreateGalleryInput, Gallery, GalleryStatus, UpdateGalleryInput } from '../types/gallery';

interface GalleryFormValues {
  title: string;
  description: string;
  status: GalleryStatus;
}

interface GalleryFormProps {
  gallery?: Gallery | null;
  loading?: boolean;
  onCancel?: () => void;
  onSubmit: (values: CreateGalleryInput | UpdateGalleryInput) => Promise<void> | void;
}

const initialValues: GalleryFormValues = {
  title: '',
  description: '',
  status: 'draft',
};

export default function GalleryForm({ gallery, loading = false, onCancel, onSubmit }: GalleryFormProps) {
  const [values, setValues] = useState<GalleryFormValues>(initialValues);

  useEffect(() => {
    if (gallery) {
      setValues({
        title: gallery.title,
        description: gallery.description ?? '',
        status: gallery.status,
      });
      return;
    }

    setValues(initialValues);
  }, [gallery]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (gallery) {
      await onSubmit({
        id: gallery.id,
        title: values.title,
        description: values.description,
        status: values.status,
      });
      return;
    }

    await onSubmit({
      title: values.title,
      description: values.description,
      status: values.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Week 2</p>
        <h2 className="mt-2 text-2xl font-semibold">{gallery ? 'Edit Gallery' : 'Create Gallery'}</h2>
      </div>

      <div className="space-y-2">
        <label htmlFor="gallery-title" className="text-sm font-medium text-white/80">
          Title
        </label>
        <input
          id="gallery-title"
          type="text"
          required
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          placeholder="Summer Portraits"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="gallery-description" className="text-sm font-medium text-white/80">
          Description
        </label>
        <textarea
          id="gallery-description"
          rows={4}
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          placeholder="Optional notes for the gallery"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="gallery-status" className="text-sm font-medium text-white/80">
          Status
        </label>
        <select
          id="gallery-status"
          value={values.status}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as GalleryStatus,
            }))
          }
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading ? 'Saving...' : gallery ? 'Update Gallery' : 'Create Gallery'}
        </button>

        {gallery && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10 sm:w-auto"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
