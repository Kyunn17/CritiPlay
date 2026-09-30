import type { Game, ExternalGame } from '../types';
import { authService } from './authService'; // Import authService

interface TopRatedGameResponse {
  id: string | number;
  igdbId: number;
  name: string;
  coverUrl: string | null;
  releaseYear: string | null;
  genres: string[];
  platforms: string[];
  summary: string | null;
  avgGameplay: number;
  avgStory: number;
  avgVisual: number;
  avgOverall: number;
  totalReviews: number;
}

const API_URL = 'http://127.0.0.1:8000/api/games';

// Fungsi untuk menyelipkan Token di setiap request
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`
});

export const gameService = {
  getAllGames: async (): Promise<Game[]> => {
    const response = await fetch(API_URL, { headers: getHeaders() });
    // Jika token tidak valid / ditolak, kembalikan array kosong agar React tidak crash
    if (!response.ok) return []; 
    return response.json();
  },

  getGameById: async (id: string): Promise<Game | undefined> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getHeaders()
  });

  if (!response.ok) return undefined;

  return response.json();
},


 searchGames: async (query: string): Promise<ExternalGame[]> => {
  console.log('TOKEN:', authService.getToken());

  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error('Gagal mencari game');
  }

  const data: {
    igdb_id: number;
    name: string;
    cover_url: string | null;
    release_year: string | null;
    genres: string[];
    platforms: string[];
  }[] = await response.json();

  return data.map((game) => ({
    igdb_id: game.igdb_id,
    name: game.name,
    cover_url: game.cover_url,
    release_year: game.release_year,
    genres: game.genres,
    platforms: game.platforms,
  }));
},

importGame: async (igdbId: number): Promise<Game> => {
  const response = await fetch(`${API_URL}/import`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      igdb_id: igdbId,
    }),
  });

  if (!response.ok) {
    throw new Error('Gagal mengimport game');
  }

  const data = await response.json();

  return {
  id: String(data.game.id),
  igdb_id: data.game.igdb_id,
  name: data.game.name,
  cover_url: data.game.cover_url,
  release_year: data.game.release_year,
  genres: data.game.genres ?? [],
  platforms: data.game.platforms ?? [],
  summary: data.game.summary ?? null,

  avgGameplay: Number(data.game.avgGameplay ?? 0),
  avgStory: Number(data.game.avgStory ?? 0),
  avgVisual: Number(data.game.avgVisual ?? 0),
  avgOverall: Number(data.game.avgOverall ?? 0),
  totalReviews: Number(data.game.totalReviews ?? 0),
};
},

  addGame: async (newGameData: Omit<Game, 'id'>): Promise<Game> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newGameData)
    });
    const data = await response.json();
    return { ...newGameData, id: data.id }; 
  },

  updateGame: async (id: string, updatedData: Partial<Game>): Promise<Game | undefined> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) return undefined;
    return { id, ...updatedData } as Game;
  },

  deleteGame: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  getTopRatedGames: async (
  type: 'overall' | 'gameplay' | 'story' | 'visual'
): Promise<Game[]> => {
  const response = await fetch(
    `${API_URL}/top-rated?type=${type}`,
    {
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    return [];
  }

  const data: TopRatedGameResponse[] = await response.json();

  return data.map((game) => ({
    id: String(game.id),
    igdb_id: game.igdbId,
    name: game.name,
    cover_url: game.coverUrl,
    release_year: game.releaseYear,
    genres: game.genres ?? [],
    platforms: game.platforms ?? [],
    summary: game.summary ?? null,
    avgGameplay: Number(game.avgGameplay ?? 0),
    avgStory: Number(game.avgStory ?? 0),
    avgVisual: Number(game.avgVisual ?? 0),
    avgOverall: Number(game.avgOverall ?? 0),
    totalReviews: Number(game.totalReviews ?? 0)
  }));
},
};