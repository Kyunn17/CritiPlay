import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { reviewService } from '../services/reviewService';
import type { Game, Review } from '../types';

export default function Statistics() {
  const [games, setGames] = useState<Game[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const fetchedGames = await gameService.getAllGames();
        setGames(fetchedGames);

        // Ambil review dari backend untuk setiap game
        const reviewResults = await Promise.all(
          fetchedGames.map((game) =>
            reviewService.getReviewsByGameId(game.id)
          )
        );

        const allReviews = reviewResults.flat();
        setReviews(allReviews);
      } catch (error) {
        console.error('Gagal memuat data statistik', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Kalkulasi Statistik
  const totalGames = games.length;
  const totalReviews = reviews.length;

  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.ratingOverall,
            0
          ) / totalReviews
        ).toFixed(1)
      : '0.0';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500 animate-pulse">
          Menghitung statistik...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="text-slate-500 hover:text-blue-600 hover:underline mb-6 inline-block font-medium"
      >
        &larr; Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Statistik Jurnal Kamu
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Game */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Total Game Tersimpan
          </span>

          <span className="text-5xl font-extrabold text-blue-600">
            {totalGames}
          </span>
        </div>

        {/* Card 2: Total Jurnal */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Total Jurnal Ditulis
          </span>

          <span className="text-5xl font-extrabold text-indigo-600">
            {totalReviews}
          </span>
        </div>

        {/* Card 3: Rata-rata Rating */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Rata-rata Rating
          </span>

          <span className="text-5xl font-extrabold text-amber-500">
            {avgRating}
          </span>
        </div>
      </div>

      {/* Rating Breakdown */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Rata-rata Rating
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-700 mb-1">
            {totalReviews > 0
              ? (
                  reviews.reduce(
                    (sum, review) => sum + review.ratingGameplay,
                    0
                  ) / totalReviews
                ).toFixed(1)
              : '0.0'}
          </span>

          <span className="text-blue-600 text-sm font-semibold">
            Gameplay
          </span>
        </div>

        <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-700 mb-1">
            {totalReviews > 0
              ? (
                  reviews.reduce(
                    (sum, review) => sum + review.ratingStory,
                    0
                  ) / totalReviews
                ).toFixed(1)
              : '0.0'}
          </span>

          <span className="text-purple-600 text-sm font-semibold">
            Story
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col items-center">
          <span className="text-3xl font-bold text-amber-700 mb-1">
            {totalReviews > 0
              ? (
                  reviews.reduce(
                    (sum, review) => sum + review.ratingVisual,
                    0
                  ) / totalReviews
                ).toFixed(1)
              : '0.0'}
          </span>

          <span className="text-amber-600 text-sm font-semibold">
            Visual
          </span>
        </div>
      </div>
    </div>
  );
}