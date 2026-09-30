import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import type { ExternalGame, Game } from '../types';

// ==========================================
// GAME CARD SKELETON
// ==========================================
const GameCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 animate-pulse">
      <div className="w-full h-48 bg-slate-200" />

      <div className="p-5">
        <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-4" />

        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-slate-200 rounded-md" />
          <div className="h-6 w-20 bg-slate-200 rounded-md" />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GAME CARD
// ==========================================
const GameCard = ({
  game,
  showRating = false
}: {
  game: ExternalGame | Game;
  showRating?: boolean;
}) => {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);

  // Game dari database punya id.
  // ExternalGame dari IGDB tidak punya id database.
  const isDatabaseGame = 'id' in game;

  const handleClick = async () => {
    if (isImporting) return;

    try {
      setIsImporting(true);

      // Kalau game sudah ada di database,
      // langsung buka detail tanpa import ulang.
      if (isDatabaseGame) {
        sessionStorage.setItem(
          `game-${game.id}`,
          JSON.stringify(game)
        );

        navigate(`/game/${game.id}`);
        return;
      }

      // Kalau hasil search IGDB, import dulu.
      const importedGame = await gameService.importGame(game.igdb_id);

      sessionStorage.setItem(
        `game-${importedGame.id}`,
        JSON.stringify(importedGame)
      );

      navigate(`/game/${importedGame.id}`);
    } catch (error) {
      console.error('Gagal membuka game:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isImporting}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-slate-100 flex flex-col cursor-pointer text-left w-full disabled:opacity-70"
    >
      {game.cover_url ? (
        <img
          src={game.cover_url}
          alt={game.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
          Tidak ada cover
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1">
          {game.name}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {(game.genres ?? []).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Baris rating: game database tampil rating, game IGDB (belum diimport) tampil "Belum ada review" */}
        {showRating && (
          <div className="mb-4 flex items-center gap-2">
            {isDatabaseGame ? (
              <>
                <span className="text-amber-500 text-lg">★</span>

                <span className="font-bold text-slate-800">
                  {Number(game.avgOverall ?? 0).toFixed(1)}
                </span>

                <span className="text-sm text-slate-400">
                  ({game.totalReviews ?? 0} review)
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-300 text-lg">★</span>

                <span className="text-sm text-slate-400">
                  Belum ada review
                </span>
              </>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50 text-sm text-slate-500 flex justify-between items-center">
          <span className="font-medium">
            {(game.platforms ?? []).join(', ')}
          </span>

          <span>
            {game.release_year ?? 'Unknown'}
          </span>
        </div>
      </div>
    </button>
  );
};

// ==========================================
// GAME LIST
// ==========================================
export default function GameList() {
  // ==========================================
  // TOP RATED GAMES
  // ==========================================
  const [overallGames, setOverallGames] = useState<Game[]>([]);
  const [gameplayGames, setGameplayGames] = useState<Game[]>([]);
  const [storyGames, setStoryGames] = useState<Game[]>([]);
  const [visualGames, setVisualGames] = useState<Game[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // SEARCH
  // ==========================================
  // Teks yang sedang diketik di input
  const [searchInput, setSearchInput] = useState('');
  // Kata kunci yang benar-benar sudah dicari
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mencegah hasil request lama menimpa hasil request terbaru
  const requestIdRef = useRef(0);
  // Mencegah pencarian dobel (Enter + debounce)
  const lastQueryRef = useRef('');

  const runSearch = async (rawQuery: string) => {
    const query = rawQuery.trim();
    const requestId = ++requestIdRef.current;
    lastQueryRef.current = query;

    // Input kosong: kembali ke halaman utama
    if (!query) {
      setActiveQuery('');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setActiveQuery(query);
    setIsSearching(true);

    try {
      const results = await gameService.searchGames(query);

      // Abaikan hasil kalau sudah ada request yang lebih baru
      if (requestId !== requestIdRef.current) return;

      setSearchResults(results);
    } catch (error) {
      console.error('Gagal mencari game:', error);

      if (requestId !== requestIdRef.current) return;

      setSearchResults([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  // Auto search setelah berhenti mengetik selama 500ms
  useEffect(() => {
    const query = searchInput.trim();

    if (!query || query === lastQueryRef.current) return;

    const timer = setTimeout(() => {
      runSearch(query);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    // Kalau input dikosongkan, langsung kembali ke halaman utama
    if (value.trim() === '') {
      runSearch('');
    }
  };

  // Enter = cari langsung tanpa menunggu debounce
  const handleExternalSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      runSearch(searchInput);
    }
  };

  const isSearchMode = activeQuery.length > 0;
  const showSkeleton = isLoading || isSearching;

  // ==========================================
  // AMBIL TOP RATED
  // ==========================================
  useEffect(() => {
    const fetchTopRatedGames = async () => {
      try {
        const [
          overall,
          gameplay,
          story,
          visual
        ] = await Promise.all([
          gameService.getTopRatedGames('overall'),
          gameService.getTopRatedGames('gameplay'),
          gameService.getTopRatedGames('story'),
          gameService.getTopRatedGames('visual')
        ]);

        setOverallGames(overall);
        setGameplayGames(gameplay);
        setStoryGames(story);
        setVisualGames(visual);
      } catch (error) {
        console.error(
          'Gagal mengambil rating terbaik:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRatedGames();
  }, []);

  // ==========================================
  // RENDER TOP RATED SECTION
  // ==========================================
  const renderRatingSection = (
    title: string,
    games: Game[]
  ) => {
    if (games.length === 0) {
      return null;
    }

    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              showRating={true}
            />
          ))}
        </div>
      </section>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto">

      {/* ==========================================
          HEADER
          ========================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">
          My Game Journal
        </h1>

        <div className="flex gap-3">
          <Link
            to="/stats"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-5 rounded-xl border border-slate-200 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>📊 Statistik</span>
          </Link>
        </div>
      </div>

      {/* ==========================================
          SEARCH
          ========================================== */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari game..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleExternalSearchKeyDown}
            className="flex-1 border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => runSearch(searchInput)}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {isSearching ? 'Mencari...' : 'Cari Game'}
          </button>
        </div>
      </div>

      {/* ==========================================
          CONTENT
          ========================================== */}
      {showSkeleton ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      ) : isSearchMode ? (

        /* ==========================================
           SEARCH RESULT
           ========================================== */
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Hasil Pencarian: "{activeQuery}"
          </h2>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((game) => (
                <GameCard
                  key={game.igdb_id}
                  game={game}
                  showRating={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500 border-dashed border-2">
              Tidak ada game dengan judul "{activeQuery}"
            </div>
          )}
        </section>

      ) : (

        /* ==========================================
           HOME RATING SECTIONS
           ========================================== */
        <>
          {renderRatingSection(
            '🏆 Overall Terbaik',
            overallGames
          )}

          {renderRatingSection(
            '🎮 Gameplay Terbaik',
            gameplayGames
          )}

          {renderRatingSection(
            '📖 Story Terbaik',
            storyGames
          )}

          {renderRatingSection(
            '🎨 Visual Terbaik',
            visualGames
          )}

          {!overallGames.length &&
            !gameplayGames.length &&
            !storyGames.length &&
            !visualGames.length && (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500 border-dashed border-2">
                Belum ada game yang memiliki review.
              </div>
            )}
        </>
      )}
    </div>
  );
}