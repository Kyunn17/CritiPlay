import type { Review } from '../types';
import { authService } from './authService';

const API_URL = 'http://127.0.0.1:8000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`
});

export const reviewService = {
  getReviewsByGameId: async (gameId: string): Promise<Review[]> => {
    const response = await fetch(`${API_URL}/games/${gameId}/reviews`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

return data.map((review: Review) => ({
  ...review,
  ratingGameplay: Number(review.ratingGameplay),
  ratingStory: Number(review.ratingStory),
  ratingVisual: Number(review.ratingVisual),
  ratingOverall: Number(review.ratingOverall)
}));
  },

  saveReview: async (
    gameId: string,
    ratingGameplay: number,
    ratingStory: number,
    ratingVisual: number,
    reviewText: string
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        game_id: gameId,
        rating_gameplay: ratingGameplay,
        rating_story: ratingStory,
        rating_visual: ratingVisual,
        review_text: reviewText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menyimpan review');
    }
  },

  updateReview: async (
    id: string,
    ratingGameplay: number,
    ratingStory: number,
    ratingVisual: number,
    reviewText: string
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        rating_gameplay: ratingGameplay,
        rating_story: ratingStory,
        rating_visual: ratingVisual,
        review_text: reviewText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengupdate review');
    }
  },

  deleteReview: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    return response.ok;
  }
};