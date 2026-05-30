import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">FrameCraft SaaS</p>
            <h1 className="mt-1 text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/70 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Week 1 Shell</p>
          <h2 className="mt-3 text-3xl font-bold">Protected dashboard access is working.</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            This shell confirms the photographer auth flow for FrameCraft SaaS v2. Week 2 galleries are now behind the protected route.
          </p>

          <div className="mt-6">
            <Link
              to="/galleries"
              className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-amber-400"
            >
              Open Galleries
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
