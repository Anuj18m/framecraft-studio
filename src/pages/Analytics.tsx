import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAnalytics, getRecentActivity, type DashboardAnalytics, type RecentActivityItem } from '../services/analyticsService';

function formatRelativeTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    const [{ data: analyticsData, error: analyticsError }, { data: activityData, error: activityError }] = await Promise.all([
      getDashboardAnalytics(),
      getRecentActivity(),
    ]);

    if (analyticsError) {
      setError(analyticsError.message);
      setAnalytics(null);
      setRecentActivity([]);
      setLoading(false);
      return;
    }

    if (activityError) {
      setError(activityError.message);
    }

    setAnalytics(analyticsData);
    setRecentActivity(activityData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const summaryCards = useMemo(
    () => [
      { label: 'Total Galleries', value: analytics?.totalGalleries ?? 0 },
      { label: 'Total Photos', value: analytics?.totalPhotos ?? 0 },
      { label: 'Total Views', value: analytics?.totalViews ?? 0 },
      { label: 'Total Downloads', value: analytics?.totalDownloads ?? 0 },
    ],
    [analytics],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">Loading analytics...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Analytics</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Sprint 4</p>
          <h2 className="mt-3 text-3xl font-bold">Analytics dashboard</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Track delivery performance across galleries, views, and downloads without changing the existing client delivery flow.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Gallery Metrics</p>
                <h3 className="mt-2 text-2xl font-semibold">Views per gallery</h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {analytics?.galleryMetrics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60">
                  No galleries available yet.
                </div>
              ) : null}

              {analytics?.galleryMetrics.map((item) => (
                <article key={item.gallery.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{item.gallery.title}</h4>
                      <p className="mt-1 text-sm text-white/60">{item.gallery.description || 'No description provided.'}</p>
                    </div>

                    <Link
                      to={`/galleries/${item.gallery.id}/share`}
                      className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
                    >
                      Open Share Page
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">Photos</p>
                      <p className="mt-2 text-2xl font-semibold">{item.photoCount}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">Views</p>
                      <p className="mt-2 text-2xl font-semibold">{item.viewCount}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">Downloads</p>
                      <p className="mt-2 text-2xl font-semibold">{item.downloadCount}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Recent Activity</p>
              <h3 className="mt-2 text-2xl font-semibold">Latest views and downloads</h3>
            </div>

            <div className="mt-6 space-y-3">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-6 text-sm text-white/60">
                  No recent activity yet.
                </div>
              ) : null}

              {recentActivity.map((item) => (
                <article key={`${item.type}-${item.id}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.type === 'view' ? 'Gallery viewed' : 'Photo downloaded'}
                      </p>
                      <p className="mt-1 text-sm text-white/65">{item.galleryTitle}</p>
                      {item.photoName ? <p className="mt-1 text-xs text-white/50">{item.photoName}</p> : null}
                    </div>

                    <span className="text-right text-xs text-white/50">{formatRelativeTime(item.occurredAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}