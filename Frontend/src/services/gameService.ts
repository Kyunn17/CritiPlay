import type { Game, ExternalGame } from '../types';
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
  }
};