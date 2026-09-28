import type { Game } from '../types';
import { authService } from './authService'; // Import authService

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
    const response = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
    if (!response.ok) return undefined;
    return response.json();
  },

  getGameByIgdbId: async (id: string): Promise<Game | undefined> => {
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(id)}`, {
    headers: getHeaders()
  });

  if (!response.ok) return undefined;

  const data: {
    igdb_id: number;
    name: string;
    cover_url: string | null;
    release_year: string;
    genres: string[];
    platforms: string[];
  }[] = await response.json();

  const game = data.find((game) => String(game.igdb_id) === id);

  if (!game) return undefined;

  return {
    id: String(game.igdb_id),
    title: game.name,
    coverImage: game.cover_url ?? '',
    developer: game.platforms.join(', '),
    releaseDate: game.release_year,
    genres: game.genres,
  };
},

  searchGames: async (query: string): Promise<Game[]> => {
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
    release_year: string;
    genres: string[];
    platforms: string[];
  }[] = await response.json();

  return data.map((game) => ({
    id: String(game.igdb_id),
    title: game.name,
    coverImage: game.cover_url ?? '',
    developer: game.platforms.join(', '),
    releaseDate: game.release_year,
    genres: game.genres,
  }));
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
  }
};