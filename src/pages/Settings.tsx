import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createProfile, getProfile, updateProfile, uploadLogo } from '../services/profileService';
import type { PhotographerProfile } from '../types/profile';

export default function Settings() {
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await getProfile();

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setProfile(data);
    setBusinessName(data?.business_name ?? '');
    setPrimaryColor(data?.primary_color ?? '#2563eb');
    setLogoUrl(data?.logo_url ?? '');
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const previewLogo = logoPreview || logoUrl;
  const previewName = businessName.trim() || 'FrameCraft Studio';

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    let nextLogoUrl = logoUrl;

    if (logoFile) {
      const { data: uploadedLogoUrl, error: uploadError } = await uploadLogo(logoFile);

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      nextLogoUrl = uploadedLogoUrl ?? '';
    }

    const payload = {
      businessName,
      primaryColor,
      logoUrl: nextLogoUrl,
    };

    const { data, error: saveError } = profile ? await updateProfile(payload) : await createProfile(payload);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setProfile(data);
    setBusinessName(data?.business_name ?? businessName);
    setPrimaryColor(data?.primary_color ?? primaryColor);
    setLogoUrl(data?.logo_url ?? nextLogoUrl);
    setLogoFile(null);
    setMessage('Brand settings saved.');
    setSaving(false);
  };

  const accentStyles = useMemo(
    () => ({
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    }),
    [primaryColor],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">Loading settings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Settings</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Sprint 5</p>
            <h2 className="mt-2 text-3xl font-semibold">Branding & Identity</h2>
            <p className="mt-3 text-sm text-white/70">Set the business identity that appears across your public gallery experience.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="business-name" className="text-sm font-medium text-white/80">
              Business Name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
              placeholder="FrameCraft Studio"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="logo-upload" className="text-sm font-medium text-white/80">
              Logo Upload
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-gray-950"
            />
            <p className="text-xs text-white/50">PNG, JPG, SVG, or WebP works well for the public gallery header.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="brand-color" className="text-sm font-medium text-white/80">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-12 w-16 cursor-pointer rounded-xl border border-white/10 bg-black/20 p-1"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
                placeholder="#2563eb"
              />
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

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
            style={accentStyles}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Live Preview</p>
            <h3 className="mt-2 text-2xl font-semibold">Public gallery identity</h3>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
            <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4" style={{ borderColor: `${primaryColor}33` }}>
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                {previewLogo ? (
                  <img src={previewLogo} alt="Brand logo preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-white">{previewName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Brand Preview</p>
                <h4 className="mt-1 text-xl font-semibold text-white">{previewName}</h4>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">This color will style the public gallery header and primary actions.</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                    {primaryColor}
                  </span>
                  <span className="text-xs text-white/50">Applied live in preview</span>
                </div>
              </div>

              <button type="button" className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white" style={accentStyles}>
                Sample Primary Button
              </button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}