import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { userService } from '../services/userService';
import type { PublicProfile } from '../types';

const statusLabel = {
  completed: 'Completed',
  playing: 'Playing',
  plan_to_play: 'Plan to Play',
  dropped: 'Dropped',
};

const statusColor = {
  completed: 'bg-green-50 text-green-700',
  playing: 'bg-blue-50 text-blue-700',
  plan_to_play: 'bg-yellow-50 text-yellow-700',
  dropped: 'bg-red-50 text-red-700',
};

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('Profile tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await userService.getPublicProfile(userId);

        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Gagal mengambil data profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-slate-500 animate-pulse font-medium">
          Memuat profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <p className="text-red-500 font-semibold mb-5">
            {error || 'Profile tidak ditemukan.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, recent_activity } = profile;

  const library = stats.library;
  const total = library.total_games;

  const completedPercent =
    total > 0 ? (library.completed / total) * 100 : 0;

  const playingPercent =
    total > 0 ? (library.playing / total) * 100 : 0;

  const planPercent =
    total > 0 ? (library.plan_to_play / total) * 100 : 0;

  const droppedPercent =
    total > 0 ? (library.dropped / total) * 100 : 0;

  const completedEnd = completedPercent;
  const playingEnd = completedEnd + playingPercent;
  const planEnd = playingEnd + planPercent;
  const droppedEnd = planEnd + droppedPercent;

  const donutBackground =
    total > 0
      ? `conic-gradient(
          #22c55e 0% ${completedEnd}%,
          #3b82f6 ${completedEnd}% ${playingEnd}%,
          #eab308 ${playingEnd}% ${planEnd}%,
          #ef4444 ${planEnd}% ${droppedEnd}%
        )`
      : '#e2e8f0';

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ================= PROFILE HEADER ================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-center gap-5">

            {/* AVATAR */}
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md flex items-center justify-center shrink-0">

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}

            </div>

            {/* USER INFO */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {user.name}
              </h1>

              <p className="text-sm text-slate-400 mt-2">
                Bergabung sejak {user.joined_at}
              </p>
            </div>

          </div>

          {/* TOTAL GAMES */}
          <div className="bg-blue-50 text-blue-700 rounded-2xl px-5 py-4 text-center">
            <p className="text-2xl font-extrabold">
              {library.total_games}
            </p>

            <p className="text-sm font-semibold">
              Games in Library
            </p>
          </div>

        </div>
      </section>


      {/* ================= LIBRARY + REVIEWS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LIBRARY SUMMARY */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

          <h2 className="text-2xl font-bold text-slate-800 mb-8">
            Library Summary
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* DONUT */}
            <div
              className="w-52 h-52 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: donutBackground
              }}
            >
              <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">

                <span className="text-3xl font-extrabold text-slate-800">
                  {total}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  TOTAL
                </span>

              </div>
            </div>


            {/* LEGEND */}
            <div className="w-full space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-slate-600">
                    Completed
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {library.completed}
                </span>
              </div>


              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-600">
                    Playing
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {library.playing}
                </span>
              </div>


              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-medium text-slate-600">
                    Plan to Play
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {library.plan_to_play}
                </span>
              </div>


              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium text-slate-600">
                    Dropped
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {library.dropped}
                </span>
              </div>

            </div>
          </div>
        </div>


        {/* REVIEW STATS */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

          <h2 className="text-2xl font-bold text-slate-800 mb-8">
            Review Stats
          </h2>

          <div className="flex flex-col items-center justify-center h-52">

            <p className="text-4xl font-extrabold text-slate-800">
              {stats.total_reviews}
            </p>

            <p className="text-slate-500 font-medium">
              Total Reviews
            </p>

          </div>
        </div>

      </section>


      {/* ================= RECENT ACTIVITY ================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            Recent Activity
          </h2>

          <span className="text-sm text-slate-400">
            Last 5 updates
          </span>

        </div>


        {recent_activity.length === 0 ? (

          <div className="py-10 text-center text-slate-500">
            Belum ada aktivitas Library.
          </div>

        ) : (

          <div className="space-y-4">

            {recent_activity.map((game) => {

              const status =
                game.pivot?.status ?? 'plan_to_play';

              return (
                <div
                  key={game.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                >

                  {/* COVER */}
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">

                    {game.cover_url ? (
                      <img
                        src={game.cover_url}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        No Image
                      </div>
                    )}

                  </div>


                  {/* INFO */}
                  <div className="flex-1 min-w-0">

                    <h3 className="font-bold text-slate-800 truncate">
                      {game.name}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      {game.release_year ?? 'Unknown'}
                    </p>

                  </div>


                  {/* STATUS */}
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                      statusColor[status]
                    }`}
                  >
                    {statusLabel[status]}
                  </span>

                </div>
              );
            })}

          </div>

        )}

      </section>


      {/* ================= BACK BUTTON ================= */}
      <div className="pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
        >
          ← Kembali
        </button>
      </div>

    </div>
  );
}