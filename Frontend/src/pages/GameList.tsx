import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameService } from '../services/gameService';
import type { Game } from '../types';

// ==========================================
// GAME CARD SKELETON
// ==========================================
const GameCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 animate-pulse">
      {/* Cover */}
      <div className="w-full h-48 bg-slate-200" />

      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-4" />

        {/* Genre */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-slate-200 rounded-md" />
          <div className="h-6 w-20 bg-slate-200 rounded-md" />
        </div>

        {/* Developer + Year */}
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
const GameCard = ({ game }: { game: Game }) => {
  return (
    <Link
      to={`/game/${game.id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-slate-100 flex flex-col cursor-pointer"
    >
      <img
        src={game.coverImage}
        alt={game.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1">
          {game.title}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {game.genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 text-sm text-slate-500 flex justify-between items-center">
          <span className="font-medium">
            {game.developer}
          </span>

          <span>
            {new Date(game.releaseDate).getFullYear()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function GameList() {
  // ==========================================
  // STATE LIBRARY (DATA DEFAULT / HOME)
  // ==========================================
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ==========================================
  // STATE V4 SEARCH
  // ==========================================
  const [externalSearchQuery, setExternalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

// ==========================================
  // AMBIL DATA & ACAK UNTUK TAMPILAN HOME
  // (Menggunakan trik search random keyword)
  // ==========================================
  useEffect(() => {
    const fetchDefaultGames = async () => {
      try {
        // 1. Siapin daftar kata kunci game populer
        const trendingKeywords = ['mario', 'final fantasy', 'resident evil', 'zelda', 'gta', 'pokemon', 'persona', 'dragon quest'];
        
        // 2. Pilih satu kata kunci secara acak
        const randomKeyword = trendingKeywords[Math.floor(Math.random() * trendingKeywords.length)];
        
        // 3. Pura-pura nge-search pakai keyword itu ke IGDB lewat backend lu
        const data = await gameService.searchGames(randomKeyword);
        
        // 4. Pastiin formatnya array, lalu acak urutannya
        if (Array.isArray(data)) {
          const shuffledGames = [...data].sort(() => 0.5 - Math.random());
          setGames(shuffledGames.slice(0, 6)); // Ambil 6 game buat di beranda
        } else {
          setGames([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data default:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultGames();
  }, []);
    
  // ==========================================
  // V4 SEARCH GAME
  // ==========================================
  const handleExternalSearch = async () => {
    const query = externalSearchQuery.trim();

    if (!query) {
      setSearchResults([]); // Kosongkan hasil search kalau input dihapus
      return;
    }

    setIsSearching(true);

    try {
      const results = await gameService.searchGames(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Gagal mencari game:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // ==========================================
  // ENTER UNTUK SEARCH
  // ==========================================
  const handleExternalSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleExternalSearch();
    }
  };

  // Kalau lagi search pakai data pencarian, kalau kosong pakai data random (Home)
  const displayGames = externalSearchQuery && searchResults.length > 0 
    ? searchResults 
    : games;
    
  const showSkeleton = isLoading || isSearching;
  
  // Tentukan judul section dinamis berdasarkan kondisi
  const sectionTitle = (externalSearchQuery && searchResults.length > 0) 
    ? `Hasil Pencarian: "${externalSearchQuery}"` 
    : "🎮 Rekomendasi Game Hari Ini";

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
          V4 SEARCH GAME
          ========================================== */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari game dari database..."
            value={externalSearchQuery}
            onChange={(e) => {
              setExternalSearchQuery(e.target.value);
              if (e.target.value === '') setSearchResults([]); 
            }}
            onKeyDown={handleExternalSearchKeyDown}
            className="flex-1 border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={handleExternalSearch}
            disabled={isSearching || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {isSearching ? 'Mencari...' : 'Cari Game'}
          </button>
        </div>
      </div>

      {/* ==========================================
          V4 GAME CARDS 
          ========================================== */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {sectionTitle}
        </h2>

        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : displayGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500 border-dashed border-2">
            {externalSearchQuery 
              ? `Tidak ada game dengan judul "${externalSearchQuery}"` 
              : "Belum ada data game di database."}
          </div>
        )}
      </div>

    </div>
  );
}