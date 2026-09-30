import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  libraryService,
  type LibraryGame,
  type LibraryStatus
} from '../services/libraryService';

const tabs: {
  label: string;
  value: LibraryStatus;
}[] = [
  { label: 'All', value: 'all' },
  { label: 'Plan to Play', value: 'plan_to_play' },
  { label: 'Playing', value: 'playing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped', value: 'dropped' },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState<LibraryStatus>('all');
const [games, setGames] = useState<LibraryGame[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  let cancelled = false;

  const loadLibrary = async () => {
    try {
      const data = await libraryService.getLibrary(activeTab);

      if (cancelled) return;

      setGames(data);
      setError('');
      setIsLoading(false);
    } catch (error) {
      if (cancelled) return;

      console.error('Gagal mengambil library:', error);
      setGames([]);
      setError('Gagal mengambil data Library.');
      setIsLoading(false);
    }
  };

  loadLibrary();

  return () => {
    cancelled = true;
  };
}, [activeTab]);


  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            My Library
          </h1>
          <p className="text-slate-500 mt-1">
            Koleksi game kamu
          </p>
        </div>

        <Link
          to="/"
          className="text-slate-500 hover:text-blue-600 font-medium"
        >
          ← Kembali
        </Link>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap
                transition-colors
                ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500">
          Memuat Library...
        </div>
      ) : games.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <p className="text-slate-500">
            Belum ada game di bagian ini.
          </p>
        </div>
      ) : (
        /* GAME GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <img
                src={game.cover_url ?? ''}
                alt={game.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-4">
                <h2 className="font-bold text-slate-800 line-clamp-1">
                  {game.name}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {game.release_year ?? 'Unknown'}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {game.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}