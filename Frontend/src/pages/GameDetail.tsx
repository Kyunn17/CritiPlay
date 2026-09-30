
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { reviewService } from '../services/reviewService';
import type { Game, Review, RatingAspect } from '../types';
import ReviewCard from '../components/ReviewCard';
import ReviewFormModal from '../components/ReviewFormModal';
import { libraryService } from '../services/libraryService';
import type { LibraryStatus } from '../services/libraryService';
import { authService } from '../services/authService';

export default function GameDetail() {
  const { id } = useParams();

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const [libraryStatus, setLibraryStatus] =
    useState<LibraryStatus | null>(null);

  const [isUpdatingLibrary, setIsUpdatingLibrary] =
    useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] =
    useState<boolean>(false);

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetail = async () => {
      if (!id) return;

      try {
        const savedGame = sessionStorage.getItem(`game-${id}`);

        if (savedGame) {
          const parsedGame: Game = JSON.parse(savedGame);
          setGame(parsedGame);
        } else {
          const data = await gameService.getGameById(id);

          if (!data) {
            setIsError(true);
            return;
          }

          setGame(data);
        }

        const reviewData =
          await reviewService.getReviewsByGameId(id);

        setReviews(reviewData);

        const profile = await authService.getProfile();

        if (profile?.user?.id) {
          setCurrentUserId(String(profile.user.id));
        }
      } catch (error) {
        console.error(
          'Gagal mengambil detail game:',
          error
        );

        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetail();
  }, [id]);

  const handleLibraryStatus = async (
    status: Exclude<LibraryStatus, 'all'>
  ) => {
    if (!game || isUpdatingLibrary) return;

    try {
      setIsUpdatingLibrary(true);

      await libraryService.updateStatus(game.id, status);

      setLibraryStatus(status);
    } catch (error) {
      console.error(
        'Gagal mengubah status Library:',
        error
      );
    } finally {
      setIsUpdatingLibrary(false);
    }
  };

  const handleOpenReview = () => {
    const myReview = reviews.find(
      (review) =>
        String(review.userId) === String(currentUserId)
    );

    setEditingReview(myReview ?? null);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (
  aspects: RatingAspect[],
  content: string
) => {
    if (!game) return;

    const gameplay = aspects.find(
      (aspect) =>
        aspect.aspect.toLowerCase() === 'gameplay'
    )?.score;

    const story = aspects.find(
      (aspect) =>
        aspect.aspect.toLowerCase() === 'story'
    )?.score;

    const visual = aspects.find(
      (aspect) =>
        aspect.aspect.toLowerCase() === 'visual'
    )?.score;

    if (
      gameplay === undefined ||
      story === undefined ||
      visual === undefined
    ) {
      console.error(
        'Rating Gameplay, Story, atau Visual belum lengkap.'
      );
      return;
    }

    try {
      if (editingReview) {
        await reviewService.updateReview(
          editingReview.id,
          gameplay,
          story,
          visual,
          content
        );
      } else {
        await reviewService.saveReview(
          game.id,
          gameplay,
          story,
          visual,
          content
        );
      }

      const updatedReviews =
        await reviewService.getReviewsByGameId(
          game.id
        );

      setReviews(updatedReviews);

      const updatedGame =
        await gameService.getGameById(game.id);

      if (updatedGame) {
        setGame(updatedGame);

        sessionStorage.setItem(
          `game-${game.id}`,
          JSON.stringify(updatedGame)
        );
      }

      setIsReviewModalOpen(false);
      setEditingReview(null);
    } catch (error) {
      console.error(
        'Gagal menyimpan review:',
        error
      );
    }
  };

  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setEditingReview(null);
  };

  const handleDeleteReview = async (
    reviewId: string
  ) => {
    if (
      window.confirm(
        'Yakin ingin menghapus jurnal ini?'
      )
    ) {
      const success =
        await reviewService.deleteReview(reviewId);

      if (success) {
        setReviews(
          reviews.filter(
            (review) => review.id !== reviewId
          )
        );

        if (game) {
          const updatedGame =
            await gameService.getGameById(game.id);

          if (updatedGame) {
            setGame(updatedGame);

            sessionStorage.setItem(
              `game-${game.id}`,
              JSON.stringify(updatedGame)
            );
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
        <p className="text-slate-500 animate-pulse font-medium">
          Memuat detail game...
        </p>
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm text-center">
        Game Tidak Ditemukan
      </div>
    );
  }

  const hasMyReview = reviews.some(
    (review) =>
      String(review.userId) === String(currentUserId)
  );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/"
          className="text-slate-500 hover:text-blue-600 hover:underline font-medium"
        >
          &larr; Kembali
        </Link>
      </div>

      {/* GAME HEADER */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row mb-8">
        <div className="md:w-1/3 bg-slate-50 p-6 flex justify-center items-start">
          <img
            src={game.cover_url ?? ''}
            alt={game.name}
            className="w-full max-w-sm rounded-xl shadow-md object-cover aspect-[3/4]"
          />
        </div>

        <div className="md:w-2/3 p-8 md:p-10 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            {game.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                {genre}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            {game.name}
          </h1>

          <p className="text-lg text-slate-500 font-medium mb-6">
            {game.platforms.join(', ')} &bull;{' '}
            {game.release_year ?? 'Unknown'}
          </p>

          {/* RATING */}
          <div className="mb-8">
            <div className="flex items-end gap-3 mb-5">
              <div className="text-5xl font-black text-blue-600">
                {Number(game.avgOverall ?? 0).toFixed(1)}
              </div>

              <div className="pb-1">
                <div className="text-yellow-500 text-xl">
                  ★★★★★
                </div>

                <p className="text-sm text-slate-500">
                  Overall Rating
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Overall
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Number(game.avgOverall ?? 0).toFixed(1)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Gameplay
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Number(game.avgGameplay ?? 0).toFixed(1)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Story
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Number(game.avgStory ?? 0).toFixed(1)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Visual
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Number(game.avgVisual ?? 0).toFixed(1)}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mt-3">
              Berdasarkan {game.totalReviews ?? 0} review pengguna
            </p>
          </div>

          {/* LIBRARY */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-500 mb-3">
              Status Library
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() =>
                  handleLibraryStatus('plan_to_play')
                }
                disabled={isUpdatingLibrary}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  libraryStatus === 'plan_to_play'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Plan to Play
              </button>

              <button
                onClick={() =>
                  handleLibraryStatus('playing')
                }
                disabled={isUpdatingLibrary}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  libraryStatus === 'playing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Playing
              </button>

              <button
                onClick={() =>
                  handleLibraryStatus('completed')
                }
                disabled={isUpdatingLibrary}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  libraryStatus === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Completed
              </button>

              <button
                onClick={() =>
                  handleLibraryStatus('dropped')
                }
                disabled={isUpdatingLibrary}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  libraryStatus === 'dropped'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Dropped
              </button>
            </div>

            <button
              onClick={handleOpenReview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              {hasMyReview
                ? 'Edit Jurnal'
                : '+ Tulis Jurnal'}
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">
            Review Pengguna
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {reviews.length} review dari pengguna CritiPlay
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500 border-dashed border-2">
          Belum ada review.
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={handleDeleteReview}
              onEdit={handleOpenEditReview}
            />
          ))}
        </div>
      )}

      <ReviewFormModal
  key={editingReview?.id ?? 'new'}
  isOpen={isReviewModalOpen}
  onClose={handleCloseReviewModal}
  onSubmit={handleSubmitReview}
  initialData={editingReview}
/>
    </div>
  );
}
